import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { sendResetEmail } from "@/lib/mail";

export async function POST(request: Request) {
  const { email } = await request.json(); const normalizedEmail = String(email ?? "").toLowerCase().trim();
  if (!normalizedEmail) return NextResponse.json({ error: "Email is required." }, { status: 400 });
  const database = await db(); const user = await database.collection("users").findOne({ email: normalizedEmail });
  if (user) { const token = randomBytes(32).toString("hex"); await database.collection("passwordResetTokens").deleteMany({ userId: user._id }); await database.collection("passwordResetTokens").insertOne({ userId: user._id, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 30 * 60 * 1000), createdAt: new Date() }); await sendResetEmail(normalizedEmail, token); }
  return NextResponse.json({ message: "If an account exists, a password-reset link has been sent." });
}
