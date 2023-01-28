import { TRPCError } from "@trpc/server";
import { groupBy } from "lodash";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const questionRouter = createTRPCRouter({
  randomQuestion: publicProcedure
    .input(
      z.object({
        userUuid: z.string(),
      })
    )
    .query(async ({ ctx }) => {
      const question = await ctx.prisma.question.findFirstOrThrow({
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
});
