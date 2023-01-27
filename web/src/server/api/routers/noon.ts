import { createTRPCRouter, publicProcedure } from "../trpc";

export const noonRouter = createTRPCRouter({
  getCount: publicProcedure.query(({ ctx }) => {
    return 135;
  }),
});
