// @ts-nocheck
// Vercel serverless entry point.
// esbuild (build.mjs) pre-builds src/vercel.ts → dist/vercel/vercel.mjs before
// this function is invoked. Vercel compiles this file but ts-nocheck prevents
// it from complaining about the .mjs import; Node loads the pre-built bundle.
export { default } from "../dist/vercel/vercel.mjs";
