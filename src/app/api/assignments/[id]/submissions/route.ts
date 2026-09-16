import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("admin"); if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { id } = await params; if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid assignment" }, { status: 400 });
  const submissions = await (await db()).collection("assignmentSubmissions").aggregate([{ $match: { assignmentId: new ObjectId(id) } }, { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "student" } }, { $unwind: "$student" }, { $project: { fileName: 1, submittedAt: 1, status: 1, reviewStatus: 1, "student.name": 1, "student.email": 1 } }]).toArray();
  return NextResponse.json(submissions);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await requireRole("admin")) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    const { id } = await params; const { submissionId, reviewStatus } = await request.json();
    if (!ObjectId.isValid(id) || !ObjectId.isValid(submissionId) || !["correct", "wrong"].includes(reviewStatus)) return NextResponse.json({ error: "Choose Correct or Wrong for this submission." }, { status: 400 });
    const result = await (await db()).collection("assignmentSubmissions").updateOne({ _id: new ObjectId(submissionId), assignmentId: new ObjectId(id) }, { $set: { reviewStatus, reviewedAt: new Date() } });
    if (!result.matchedCount) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    return NextResponse.json({ reviewStatus });
  } catch { return NextResponse.json({ error: "Could not save the assignment review." }, { status: 503 }); }
}
