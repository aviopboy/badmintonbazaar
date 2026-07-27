import { customFetch } from "./custom-fetch";

/**
 * Delete an order by ID (admin only — used to remove approved/rejected orders).
 * Returns void on success (204 No Content).
 */
export async function deleteOrder(id: string): Promise<void> {
  await customFetch<void>(`/api/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
