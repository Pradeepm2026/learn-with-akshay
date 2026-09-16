import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/mongodb";

export async function POST(request: Request) {
  const { token, password } = await request.json(); if (!token || String(password ?? "").length < 8) return NextResponse.json({ error: "A valid token and password of at least 8 characters are required." }, { status: 400 });
  const database = await db(); const tokenHash = createHash("sha256").update(String(token)).digest("hex"); const reset = await database.collection("passwordResetTokens").findOne({ tokenHash, expiresAt: { $gt: new Date() } });
  if (!reset) return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
  await database.collection("users").updateOne({ _id: reset.userId }, { $set: { passwordHash: await bcrypt.hash(password, 12), updatedAt: new Date() } }); await database.collection("passwordResetTokens").deleteOne({ _id: reset._id });
  return NextResponse.json({ message: "Password updated. You can now log in." });
}
