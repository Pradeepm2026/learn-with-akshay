import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type Role = "admin" | "student";
export type Session = { userId: string; role: Role; name: string; email: string };
const key = new TextEncoder().encode(process.env.JWT_SECRET ?? "change-this-in-production");

export async function createToken(session: Session) {
  return new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(key);
}
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("lwakshay_session")?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, key)).payload as unknown as Session; } catch { return null; }
}
export async function requireRole(role?: Role) {
  const session = await getSession();
  if (!session || (role && session.role !== role)) return null;
  return session;
}
export function withSession(response: NextResponse, token: string) {
  response.cookies.set("lwakshay_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
