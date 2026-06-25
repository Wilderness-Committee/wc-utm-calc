import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyToken } from "@/lib/auth";

export async function requireAdmin(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifyToken(token, "admin");
}
