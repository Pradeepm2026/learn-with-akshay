import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function GET(_: Request, { params }: { params: Promise<{ id: string; index: string }> }) {
  const session = await requireRole(); if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, index } = await params; const questionIndex = Number(index);
  if (!ObjectId.isValid(id) || !Number.isInteger(questionIndex) || questionIndex < 0) return NextResponse.json({ error: "Invalid question image." }, { status: 400 });
  const quiz = await (await db()).collection("quizzes").findOne({ _id: new ObjectId(id), published: true }); const image = quiz?.questions?.[questionIndex]?.image;
  if (!image?.bytes) return NextResponse.json({ error: "Question image not found." }, { status: 404 });
  return new NextResponse(image.bytes.buffer as ArrayBuffer, { headers: { "Content-Type": image.contentType ?? "image/png", "Cache-Control": "private, max-age=3600" } });
}
