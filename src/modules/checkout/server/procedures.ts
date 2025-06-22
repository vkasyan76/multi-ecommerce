import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { Media, Tenant } from "@payload-types";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

import { CheckoutMetadata, ProductMetadata } from "../types";
import { PLATFORM_FEE_PERCENTAGE } from "@/constants";

export const checkoutRouter = createTRPCRouter({
  // This procedure is used to verify if the user & create stripe account link
  verify: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.findByID({
      collection: "users",
      id: ctx.session?.user?.id,
      depth: 0, // user.tenants[0].tenant is going to be a string (tenant ID)
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    // we find the tenant via user and obtain stripe account id:
    const tenantId = user.tenants?.[0]?.tenant as string;
    const tenant = await ctx.db.findByID({
      collection: "tenants",
      id: tenantId,
    });
    if (!tenant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tenant not found",
      });
    }
    const accountLink = await stripe.accountLinks.create({
      account: tenant.stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_API_URL!}/admin`,
      return_url: `${process.env.NEXT_PUBLIC_API_URL!}/admin`,
      type: "account_onboarding",
    });
    if (!accountLink.url) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to create verification link",
      });
    }
    return { url: accountLink.url };
  }),

  purchase: protectedProcedure
    .input(
      z.object({
        productIds: z.array(z.string().min(1)),
        tenantSlug: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: input.productIds,
              },
            },
            {
              "tenant.slug": {
                equals: input.tenantSlug,
              },
            },
          ],
        },
      });
      // validation:
      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found",
        });
      }
      // find the tenant
      const tenantsData = await ctx.db.find({
        collection: "tenants",
        limit: 1,
        pagination: false,
        where: {
          slug: {
            equals: input.tenantSlug,
          },
        },
      });
      const tenant = tenantsData.docs[0];
      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }
      // Throw error if stripe details for tenant not submitted:
      if (!tenant.stripeDetailsSubmitted) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant not allowed to sell products.",
        });
      }

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        products.docs.map((product) => ({
          quantity: 1, // assuming that we only sell digital products
          price_data: {
            unit_amount: product.price * 100, // Stripe handles prices in cents
            currency: "usd", // assuming USD, you can make this dynamic
            product_data: {
              name: product.name,
              metadata: {
                stripeAccountId: tenant.stripeAccountId,
                id: product.id,
                name: product.name,
                price: product.price,
              } as ProductMetadata,
            },
          },
        }));

      const totalAmount = products.docs.reduce(
        (acc, item) => acc + item.price * 100,
        0
      ); // total order amount. set acc to 0.

      const platformFeeAmount = Math.round(
        totalAmount * (PLATFORM_FEE_PERCENTAGE / 100)
      ); // platform fee (currently 10%)

      const checkout = await stripe.checkout.sessions.create(
        {
          customer_email: ctx.session?.user?.email, // acc. to the spread in protected procedure in src\trpc\init.ts
          success_url: `${process.env.NEXT_PUBLIC_API_URL}/tenants/${input.tenantSlug}/checkout?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/tenants/${input.tenantSlug}/checkout?cancel=true`,
          mode: "payment",
          line_items: lineItems,
          invoice_creation: {
            enabled: true, // this will create an invoice for the purchase
          },
          metadata: {
            userId: ctx.session?.user?.id, // user id from the session
          } as CheckoutMetadata,
          payment_intent_data: {
            application_fee_amount: platformFeeAmount, // this is the platform fee that will be charged to the tenant
          },
        },
        { stripeAccount: tenant.stripeAccountId }
      );

      if (!checkout.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }
      return {
        url: checkout.url, // This URL is generated by Stripe every time you create a checkout session.
      };
    }),

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
