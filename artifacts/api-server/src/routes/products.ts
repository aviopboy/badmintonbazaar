import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";

const router = Router();

function toApiProduct(row: typeof productsTable.$inferSelect) {
  return {
    ...row,
    price: Number(row.price),
    compareAt: row.compareAt != null ? Number(row.compareAt) : undefined,
    tags: (row.tags ?? []) as string[],
    featured: row.featured ?? false,
    badge: row.badge ?? undefined,
    showcase: row.showcase ?? undefined,
    availableSizes: (row.availableSizes ?? []) as string[],
    availableSpeeds: (row.availableSpeeds ?? []) as string[],
  };
}

// GET /products — public, no auth required
router.get("/products", async (_req, res): Promise<void> => {
  const rows = await db.select().from(productsTable);
  res.json(rows.map(toApiProduct));
});

// POST /products — admin only (enforced client-side for now)
router.post("/products", async (req, res): Promise<void> => {
  const { id, name, brand, category, price, compareAt, description, image, tags, featured, badge, showcase, availableSizes, availableSpeeds } = req.body as {
    id: string; name: string; brand: string; category: string;
    price: number; compareAt?: number; description: string;
    image: string; tags: string[]; featured?: boolean; badge?: string; showcase?: string;
    availableSizes?: string[]; availableSpeeds?: string[];
  };

  if (!id || !name || !brand || !category || price == null) {
    res.status(400).json({ error: "Missing required fields: id, name, brand, category, price" });
    return;
  }

  const existing = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (existing.length > 0) {
    // Upsert: return existing without error (idempotent for re-sync)
    res.status(200).json(toApiProduct(existing[0]));
    return;
  }

  const [row] = await db
    .insert(productsTable)
    .values({
      id,
      name,
      brand,
      category,
      price: String(price),
      compareAt: compareAt != null ? String(compareAt) : null,
      description: description ?? "",
      image: image ?? "",
      tags: tags ?? [],
      featured: featured ?? false,
      badge: badge ?? null,
      showcase: showcase ?? null,
      availableSizes: availableSizes ?? [],
      availableSpeeds: availableSpeeds ?? [],
    })
    .returning();

  res.status(201).json(toApiProduct(row));
});

// PUT /products/:id — update
router.put("/products/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const { name, brand, category, price, compareAt, description, image, tags, featured, badge, showcase, availableSizes, availableSpeeds } = req.body as {
    name: string; brand: string; category: string;
    price: number; compareAt?: number; description: string;
    image: string; tags: string[]; featured?: boolean; badge?: string; showcase?: string;
    availableSizes?: string[]; availableSpeeds?: string[];
  };

  const [row] = await db
    .update(productsTable)
    .set({
      name,
      brand,
      category,
      price: String(price),
      compareAt: compareAt != null ? String(compareAt) : null,
      description: description ?? "",
      image: image ?? "",
      tags: tags ?? [],
      featured: featured ?? false,
      badge: badge ?? null,
      showcase: showcase ?? null,
      availableSizes: availableSizes ?? [],
      availableSpeeds: availableSpeeds ?? [],
    })
    .where(eq(productsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(toApiProduct(row));
});

// DELETE /products/:id
router.delete("/products/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.status(204).send();
});

export default router;
