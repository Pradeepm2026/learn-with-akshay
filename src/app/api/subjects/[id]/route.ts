import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await requireRole("admin")) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid subject." }, { status: 400 });
    const database = await db(); const subjectId = new ObjectId(id);
    await Promise.all([database.collection("notes").deleteMany({ subjectId }), database.collection("assignments").deleteMany({ subjectId })]);
    const result = await database.collection("subjects").deleteOne({ _id: subjectId });
    if (!result.deletedCount) return NextResponse.json({ error: "Subject not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not connect to MongoDB." }, { status: 503 }); }
}
