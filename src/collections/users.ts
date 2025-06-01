import type { CollectionConfig } from "payload";
import { tenantsArrayField } from "@payloadcms/plugin-multi-tenant/fields";

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: "tenants",
  tenantsCollectionSlug: "tenants",
  tenantsArrayTenantFieldName: "tenant",
  arrayFieldAccess: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  tenantFieldAccess: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
});

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      name: "username",
      required: true,
      unique: true,
      type: "text",
    },
    {
      admin: { position: "sidebar" },
      name: "roles",
      type: "select",
      defaultValue: ["user"],
      hasMany: true,
      options: ["super-admin", "user"],
    },
    {
      ...defaultTenantArrayField,
      // to display the tenants in the sidebar: || {} part is important: if defaultTenantArrayField.admin is undefined, this ensures you don't get an error when spreading.
      admin: {
        ...(defaultTenantArrayField.admin || {}),
        position: "sidebar",
      },
    },
  ],
};
