import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const router = Router();

function isValidUserBody(
  body: unknown,
): body is {
  id: string;
  name: string;
  email: string;
  password: string;
  admin?: boolean;
  joined: string;
} {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.id === "string" &&
    b.id.length > 0 &&
    typeof b.name === "string" &&
    b.name.length > 0 &&
    typeof b.email === "string" &&
    b.email.includes("@") &&
    typeof b.password === "string" &&
    b.password.length > 0 &&
    typeof b.joined === "string"
  );
}

function isValidPatchBody(
  body: unknown,
): body is { admin?: boolean; name?: string; email?: string; password?: string } {
  if (!body || typeof body !== "object") return false;
  return true; // flexible patch — individual fields checked below
}

function toApiUser(row: typeof usersTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    admin: row.admin,
    joined: row.joined,
  };
}

// List all users
router.get("/users", async (_req, res): Promise<void> => {
  try {
    const rows = await db.select().from(usersTable);
    res.json(rows.map(toApiUser));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const cause = err instanceof Error && err.cause instanceof Error ? err.cause.message : undefined;
    res.status(500).json({ error: message, cause, DATABASE_URL_SET: !!process.env.DATABASE_URL });
  }
});

// Create / upsert user (idempotent by email)
router.post("/users", async (req, res): Promise<void> => {
  try {
    if (!isValidUserBody(req.body)) {
      res.status(400).json({ error: "Invalid user body" });
      return;
    }
    const data = req.body;

    // Check if user already exists by email
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email.toLowerCase()));

    if (existing[0]) {
      res.status(200).json(toApiUser(existing[0]));
      return;
    }

    const [created] = await db
      .insert(usersTable)
      .values({
        id: data.id,
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        admin: data.admin ?? false,
        joined: data.joined,
      })
      .returning();

    res.status(201).json(toApiUser(created));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// Patch user (toggle admin, update details)
router.patch("/users/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidPatchBody(req.body)) {
      res.status(400).json({ error: "Invalid patch body" });
      return;
    }
    const patch = req.body as {
      admin?: boolean;
      name?: string;
      email?: string;
      password?: string;
    };

    const updates: Partial<typeof usersTable.$inferInsert> = {};
    if (patch.admin !== undefined) updates.admin = patch.admin;
    if (patch.name !== undefined) updates.name = patch.name;
    if (patch.email !== undefined) updates.email = patch.email.toLowerCase();
    if (patch.password !== undefined) updates.password = patch.password;

    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(toApiUser(updated));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// Delete user
router.delete("/users/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

export default router;
