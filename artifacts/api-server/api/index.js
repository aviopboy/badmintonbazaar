// Vercel serverless entry point.
// build.mjs bundles the Express app into dist/handler.mjs — Vercel picks it up here.
export { default } from '../dist/handler.mjs';
