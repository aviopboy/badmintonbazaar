import { customFetch } from "./custom-fetch";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  admin: boolean;
  joined: string;
};

export async function listUsers(): Promise<ApiUser[]> {
  return customFetch<ApiUser[]>("/api/users", { method: "GET" });
}

export async function createUser(user: ApiUser): Promise<ApiUser> {
  return customFetch<ApiUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export async function patchUser(id: string, patch: Partial<Pick<ApiUser, "admin" | "name" | "email" | "password">>): Promise<ApiUser> {
  return customFetch<ApiUser>(`/api/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await customFetch<void>(`/api/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
