// Vercel serverless entry point — exports the Express app directly.
// Vercel's @vercel/node runtime calls this as a request handler.
// Built by esbuild (build.mjs) into dist/vercel/vercel.mjs;
// api/index.js re-exports from there so Vercel uses plain JS.
import app from "./app.js";

export default app;
