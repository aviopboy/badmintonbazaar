import { Router } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Debug endpoint — tests the DB connection and returns the real error if it fails.
// Remove once checkout is confirmed working.
router.get("/healthz/db", async (_req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() AS now, current_database() AS db");
    client.release();
    res.json({ ok: true, ...result.rows[0] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code    = (err as Record<string, unknown>)?.code;
    res.status(500).json({ ok: false, error: message, code, DATABASE_URL_SET: !!process.env.DATABASE_URL });
  }
});

export default router;
