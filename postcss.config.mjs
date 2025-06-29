// const config = {
//   plugins: ["@tailwindcss/postcss"],
// };

// export default config;

// change the file for vercel deployment alligned with Tailwind v4.:
const config = {
  plugins: ["@tailwindcss/postcss", "autoprefixer"],
};

export default config;
