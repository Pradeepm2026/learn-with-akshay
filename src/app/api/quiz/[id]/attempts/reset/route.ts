import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Administrator login required" }, { status: 403 });

  const { id } = await params;
  const { userId } = await request.json();
  if (!ObjectId.isValid(id) || typeof userId !== "string" || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Invalid quiz or student." }, { status: 400 });
  }

  await (await db()).collection("quizAttempts").deleteMany({ quizId: new ObjectId(id), userId: new ObjectId(userId) });
  return NextResponse.json({ ok: true });
}
