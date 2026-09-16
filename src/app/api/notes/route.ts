import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function GET(request: Request) { const session = await requireRole(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const subjectId = new URL(request.url).searchParams.get("subjectId"); return NextResponse.json(await (await db()).collection("notes").find(subjectId && ObjectId.isValid(subjectId) ? { subjectId: new ObjectId(subjectId) } : {}).sort({ createdAt: -1 }).toArray()); }
export async function POST(request: Request) {
  const session = await requireRole("admin"); if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const form = await request.formData(); const file = form.get("file"); const subjectId = String(form.get("subjectId") ?? ""); const title = String(form.get("title") ?? "");
  if (!(file instanceof File) || !ObjectId.isValid(subjectId) || !title) return NextResponse.json({ error: "Title, subject and a PDF file are required." }, { status: 400 });
  if (file.type !== "application/pdf") return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  const result = await (await db()).collection("notes").insertOne({ title, subjectId: new ObjectId(subjectId), fileName: file.name, contentType: file.type, bytes: Buffer.from(await file.arrayBuffer()), createdAt: new Date() }); return NextResponse.json({ id: result.insertedId }, { status: 201 });
}
