import { S3 } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { first, groupBy, orderBy } from "lodash";
import { v4 } from "uuid";
import { z } from "zod";
import { serverEnv } from "../../../env/schema.mjs";
import { InferenceRequestService } from "../../util/InferenceRequestService";
import { TranslationService } from "../../util/TranslationService";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const questionRouter = createTRPCRouter({
  randomQuestion: publicProcedure
    .input(
      z.object({
        userUuid: z.string(),
      })
    )
    .query(async ({ ctx, input: { userUuid } }) => {
      // 유저가 응답하지 않은 모든 질문을 가져온다
      const userOptions = await ctx.prisma.option.findMany({
        select: { questionId: true },
        where: { submissions: { some: { userUuid } } },
      });
      const userQuestionIds = userOptions.map((option) => option.questionId);
      const allQuestions = await ctx.prisma.question.findMany({
        select: { id: true },
        where: { id: { notIn: userQuestionIds } },
        orderBy: {
          position: "desc",
          id: "asc",
        },
      });

      // 그 중에서 하나를 선택한다 (현재는 그냥 첫번째)
      const randomQuestionId = first(allQuestions)?.id;
      if (!randomQuestionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "이 유저는 모든 질문에 답변했습니다! 만세!",
        });
      }

      // 질문을 가져온다.
      const question = await ctx.prisma.question.findFirstOrThrow({
        where: { id: randomQuestionId },
        include: { options: true, submissions: true },
      });

      // 응답값을 만들기 위해 submission을 집게해 option을 만든다
      const submisssionsGrouped = groupBy(question.submissions, "optionId");
      const result = {
        id: question.id,
        url: question.url,
        options: question.options
          .filter((o) => !o.disabled)
          .slice(0, 3)
          .map((option) => ({
            id: option.id,
            text: option.text,
            submitCount:
              (submisssionsGrouped[option.id]?.length || 0) +
              option.scoreOffset,
          })),
      };
      return result;
    }),

  submitAnswer: publicProcedure
    .input(
      z.object({
        questionId: z.number(),
        optionId: z.number(),
        nickname: z.string(),
        userUuid: z.string().uuid(),
      })
    )
    .mutation(
      async ({ input: { questionId, optionId, userUuid, nickname }, ctx }) => {
        // validate question and option
        const question = await ctx.prisma.question.findFirst({
          where: {
            id: questionId,
          },
          include: {
            options: true,
          },
        });
        if (
          !question ||
          question.options.every((option) => option.id !== optionId)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid question or option",
          });
        }

        // sync user and nickname, increment submission count
        await ctx.prisma.user.upsert({
          where: { uuid: userUuid },
          update: { nickname, submissionCount: { increment: 1 } },
          create: { uuid: userUuid, nickname, submissionCount: 1 },
        });

        // save submission
        await ctx.prisma.submission.create({
          data: {
            questionId,
            optionId,
            userUuid,
          },
        });

        // 가장 많이 나타난 옵션을 찾고
        const submissionsByOption = await ctx.prisma.submission.findMany({
          where: { questionId },
          select: { optionId: true },
        });

        const mostOccuredOptionId = first(
          Object.entries(groupBy(submissionsByOption, "optionId")).sort(
            (a, b) => b[1].length - a[1].length
          )
        )?.[0];
        if (!mostOccuredOptionId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No option found",
          });
        }
        // 그 옵션을 Inference에 기록해준다
        const option = await ctx.prisma.option.findFirstOrThrow({
          where: { id: Number(mostOccuredOptionId) },
        });
        await ctx.prisma.inference.create({
          data: {
            url: question.url,
            optionId: option.id,
            result: option.text,
          },
        });
      }
    ),

  postQuestion: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ ctx, input: { url } }) => {
      // // download url and save to s3
      let s3Key: string | undefined;
      if (
        serverEnv.CUSTOM_AWS_ACCESS_KEY_ID &&
        serverEnv.CUSTOM_AWS_SECRET_ACCESS_KEY
      ) {
        const s3 = new S3({
          region: "ap-northeast-2",
          credentials: {
            accessKeyId: serverEnv.CUSTOM_AWS_ACCESS_KEY_ID,
            secretAccessKey: serverEnv.CUSTOM_AWS_SECRET_ACCESS_KEY,
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const imageData = (
          await axios.get(url, { responseType: "arraybuffer" })
        ).data;
        const extension: string = url.split(".").pop() as string;
        const key = `question/${v4()}.${extension}`;
        await s3
          .putObject({
            Bucket: "sparcs-2023-startup-hackathon-n-1",
            Key: key,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            Body: imageData,
          })
          .catch((e) => {
            console.log(e);
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid url",
              cause: e,
            });
          });
        s3Key = key;
      }

      // 기존 질문을 삭제한다
      await ctx.prisma.question.deleteMany({
        where: { url },
      });

      // python에서 inference 결과를 받아온다
      const inferenceResult = first(
        await new InferenceRequestService().getMultiple([url])
      );
      if (!inferenceResult) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid url",
        });
      }

      // inference 결과를 번역하고, 이를 통해서 생성할 옵션을 만든다
      const translationService = new TranslationService();
      const createdOptions = await Promise.all(
        inferenceResult.result.map(async (r) => ({
          text: await translationService.enToKr(
            r.result,
            `postquestion ${url}`
          ),
          textEn: r.result,
          sourceType: "model",
          sourceId: r.model,
        }))
      );

      // 첫 번째 옵션 기반으로 Inference 객체를 만듬
      const firstOption = first(createdOptions);
      if (firstOption) {
        await ctx.prisma.inference.create({
          data: {
            url,
            result: firstOption.text,
          },
        });
      }

      await ctx.prisma.question.create({
        data: {
          url,
          s3Url: s3Key
            ? `https://sparcs-2023-startup-hackathon-n-1.s3.ap-northeast-2.amazonaws.com/${s3Key}`
            : undefined,
          options: {
            create: createdOptions,
          },
        },
      });

      return createdOptions;
    }),

  addOption: publicProcedure
    .input(
      z.object({
        userUuid: z.string().uuid(),
        questionId: z.number(),
        text: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { userUuid, questionId, text } }) => {
      const question = await ctx.prisma.question.findFirst({
        where: {
          id: questionId,
        },
        include: {
          options: true,
        },
      });
      if (!question) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid question",
        });
      }

      // 만약 text가 기존 option이랑 whitespace 제외하고 같다면, 새로 만들지 않고 바로 종료한다.
      const existingOption = question.options.find(
        (o) => o.text.replace(/\s/g, "") === text.replace(/\s/g, "")
      );
      if (existingOption) {
        return existingOption;
      }

      // 가장 많이 투표된 두 옵션을 찾고, 그 두 옵션이 아닌 다른 옵션들은 disable 처리
      const existingOptions = await ctx.prisma.option.findMany({
        where: { questionId, disabled: false },
        include: { submissions: { select: { id: true } } },
      });
      const existingOptionsOrdered = orderBy(
        existingOptions,
        (o) => o.submissions.length,
        "desc"
      );
      const notTop2Options = existingOptionsOrdered.slice(2);
      await ctx.prisma.option.updateMany({
        where: { id: { in: notTop2Options.map((o) => o.id) } },
        data: { disabled: true },
      });

      const bestOptionSubmissionCount =
        existingOptionsOrdered[0]?.submissions?.length || 0;

      // 그 후에 옵션을 만들어서 이 옵션이 세 번째 옵션이 되도록 함. 이 때 현 1등과 동률이 되도록 함
      const result = await ctx.prisma.option.create({
        data: {
          text,
          sourceType: "user",
          sourceId: userUuid,
          questionId,
          scoreOffset: bestOptionSubmissionCount,
        },
      });

      return result;
    }),
});
