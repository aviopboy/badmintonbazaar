// Vercel serverless entry point — exports the Express app directly.
// Vercel's @vercel/node runtime calls this as a request handler.
import app from "../src/app.js";

export default app;
