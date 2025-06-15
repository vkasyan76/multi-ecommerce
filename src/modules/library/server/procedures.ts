import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { Media, Tenant } from "@payload-types";
import { z } from "zod";
import { DEFAULT_LIMIT } from "@/constants";

export const libraryRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.db.find({
        collection: "orders",
        depth: 0, // we want just get ids, without populating
        page: input.cursor,
        limit: input.limit,
        where: {
          user: {
            equals: ctx.session?.user.id, // use session user id
          },
        },
      });
      // extract product ids from orders
      const productIds = ordersData.docs.map((order) => order.product); // in this vase the product will be a string and not an object because we set depth to 0

      const productsData = await ctx.db.find({
        collection: "products",
        pagination: false,
        where: {
          id: {
            in: productIds,
          },
        },
      });

      return {
        ...productsData,
        docs: productsData.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null, // ensure image is of type Media or null
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
