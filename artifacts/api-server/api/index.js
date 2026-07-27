// Vercel serverless entry point.
// esbuild pre-builds api/index.ts → dist/vercel.mjs so Vercel can use plain JS
// without running its own TypeScript compilation on the monorepo source.
export { default } from "../dist/vercel/index.mjs";
