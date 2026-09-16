import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createToken, withSession } from "@/lib/auth";
import { db } from "@/lib/mongodb";

function cleanEnvironmentValue(value: string | undefined, fallback: string) {
  return (value ?? fallback).trim().replace(/^['"]|['"]$/g, "");
}

export async function POST(request: Request) {
  const { email, password, expectedRole, mobile } = await request.json();
  const normalizedMobile = String(mobile ?? "").replace(/\D/g, "");
  if (normalizedMobile) {
    try {
      const user = await (await db()).collection("users").findOne({ mobile: normalizedMobile, active: { $ne: false } });
      if (!user || user.role !== "student") return NextResponse.json({ error: "Not registered. Contact admin for login." }, { status: 401 });
      const token = await createToken({ userId: user._id.toString(), role: "student", name: user.name, email: user.email ?? "" });
      return withSession(NextResponse.json({ user: { name: user.name, role: "student", mobile: normalizedMobile } }), token);
    } catch { return NextResponse.json({ error: "Could not connect to the student database. Check Vercel environment variables and MongoDB Atlas access." }, { status: 503 }); }
  }
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  const adminEmail = cleanEnvironmentValue(process.env.ADMIN_EMAIL, "adminakshay@gmail.com").toLowerCase();
  const adminPassword = cleanEnvironmentValue(process.env.ADMIN_PASSWORD, "Akshay@#2026");
  if (expectedRole === "admin" && String(email).toLowerCase().trim() === adminEmail && String(password) === adminPassword) {
    const token = await createToken({ userId: "fixed-admin", role: "admin", name: "Akshay Kumar", email: adminEmail });
    return withSession(NextResponse.json({ user: { name: "Akshay Kumar", role: "admin", email: adminEmail } }), token);
  }
  const user = await (await db()).collection("users").findOne({ email: String(email).toLowerCase(), active: { $ne: false } });
  if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  if (expectedRole && user.role !== expectedRole) return NextResponse.json({ error: "This login page is for administrators only." }, { status: 403 });
  const token = await createToken({ userId: user._id.toString(), role: user.role, name: user.name, email: user.email });
  return withSession(NextResponse.json({ user: { name: user.name, role: user.role, email: user.email } }), token);
}
