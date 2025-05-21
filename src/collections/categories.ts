import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name", // This will enusre that category names are shown, not the IDs
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug", // URL-friendly version of the name (example: "clothing", "electronics")
      type: "text",
      required: true,
      unique: true, // Each slug must be unique (no duplicates)
      index: true, // Indexed for faster database lookup
    },
    {
      name: "color", // Optional field to associate a color with the category
      type: "text",
    },
    {
      name: "parent", // Reference to a "parent" category (for building category trees)
      type: "relationship", // Creates a relationship with another category
      relationTo: "categories", // It relates to the same "categories" collection
      hasMany: false, // Only one parent allowed (not multiple)
    },
    {
      name: "subcategories", // Links all subcategories belonging to a parent
      type: "join", // A Payload special type to join related items
      collection: "categories", // Also joins from the "categories" collection
      on: "parent", // Joins based on the "parent" field above
      hasMany: true, // A category can have many subcategories
    },
  ],
};
