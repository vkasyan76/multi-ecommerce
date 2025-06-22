import type { Stripe } from "stripe";
import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { ExpandedLineItem } from "@/modules/checkout/types";

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    // This ensures the event is genuine and from Stripe:
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (error! instanceof Error) {
      console.log(error);
    }

    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      {
        message: `Webhook Error: ${errorMessage}`,
      },
      { status: 400 }
    );
  }

  // If we pass try-catch block – add success & define permitted events & add payload:
  console.log("✅ Success:", event.id);

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "account.updated",
  ]; //array of strings

  const payload = await getPayload({ config });

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;

          console.log("ACCOUNT:", { account: event.account });

          if (!data.metadata?.userId) {
            throw new Error("User ID is required");
          }

          const user = await payload.findByID({
            collection: "users",
            id: data.metadata.userId,
          });

          if (!user) {
            throw new Error("User not found");
          }

          // expand with the methatada from the checkout purchase procedure
          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ["line_items.data.price.product"], // Stripe will return the full product object for every line item, not just the product ID.
            },

            {
              stripeAccount: event.account, // Stripe returns the full details for that specific connected account (i.e., the vendor/shop).
            }
          );

          if (
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ) {
            throw new Error("No line items found");
          }

          // add product metadata:
          const lineItems = expandedSession.line_items
            .data as ExpandedLineItem[];

          // create orders in the payload:
          for (const item of lineItems) {
            await payload.create({
              collection: "orders",
              data: {
                stripeCheckoutSessionId: data.id,
                stripeAccountId: event.account, // Stripe account (tenant) from the event: for multivendor modus
                user: user.id,
                product: item.price.product.metadata.id, // product id from the metadata
                name: item.price.product.name,
              },
            });
          }
          break;
        case "account.updated":
          data = event.data.object as Stripe.Account;

          await payload.update({
            collection: "tenants",
            where: { stripeAccountId: { equals: data.id } },
            // Sets your local Payload field stripeDetailsSubmitted to match the Stripe account’s details_submitted property.
            data: { stripeDetailsSubmitted: data.details_submitted },
          });
          break;

        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        {
          message: "Webhook handler failed",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
}
