import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const { id } = await params; if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  const database = await db(); const query = { _id: new ObjectId(id) }; const file = await database.collection("notes").findOne(query) ?? await database.collection("assignments").findOne(query) ?? (session.role === "admin" ? await database.collection("assignmentSubmissions").findOne(query) : null);
  if (!file?.bytes) return NextResponse.json({ error: "File not found" }, { status: 404 }); return new NextResponse(file.bytes.buffer as ArrayBuffer, { headers: { "Content-Type": file.contentType ?? "application/pdf", "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName ?? "document.pdf")}"` } });
}
