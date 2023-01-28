import { S3 } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { first, groupBy } from "lodash";
import { v4 } from "uuid";
import { z } from "zod";
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
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
          submitCount: submisssionsGrouped[option.id]?.length || 0,
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
      }
    ),

  postQuestion: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ ctx, input: { url } }) => {
      // // download url and save to s3
      const s3 = new S3({
        region: "ap-northeast-2",
        credentials: {
          accessKeyId: "AKIATVRAJUBDTJPNQJG4",
          secretAccessKey: "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",
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const imageData = (await axios.get(url, { responseType: "arraybuffer" }))
        .data;
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

      const inferenceResult = await new InferenceRequestService().getMultiple([
        url,
      ]);

      const firstInferenceResult = inferenceResult[0];
      if (!firstInferenceResult) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid url",
        });
      }

      const translationService = new TranslationService();

      const createdOptions = await Promise.all(
        firstInferenceResult.result.map(async (r) => ({
          text: await translationService.enToKr(r.result),
          textEn: r.result,
          sourceType: "model",
          sourceId: r.model,
        }))
      );

      console.log(createdOptions);

      const result = await ctx.prisma.question.create({
        data: {
          url,
          s3Url: `https://sparcs-2023-startup-hackathon-n-1.s3.ap-northeast-2.amazonaws.com/${key}`,
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
      });
      if (!question) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid question",
        });
      }

      const result = await ctx.prisma.option.create({
        data: {
          text,
          sourceType: "user",
          sourceId: userUuid,
          questionId,
        },
      });

      return result;
    }),
});
