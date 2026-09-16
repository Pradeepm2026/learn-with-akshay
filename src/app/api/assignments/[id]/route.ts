import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await requireRole("admin")) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid assignment." }, { status: 400 });
    const database = await db(); const assignmentId = new ObjectId(id);
    const result = await database.collection("assignments").deleteOne({ _id: assignmentId });
    if (!result.deletedCount) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
    await database.collection("assignmentSubmissions").deleteMany({ assignmentId });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not connect to MongoDB." }, { status: 503 }); }
}
