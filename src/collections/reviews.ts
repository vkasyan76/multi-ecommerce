import type { CollectionConfig } from "payload";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: {
    useAsTitle: "description", // This will enusre that names are shown, not the IDs
  },
  fields: [
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1, // Minimum rating value
      max: 5, // Maximum rating value
    },
    {
      name: "product",
      type: "relationship", // Creates a relationship with another collection
      relationTo: "products", // It relates to "products" collection
      hasMany: false,
      required: true, // Each review must be associated with a product
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users", // It relates to "users" collection
      hasMany: false,
      required: true, // Each review must be associated with a user
    },
  ],
};
