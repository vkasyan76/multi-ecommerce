import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const reviewsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
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

      const reviewsData = await ctx.db.find({
        collection: "reviews",
        limit: 1,
        where: {
          and: [
            { product: { equals: product.id } }, // check if the review is for the product
            { user: { equals: ctx.session.user.id } }, // check if the user is the one who wrote it
          ],
        },
      });

      const review = reviewsData.docs[0];
      if (!review) {
        return null; // it is possible that we have no review for this product
      }
      return review;
    }),
  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().min(1, { message: "Rating is required" }).max(5),
        description: z
          .string()
          .min(1, { message: "Description is required" })
          .max(500, {
            message: "Description must be less than 500 characters",
          }),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
      // Check if the user has already reviewed this product
      const existingReviewsData = await ctx.db.find({
        collection: "reviews",
        where: {
          and: [
            { product: { equals: product.id } }, // check if the review is for the product
            { user: { equals: ctx.session.user.id } }, // check if the user is the one who wrote it
          ],
        },
      });
      if (existingReviewsData.docs.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reviewed this product.",
        });
      }
      const reviewData = {
        user: ctx.session.user.id,
        product: product.id,
        rating: input.rating,
        description: input.description,
      };
      const review = await ctx.db.create({
        collection: "reviews",
        data: reviewData,
      });

      return review;
    }),
  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        rating: z.number().min(1, { message: "Rating is required" }).max(5),
        description: z
          .string()
          .min(1, { message: "Description is required" })
          .max(500, {
            message: "Description must be less than 500 characters",
          }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingReview = await ctx.db.findByID({
        depth: 0, // we want just get ids, without populating: existingReview.user will be user ID
        collection: "reviews",
        id: input.reviewId,
      });

      if (!existingReview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      if (existingReview.user !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You  are not allowed to update this review.",
        });
      }

      const updatedData = {
        rating: input.rating,
        description: input.description,
      };
      const updatedReview = await ctx.db.update({
        collection: "reviews",
        id: input.reviewId,
        data: updatedData,
      });

      return updatedReview;
    }),
});
