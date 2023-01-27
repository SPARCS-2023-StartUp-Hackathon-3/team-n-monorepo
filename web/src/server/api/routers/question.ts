import { groupBy } from "lodash";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const questionRouter = createTRPCRouter({
  randomQuestion: publicProcedure.query(async ({ ctx }) => {
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
});
