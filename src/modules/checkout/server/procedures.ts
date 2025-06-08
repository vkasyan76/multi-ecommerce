import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Media, Tenant } from "@payload-types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const checkoutRouter = createTRPCRouter({
  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          id: {
            in: input.ids,
          },
        },
      });

      // validation
      if (data.totalDocs !== input.ids.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found",
        });
      }
      // total price for checkout sidebar. define as a const to always be a number
      const totalPrice = data.docs.reduce((acc, product) => {
        const price = Number(product.price);
        return acc + (isNaN(price) ? 0 : price);
      }, 0);

      return {
        ...data,
        // totalPrice: data.docs.reduce((acc, product) => acc + product.price, 0),
        totalPrice: totalPrice,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null, // ensure image is of type Media or null
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
