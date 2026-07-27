// Vercel serverless entry point.
// @vercel/node compiles this file and bundles all imports at deploy time,
// so we import the Express app directly from source — no pre-built bundle needed.
export { default } from "../src/vercel.js";
