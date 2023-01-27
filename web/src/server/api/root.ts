import { exampleRouter } from "./routers/example";
import { noonRouter } from "./routers/noon";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  noon: noonRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
