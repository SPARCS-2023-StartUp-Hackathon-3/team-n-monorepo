import { createTRPCRouter, publicProcedure } from "../trpc";

export const questionRouter = createTRPCRouter({
  randomQuestion: publicProcedure.query(async ({ ctx }) => {
    const question = await ctx.prisma.question.findFirstOrThrow({
      include: {
        options: true,
      },
    });

    const result = {
      id: question.id,
      url: question.url,
      options: question.options.map((option) => option.text),
    };
    return result;
  }),
});
