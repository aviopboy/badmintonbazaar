// Vercel serverless entry — exports the Express app without starting a server.
// This file is bundled by build.mjs into dist/handler.mjs with all workspace
// dependencies included, so Vercel never needs to resolve @workspace/* packages.
export { default } from "./app";
