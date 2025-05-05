// import { z } from "zod";
import { createTRPCRouter } from "../init";

import { categoriesRouter } from "@/modules/categories/server/procedures";

export const appRouter = createTRPCRouter({
  // hello: baseProcedure
  //   .input(
  //     z.object({
  //       text: z.string(),
  //     })
  //   )
  //   .query((opts) => {
  //     return {
  //       greeting: `hello ${opts.input.text}`,
  //     };
  //   }),
  categories: categoriesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
