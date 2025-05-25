import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category } from "@payload-types";
import type { Where } from "payload";
import { z } from "zod";

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // prepare a "where" object (by default empty):
      const where: Where = {};

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

      const data = await ctx.db.find({
        collection: "products",
        depth: 1, // populate "category" and "image"
        where,
      });

      // Artificial delay for development/testing:
      // await new Promise((resolve) => setTimeout(resolve, 5000));

      return data;
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
