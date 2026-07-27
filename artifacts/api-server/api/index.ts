// Vercel serverless entry point.
// Vercel looks for files in the /api directory and exposes them as serverless functions.
// We simply re-export the Express app — Vercel's @vercel/node adapter calls it as a handler.
import app from "../src/app";

export default app;
