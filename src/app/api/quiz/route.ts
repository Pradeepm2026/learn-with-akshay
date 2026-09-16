import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function GET() {
  const session = await requireRole(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const quizzes = await (await db()).collection("quizzes").find({ published: true }).sort({ availableOn: -1 }).limit(10).toArray();
  return NextResponse.json(quizzes);
}
export async function POST(request: Request) {
  const session = await requireRole("admin"); if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const body = await request.json();
  if (!body.title || !Array.isArray(body.questions) || !body.questions.length) return NextResponse.json({ error: "A title and at least one question are required." }, { status: 400 });
  if (body.questions.length > 20) return NextResponse.json({ error: "A daily quiz can have at most 20 questions." }, { status: 400 });
  const availableOn = String(body.availableOn ?? ""); if (!/^\d{4}-\d{2}-\d{2}$/.test(availableOn)) return NextResponse.json({ error: "A valid available date is required." }, { status: 400 });
  const questions = body.questions.map((q: { text: string; options: string[]; correctIndex: number; image?: { data?: string; contentType?: string; width?: number; height?: number } }) => {
    const image = q.image;
    if (!String(q.text ?? "").trim() && !image?.data) throw new Error("Each question needs text or an image.");
    if (image && (!image.width || !image.height || image.width > 1200 || image.height > 675 || !image.contentType?.startsWith("image/") || !image.data?.startsWith("data:image/"))) throw new Error("Question image must be 1200 × 675 px or smaller.");
    const base64 = image?.data?.split(",")[1]; if (base64 && Buffer.byteLength(base64, "base64") > 3 * 1024 * 1024) throw new Error("Question image must be 3 MB or smaller.");
    return { text: String(q.text ?? "").trim(), options: q.options, correctIndex: Number(q.correctIndex), image: base64 ? { bytes: Buffer.from(base64, "base64"), contentType: image?.contentType, width: image?.width, height: image?.height } : undefined };
  });
  const quiz = { title: body.title, subject: body.subject ?? "General", timeLimit: String(body.timeLimit ?? ""), questions, availableOn, published: Boolean(body.published), createdBy: session.userId, createdAt: new Date() };
  const result = await (await db()).collection("quizzes").insertOne(quiz);
  return NextResponse.json({ id: result.insertedId }, { status: 201 });
}
