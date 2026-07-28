// Vercel serverless function entry point.
// build.mjs (run as the Vercel buildCommand) produces dist/handler.mjs —
// a fully self-contained bundle with all workspace dependencies included.
export { default } from '../dist/handler.mjs';
