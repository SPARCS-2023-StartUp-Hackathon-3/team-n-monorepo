import { exampleRouter } from "./routers/example";
import { questionRouter } from "./routers/question";
import { rankingRouter } from "./routers/ranking";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  question: questionRouter,
  ranking: rankingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;