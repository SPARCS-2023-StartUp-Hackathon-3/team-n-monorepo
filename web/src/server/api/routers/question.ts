import { TRPCError } from "@trpc/server";
import { groupBy, sample } from "lodash";
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
    .query(async ({ ctx }) => {
      const allQuestionId = await ctx.prisma.question.findMany({
        select: {
          id: true,
        },
      });
      const randomQuestionId = sample(allQuestionId)!.id;

      const question = await ctx.prisma.question.findFirstOrThrow({
        where: {
          id: randomQuestionId,
        },
        include: {
          options: true,
          submissions: true,
        },
      });

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
        userUuid: z.string().uuid(),
      })
    )
    .mutation(async ({ input: { questionId, optionId, userUuid }, ctx }) => {
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

      // save submission
      await ctx.prisma.submission.create({
        data: {
          questionId,
          optionId,
          userUuid,
        },
      });
    }),

  postQuestion: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ ctx, input: { url } }) => {
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

      const result = await ctx.prisma.question.create({
        data: {
          url,
          options: {
            create: await Promise.all(
              firstInferenceResult.result.map(async (r) => ({
                text: await translationService.enToKr(r.result),
                textEn: r.result,
                sourceType: "model",
                sourceId: r.model,
              }))
            ),
          },
        },
      });

      return result;
    }),
});
