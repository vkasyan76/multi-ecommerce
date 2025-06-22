import { isSuperAdmin } from "../lib/access.ts";
import type { CollectionConfig } from "payload";

export const Tags: CollectionConfig = {
  slug: "tags",
  access: {
    read: () => true, // All users can read categories
    create: ({ req }) => isSuperAdmin(req.user), // Only super-admin can create / update / delete tags
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },

  admin: {
    useAsTitle: "name",
    hidden: ({ user }) => !isSuperAdmin(user), // Hide from admin panel if not super-admin
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
  ],
};
