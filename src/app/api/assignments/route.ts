import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function GET() { const session = await requireRole(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const filter = session.role === "student" ? { active: true } : {}; return NextResponse.json(await (await db()).collection("assignments").find(filter).sort({ dueDate: 1 }).toArray()); }
export async function POST(request: Request) {
  const session = await requireRole("admin"); if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const form = await request.formData(); const title = String(form.get("title") ?? ""); const subjectId = String(form.get("subjectId") ?? ""); const file = form.get("file");
  if (!title || !ObjectId.isValid(subjectId) || !(file instanceof File) || file.type !== "application/pdf") return NextResponse.json({ error: "Title, subject and an assignment PDF are required." }, { status: 400 });
  const dueDate = String(form.get("dueDate") ?? ""); if (!dueDate) return NextResponse.json({ error: "A due date is required." }, { status: 400 });
  const result = await (await db()).collection("assignments").insertOne({ title, subjectId: new ObjectId(subjectId), dueDate, fileName: file.name, contentType: file.type, bytes: Buffer.from(await file.arrayBuffer()), active: true, createdBy: session.userId, createdAt: new Date() }); return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
}
