import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import {
  CreateOrderBody,
  ListOrdersQueryParams,
  ListOrdersResponse,
  ListOrdersResponseItem,
  UpdateOrderBody,
  UpdateOrderParams,
  UpdateOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toApiOrder(row: typeof ordersTable.$inferSelect) {
  return ListOrdersResponseItem.parse({
    ...row,
    total: Number(row.total),
    createdAt: row.createdAt.toISOString(),
  });
}

router.get("/orders", async (req, res): Promise<void> => {
  const parsedQuery = ListOrdersQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const rows = parsedQuery.data.email
    ? await db.select().from(ordersTable)
      .where(eq(ordersTable.email, parsedQuery.data.email.toLowerCase()))
      .orderBy(asc(ordersTable.createdAt))
    : await db.select().from(ordersTable).orderBy(asc(ordersTable.createdAt));

  res.json(ListOrdersResponse.parse(rows.map(toApiOrder)));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db.select().from(ordersTable)
    .where(eq(ordersTable.id, parsed.data.id));
  if (existing[0]) {
    res.status(200).json(toApiOrder(existing[0]));
    return;
  }

  const [created] = await db.insert(ordersTable).values({
    ...parsed.data,
    total: String(parsed.data.total),
    createdAt: new Date(parsed.data.createdAt),
  }).returning();

  res.status(201).json(toApiOrder(created));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse(req.params);
  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db.update(ordersTable)
    .set({
      status: parsed.data.status,
      reviewMessage: parsed.data.reviewMessage,
    })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(UpdateOrderResponse.parse(toApiOrder(updated)));
});

export default router;