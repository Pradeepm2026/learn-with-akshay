import { NextResponse } from "next/server";
import { db } from "@/lib/mongodb";

export async function GET() {
  try {
    const stats = (await db()).collection("siteStats");
    const result = await stats.findOneAndUpdate(
      { key: "visitorCount" },
      { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true, returnDocument: "after" },
    );
    return NextResponse.json({ count: result?.count ?? 1, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Visitor counter is unavailable until MongoDB is configured." }, { status: 503 });
  }
}
