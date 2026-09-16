import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createToken, withSession } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  if (!name?.trim() || !email?.trim() || String(password ?? "").length < 8) return NextResponse.json({ error: "Name, email, and a password of at least 8 characters are required." }, { status: 400 });
  const users = (await db()).collection("users"); const normalizedEmail = String(email).toLowerCase().trim();
  if (await users.findOne({ email: normalizedEmail })) return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
  const result = await users.insertOne({ name: name.trim(), email: normalizedEmail, role: "student", passwordHash: await bcrypt.hash(password, 12), active: true, createdAt: new Date() });
  const token = await createToken({ userId: result.insertedId.toString(), role: "student", name: name.trim(), email: normalizedEmail });
  return withSession(NextResponse.json({ user: { name: name.trim(), email: normalizedEmail, role: "student" } }, { status: 201 }), token);
}
