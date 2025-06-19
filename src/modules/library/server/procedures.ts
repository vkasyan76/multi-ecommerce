import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { Media, Tenant } from "@payload-types";
import { z } from "zod";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";

export const libraryRouter = createTRPCRouter({
  // getOne Procedure:
  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.db.find({
        collection: "orders",
        limit: 1,
        pagination: false,

        where: {
          and: [
            { product: { equals: input.productId } }, // check if the product is in the order
            { user: { equals: ctx.session.user.id } }, // check if the user is the one who ordered it
          ],
        },
      });
      // get the order data by simply getting first in the array:
      const order = ordersData.docs[0];

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found.",
        });
      }

      // find the product from the order:
      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found.",
        });
      }

      // just return the product:
      return product;
    }),

  // getMany Procedure:
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

      // add review data:
      const dataWithReviews = await Promise.all(
        productsData.docs.map(async (doc) => {
          // Fetch reviews for each product
          const reviewsData = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            where: {
              product: { equals: doc.id },
            },
          });
          return {
            ...doc,
            reviewCount: reviewsData.totalDocs, // add review count totalDocs is a standard property in the result of a .find()
            reviewRating:
              reviewsData.docs.length === 0
                ? 0 // if no reviews, set rating to 0
                : reviewsData.docs.reduce(
                    (acc, review) => acc + review.rating,
                    0
                  ) / reviewsData.totalDocs, // calculate average rating
          };
        })
      );

      return {
        ...productsData,
        docs: dataWithReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null, // ensure image is of type Media or null
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
