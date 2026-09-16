import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await requireRole("admin"); if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    return NextResponse.json(await (await db()).collection("users").find({}, { projection: { passwordHash: 0 } }).sort({ name: 1 }).toArray());
  } catch { return NextResponse.json({ error: "Could not connect to MongoDB. Check your Atlas network access, then restart the app." }, { status: 503 }); }
}
export async function POST(request: Request) {
  try {
    const session = await requireRole("admin"); if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    const { name, email, password, role = "student", mobile } = await request.json();
    const normalizedMobile = String(mobile ?? "").replace(/\D/g, "");
    if (normalizedMobile) {
      if (!name?.trim() || normalizedMobile.length !== 10) return NextResponse.json({ error: "User name and a valid 10-digit mobile number are required." }, { status: 400 });
      const users = (await db()).collection("users");
      if (await users.findOne({ mobile: normalizedMobile })) return NextResponse.json({ error: "An account already exists for this mobile number." }, { status: 409 });
      const result = await users.insertOne({ name: name.trim(), mobile: normalizedMobile, role: "student", active: true, createdAt: new Date() });
      return NextResponse.json({ id: result.insertedId, name: name.trim(), mobile: normalizedMobile }, { status: 201 });
    }
    if (!name?.trim() || !email?.trim() || String(password ?? "").length < 8 || !["admin", "student"].includes(role)) return NextResponse.json({ error: "Name, valid email, role, and an 8-character password are required." }, { status: 400 });
    const users = (await db()).collection("users"); const normalizedEmail = String(email).toLowerCase().trim(); if (await users.findOne({ email: normalizedEmail })) return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    const result = await users.insertOne({ name: name.trim(), email: normalizedEmail, role, passwordHash: await bcrypt.hash(password, 12), active: true, createdAt: new Date() }); return NextResponse.json({ id: result.insertedId }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not connect to MongoDB. Check your Atlas network access, then restart the app." }, { status: 503 }); }
}
export async function DELETE(request: Request) {
  try {
    const session = await requireRole("admin"); if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const url = new URL(request.url); const mobile = url.searchParams.get("mobile")?.replace(/\D/g, ""); const name = url.searchParams.get("name")?.trim();
  if (!mobile || mobile.length !== 10 || !name) return NextResponse.json({ error: "Enter the registered user name and a valid 10-digit mobile number." }, { status: 400 });
  const result = await (await db()).collection("users").deleteOne({ mobile, role: "student", name });
    if (!result.deletedCount) return NextResponse.json({ error: "No user account was found for this mobile number." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not connect to MongoDB. Check your Atlas network access, then restart the app." }, { status: 503 }); }
}
