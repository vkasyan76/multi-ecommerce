import type { CollectionConfig } from "payload";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: {
    useAsTitle: "slug",
  },
  fields: [
    {
      name: "name",
      required: true,
      type: "text",
      label: "Store Name",
      admin: {
        description: "This is the name of the store",
      },
    },
    {
      name: "slug",
      type: "text",
      index: true,
      required: true,
      unique: true,
      admin: {
        description:
          "This is the subdomain of the store  (e.g. [slug].yourdomain.com)",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    // to ensure that the tenant has verified their stripe account:
    {
      name: "stripeAccountId",
      type: "text",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "stripeDetailsSubmitted",
      type: "checkbox", // boolean
      admin: {
        readOnly: true,
        description:
          "You cannot create products until you submit your stripe details",
      },
    },
  ],
};
