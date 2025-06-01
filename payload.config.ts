import sharp from "sharp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { buildConfig } from "payload";
import { Media } from "./src/collections/media.ts";
import { Users } from "./src/collections/users.ts";
import { Categories } from "./src/collections/categories.ts";
import { Products } from "./src/collections/products.ts";
import { Tags } from "./src/collections/tags.ts";
import { Tenants } from "./src/collections/tenants.ts";
import { multiTenantPlugin } from "@payloadcms/plugin-multi-tenant";

import path from "path";

import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Categories, Products, Tags, Tenants],
  // cookiePrefix: "funroad",  // optional: if we want to change the cookie prefix
  plugins: [
    payloadCloudPlugin(),
    multiTenantPlugin({
      collections: {
        products: {},
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) =>
        Boolean(user?.roles?.includes("super-admin")),
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || "",
  }),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  sharp,
});
