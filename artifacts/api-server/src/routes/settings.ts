import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";

const router = Router();

// GET /settings/:key
router.get("/settings/:key", async (req, res): Promise<void> => {
  const { key } = req.params;
  const rows = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ key: rows[0].key, value: rows[0].value });
});

// PUT /settings/:key
router.put("/settings/:key", async (req, res): Promise<void> => {
  const { key } = req.params;
  const { value } = req.body as { value: string };
  if (typeof value !== "string") {
    res.status(400).json({ error: "value must be a string" });
    return;
  }
  const [row] = await db
    .insert(settingsTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value } })
    .returning();
  res.json({ key: row.key, value: row.value });
});

export default router;
