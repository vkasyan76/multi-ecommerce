import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category, Media } from "@payload-types";
import type { Sort, Where } from "payload";
import { z } from "zod";
import { sortValues } from "../hooks/search-params";
import { DEFAULT_LIMIT } from "@/constants";

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // prepare a "where" object (by default empty):
      const where: Where = {};

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

      const data = await ctx.db.find({
        collection: "products",
        depth: 1, // populate "category" and "image"
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
      });

      // Artificial delay for development/testing:
      // await new Promise((resolve) => setTimeout(resolve, 5000));

      // return data;
      // to modify getMany method, so that it properly assigns the type of image.

      return {
        ...data,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null, // ensure image is of type Media or null
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
