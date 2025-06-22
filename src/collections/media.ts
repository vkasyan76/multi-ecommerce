import { isSuperAdmin } from "../lib/access.ts";
import type { CollectionConfig } from "payload";

// original tutorial:

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    delete: ({ req }) => isSuperAdmin(req.user), // Only super-admin can delete media
  },
  admin: {
    hidden: ({ user }) => !isSuperAdmin(user), // Hide from admin panel if not super-admin
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: true,
};

// ChatGPT suggested code with more options and image sizes:
// export const Media: CollectionConfig = {
//   slug: "media",
//   upload: {
//     staticDir: "media",
//     imageSizes: [
//       {
//         name: "thumbnail",
//         width: 400,
//         height: 300,
//         position: "centre",
//       },
//       {
//         name: "card",
//         width: 768,
//         height: 1024,
//         position: "centre",
//       },
//       {
//         name: "tablet",
//         width: 1024,
//         // By specifying `undefined` or leaving a height undefined,
//         // the image will be sized to a certain width,
//         // but it will retain its original aspect ratio
//         // and calculate a height automatically.
//         height: undefined,
//         position: "centre",
//       },
//     ],
//     adminThumbnail: "thumbnail",
//     mimeTypes: ["image/*"],
//   },
//   fields: [
//     {
//       name: "alt",
//       type: "text",
//     },
//   ],
// };
