import { createTRPCRouter, publicProcedure } from "../trpc";

export const rankingRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      orderBy: {
        submissionCount: "desc",
      },
    });
    return users.map((user, index) => ({
      rank: index + 1,
      userUuid: user.uuid,
      nickname: user.nickname,
      score: user.submissionCount,
    }));
  }),
});
