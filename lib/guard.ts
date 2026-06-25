import { cookies } from "next/headers";
import { ADMIN_COOKIE, SITE_COOKIE, verifyToken } from "@/lib/auth";

export async function requireAdmin(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifyToken(token, "admin");
}

export async function requireSite(): Promise<boolean> {
  const token = cookies().get(SITE_COOKIE)?.value;
  return verifyToken(token, "site");
}
