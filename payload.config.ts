import sharp from "sharp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { buildConfig } from "payload";
import { Media } from "./src/collections/media.ts";
import { Users } from "./src/collections/users.ts";
import { Categories } from "./src/collections/categories.ts";

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
  collections: [Users, Media, Categories],
  // cookiePrefix: "funroad",  // optional: if we want to change the cookie prefix
  plugins: [payloadCloudPlugin()],
  secret: process.env.PAYLOAD_SECRET || "",
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || "",
  }),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  sharp,
});
