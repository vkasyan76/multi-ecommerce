import { isSuperAdmin } from "../lib/access.ts";
import { Tenant } from "@payload-types";
import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  access: {
    create: ({ req }) => {
      if (isSuperAdmin(req.user)) return true; // Only super-admin can create products and the tenant if submitted Stripe details
      const tenant = req.user?.tenants?.[0]?.tenant as Tenant;
      return Boolean(tenant?.stripeDetailsSubmitted); // Check if the tenant submitted stripe details
    },
    delete: ({ req }) => isSuperAdmin(req.user), // Only super-admin can delete products | normal tenant can archive products
    // no other rules required becasue products are connected with tenants
  },
  admin: {
    useAsTitle: "name",
    description: "You must verify your account before creating products.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      // type: "textarea"
      type: "richText",
    },
    {
      name: "price",
      type: "number",
      required: true,
      admin: {
        description: "Price in USD",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "refundPolicy",
      type: "select",
      options: ["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"],
      defaultValue: "30-day",
    },
    {
      name: "content",
      type: "richText",
      // type: "textarea"
      admin: {
        description:
          "Protected content only visible to customers after purchase. Add product documentation, downloadable files, getting started guides, and bonus materials. Supports Markdown formatting.",
      },
    },
    {
      name: "isPrivate",
      label: "Private",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "If checked, this product will not be shown on the public storefront.",
      },
    },
    {
      name: "isArchived",
      label: "Archive",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "If checked, this product will be archieved.",
      },
    },
  ],
};
