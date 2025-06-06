import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Media, Tenant } from "@payload-types";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

export const tenantsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // set-up for pagination:
      const tenantsData = await ctx.db.find({
        collection: "tenants",
        depth: 1, // tenant.image is  a type of media (default depth is 2, so this is optional)
        where: {
          slug: {
            equals: input.slug,
          },
        },
        limit: 1,
        pagination: false,
      });

      const tenant = tenantsData.docs[0];

      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      }

      return tenant as Tenant & { image: Media | null };
    }),
});
