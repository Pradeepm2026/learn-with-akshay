import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function GET() { try { const session = await requireRole(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json(await (await db()).collection("subjects").find().sort({ name: 1 }).toArray()); } catch { return NextResponse.json({ error: "Could not connect to MongoDB." }, { status: 503 }); } }
export async function POST(request: Request) {
  const session = await requireRole("admin"); if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { name } = await request.json(); if (!name?.trim()) return NextResponse.json({ error: "Subject name is required." }, { status: 400 });
  const subjects = (await db()).collection("subjects"); if (await subjects.findOne({ name: { $regex: `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } })) return NextResponse.json({ error: "This subject already exists." }, { status: 409 });
  const result = await subjects.insertOne({ name: name.trim(), createdAt: new Date() }); return NextResponse.json({ id: result.insertedId.toString(), name: name.trim() }, { status: 201 });
}
