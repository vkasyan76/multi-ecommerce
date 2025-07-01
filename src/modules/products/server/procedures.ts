import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category, Media, Tenant } from "@payload-types";
import type { Sort, Where } from "payload";

import { headers as Headers } from "next/headers";

import { z } from "zod";
import { sortValues } from "../hooks/search-params";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // We check if this user is logged in for checking if he already ordered this product.
      const headers = await Headers();
      const session = await ctx.db.auth({ headers });

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.id,
        depth: 2, // load "product.image", "product.tenant" and "product.tenant.image"
        select: {
          content: false, // it will not leak for the api: Restrict Purchased Content from payload API
        },
      });

      if (product.isArchived) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found or has been archived.",
        });
      }

      let isPurchased = false;

      // check if the current user purchased this product
      if (session.user) {
        const ordersData = await ctx.db.find({
          collection: "orders",
          pagination: false,
          limit: 1,
          where: {
            and: [
              { product: { equals: input.id } }, // check if the product is in the order
              { user: { equals: session.user.id } }, // check if the user is the one who ordered it
            ],
          },
        });
        // if we have any orders with this product and user (boolean):
        // isPurchased = ordersData.docs.length > 0;
        isPurchased = !!ordersData.docs[0];
      }

      // REVIEWS:
      // add reviews data for displaying in the progress bars using id of the product we want to fetch:
      const reviews = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        where: {
          product: { equals: input.id },
        },
      }); // check if the product is in the review)

      // Calculate the review count and average rating:

      const reviewRating =
        reviews.docs.length > 0
          ? reviews.docs.reduce((acc, review) => acc + review.rating, 0) /
            reviews.totalDocs
          : 0;

      const ratingDistribution: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      // increment the count for each rating in the distribution:
      if (reviews.totalDocs > 0) {
        reviews.docs.forEach((review) => {
          const rating = review.rating;
          if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1; // increment the count for the rating
          }
        });
        // convert counts to percentages:
        Object.keys(ratingDistribution).forEach((key) => {
          const rating = Number(key);
          const count = ratingDistribution[rating] || 0; // get the count for the rating.
          ratingDistribution[rating] = Math.round(
            (count / reviews.totalDocs) * 100
          ); // convert to percentage
        });
      }

      // return product;
      return {
        ...product,
        isPurchased, // add isPurchased flag
        image: product.image as Media | null, // ensure image is of type Media or null
        tenant: product.tenant as Tenant & { image: Media | null },
        // add reviews data:
        reviewRating, // average rating
        reviewCount: reviews.totalDocs, // total number of reviews
        ratingDistribution, // distribution of ratings
      };
    }),

  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        search: z.string().nullable().optional(), // search term
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSlug: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // prepare a "where" object (by default empty) | populate it with isArchived filter.:
      const where: Where = {
        isArchived: {
          not_equals: true, // Reverse explicit logic
        },
      };

      let sort: Sort = "-createdAt"; // default sort by createdAt DESC newest created

      // TODO: revisit the sorting filters

      if (input.sort === "curated") {
        sort = "-createdAt"; // for test purpose sort by name
      }

      if (input.sort === "hot_and_new") {
        sort = "+createdAt"; // for test purpose sort ASSC
      }

      if (input.sort === "trending") {
        sort = "+createdAt"; // default sort by createdAt DESC
      }

      // If both min and max are set: Filter prices between min and max (inclusive).
      // If only min is set: Filter for prices greater than or equal to min.
      // If only max is set:Filter for prices less than or equal to max.

      if (input.minPrice && input.maxPrice) {
        where.price = {
          greater_than_equal: input.minPrice,
          less_than_equal: input.maxPrice,
        };
      } else if (input.minPrice) {
        where.price = { greater_than_equal: input.minPrice };
      } else if (input.maxPrice) {
        where.price = { less_than_equal: input.maxPrice };
      }

      // the products will be shown in the tennat store if input.tenant is passed and in the markt space regardless if it is passed or not. But in the market place (where input.tenant is not passed) it will not be shown if marked private:

      if (input.tenantSlug) {
        where["tenant.slug"] = {
          equals: input.tenantSlug,
        };
      } else {
        // If we are loading products for public storefront (no tenantSlug)
        // Make sure to not load products set to "isPrivate: true" (using reverse not_equals logic)
        // These products are exclusively private to the tenant store
        where["isPrivate"] = {
          not_equals: true,
        };
      }

      if (input.category) {
        // if we want to check that the category exists, we can do it like this:
        // in order to load both – the subcategory and the main category.
        const categoriesData = await ctx.db.find({
          collection: "categories",
          limit: 1,
          depth: 1, // Populate subcategories, subcategories.[0] will be a type of "Category"
          pagination: false,
          where: {
            slug: {
              equals: input.category,
            },
          },
        });

        // console.log(JSON.stringify(categoriesData, null, 2));

        const formattedData = categoriesData.docs.map((doc) => ({
          ...doc,
          subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
            // Populate subcategories, subcategories.[0] will be a type of "Category"
            ...(doc as Category),
            subcategories: undefined,
          })),
        }));

        // prepare subcategories:
        const subcategoriesSlugs = [];

        // 1st in the array:
        const parentCategory = formattedData[0];

        if (parentCategory) {
          subcategoriesSlugs.push(
            ...parentCategory.subcategories.map(
              (subcategory) => subcategory.slug
            )
          );

          where["category.slug"] = {
            in: [parentCategory.slug, ...subcategoriesSlugs],
          };
        }

        // where["category.slug"] = {
        //   equals: parentCategory.slug,
        // };

        // if we dont load category data / dont care about subcategories - simple fetch:
        // where["category.slug"] = {
        //   equals: input.category,
        // };
      }

      if (input.tags && input.tags.length > 0) {
        where["tags.name"] = {
          in: input.tags,
        };
      }

      // search: We will query based on name of the product, not on the description which is a rich text element

      if (input.search) {
        where["name"] = {
          like: input.search, // search by name (like is not case-sensitive, contain is case-sensitive)
        };
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 2, // populate "category", "image", "tenant" & "tenant.image"
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
        select: {
          content: false,
        }, // it will not leak for the api: Restrict Purchased Content from payload API
      });

      // console.log(JSON.stringify(data.docs, null, 2));

      // Artificial delay for development/testing:
      // await new Promise((resolve) => setTimeout(resolve, 5000));

      // return data;
      // to modify getMany method, so that it properly assigns the type of image.

      // Integrate Reviews in Product View: with promise – we can use async inside map – it will return promises

      const dataWithReviews = await Promise.all(
        data.docs.map(async (doc) => {
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
        ...data,
        // docs: data.docs.map((doc) => ({
        docs: dataWithReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null, // ensure image is of type Media or null
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});

// Base procedure:
// import { baseProcedure, createTRPCRouter } from "@/trpc/init";

// export const productsRouter = createTRPCRouter({
//   getMany: baseProcedure.query(async ({ ctx }) => {
//     const data = await ctx.db.find({
//       collection: "products",
//       depth: 1, // populate "category" and "image"
//     });

//     return data;
//   }),
// });
