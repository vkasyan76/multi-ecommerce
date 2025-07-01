import sharp from "sharp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { buildConfig } from "payload";
import { Media } from "./src/collections/media.ts";
import { Users } from "./src/collections/users.ts";
import { Categories } from "./src/collections/categories.ts";
import { Products } from "./src/collections/products.ts";
import { Tags } from "./src/collections/tags.ts";
import { Tenants } from "./src/collections/tenants.ts";
import { Orders } from "./src/collections/orders.ts";
import { Reviews } from "./src/collections/reviews.ts";
import { multiTenantPlugin } from "@payloadcms/plugin-multi-tenant";

import path from "path";

import { fileURLToPath } from "url";
import { Config } from "@payload-types";
import { isSuperAdmin } from "./src/lib/access.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      // custom components can be added here
      // beforeNavLinks: ["@/components/stripe-verify#StripeVerify"],
      beforeNavLinks: ["./src/components/stripe-verify#StripeVerify"],
    },
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    Media,
    Categories,
    Products,
    Tags,
    Tenants,
    Orders,
    Reviews,
  ],
  // cookiePrefix: "funroad",  // optional: if we want to change the cookie prefix
  plugins: [
    payloadCloudPlugin(),
    multiTenantPlugin<Config>({
      collections: {
        products: {},
        media: {}, // private media accessable only to the tenant
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) =>
        // Boolean(user?.roles?.includes("super-admin")),
        isSuperAdmin(user), // import from "@/lib/access.ts"
    }),
    // vercel blob storage plugin:
    vercelBlobStorage({
      enabled: true, // Optional, defaults to true
      clientUploads: true, // to enable client uploads
      // Specify which collections should use Vercel Blob
      collections: {
        media: true,
      },
      // Token provided by Vercel once Blob storage is added to your Vercel project
      token: process.env.BLOB_READ_WRITE_TOKEN,
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
