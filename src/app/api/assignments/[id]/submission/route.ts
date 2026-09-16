import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("student"); if (!session) return NextResponse.json({ error: "Student login required" }, { status: 403 });
  const { id } = await params; if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid assignment" }, { status: 400 });
  const form = await request.formData(); const file = form.get("file"); if (!(file instanceof File) || file.type !== "application/pdf") return NextResponse.json({ error: "Upload one PDF answer file." }, { status: 400 });
  const assignmentId = new ObjectId(id); const assignment = await (await db()).collection("assignments").findOne({ _id: assignmentId, active: true }); if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  await (await db()).collection("assignmentSubmissions").updateOne({ assignmentId, userId: new ObjectId(session.userId) }, { $set: { assignmentId, userId: new ObjectId(session.userId), fileName: file.name, contentType: file.type, bytes: Buffer.from(await file.arrayBuffer()), status: "submitted", submittedAt: new Date() } }, { upsert: true }); return NextResponse.json({ status: "submitted" });
}
