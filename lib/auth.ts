import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyToken } from "./session";

export async function getAdmin() {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

/** Call at the top of every admin page and Server Action — the proxy is not the only line of defence. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export function adminCredentials() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;
  if (!password && process.env.NODE_ENV !== "production") return { username, password: "admin", insecure: true };
  return { username, password: password ?? "", insecure: false };
}
