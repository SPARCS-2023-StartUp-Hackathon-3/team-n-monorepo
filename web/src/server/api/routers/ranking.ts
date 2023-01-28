import { v4 } from "uuid";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const rankingRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return [
      {
        rank: 1,
        userUuid: v4(),
        nickname: "이재찬",
        score: 42,
      },
      {
        rank: 2,
        userUuid: v4(),
        nickname: "AAA",
        score: 41,
      },
      {
        rank: 3,
        userUuid: v4(),
        nickname: "BBB",
        score: 40,
      },
      {
        rank: 4,
        userUuid: v4(),
        nickname: "CCC",
        score: 4,
      },
      {
        rank: 5,
        userUuid: v4(),
        nickname: "DDD",
        score: 2,
      },
    ];
  }),
});
