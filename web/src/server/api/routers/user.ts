import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  syncNickname: publicProcedure
    .input(z.object({ nickname: z.string(), userUuid: z.string() }))
    .mutation(async ({ input: { nickname, userUuid }, ctx }) => {
      const submissionCount = await ctx.prisma.submission.count({
        where: { userUuid },
      });

      const user = await ctx.prisma.user.upsert({
        where: { uuid: userUuid },
        update: { nickname, submissionCount },
        create: { uuid: userUuid, nickname, submissionCount },
      });

      return user;
    }),
});
