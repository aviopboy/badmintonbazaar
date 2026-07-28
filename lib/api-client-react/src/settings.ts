import { customFetch } from "./custom-fetch";

export async function getSetting(key: string): Promise<string | null> {
  try {
    const data = await customFetch<{ key: string; value: string }>(`/api/settings/${encodeURIComponent(key)}`, { method: "GET" });
    return data.value;
  } catch {
    return null;
  }
}

export async function putSetting(key: string, value: string): Promise<void> {
  await customFetch<unknown>(`/api/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
}
