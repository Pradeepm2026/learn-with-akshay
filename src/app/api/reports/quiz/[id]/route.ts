import { ObjectId } from "mongodb";
import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("admin"); if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { id } = await params; if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid quiz" }, { status: 400 });
  const database = await db(); const quiz = await database.collection("quizzes").findOne({ _id: new ObjectId(id) }); if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  const attempts = await database.collection("quizAttempts").aggregate([{ $match: { quizId: quiz._id } }, { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "student" } }, { $unwind: "$student" }, { $project: { correct: 1, incorrect: 1, total: 1, "student.name": 1, "student.email": 1 } }]).toArray();
  const doc = new PDFDocument({ margin: 48 }); const chunks: Buffer[] = []; doc.on("data", (chunk: Buffer) => chunks.push(chunk)); const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));
  doc.fontSize(21).fillColor("#172033").text("Learn.With.Akshay"); doc.fontSize(14).fillColor("#365bdc").text("Daily Quiz Report"); doc.moveDown().fontSize(16).fillColor("#172033").text(quiz.title); doc.fontSize(10).fillColor("#687386").text(`Subject: ${quiz.subject}   |   Attempts: ${attempts.length}`); doc.moveDown();
  doc.fillColor("#172033").fontSize(10).text("Student", 48, doc.y, { width: 220, continued: true }).text("Correct", { width: 80, continued: true }).text("Incorrect", { width: 85, continued: true }).text("Score"); doc.moveDown(.5); doc.strokeColor("#dfe4ed").moveTo(48, doc.y).lineTo(550, doc.y).stroke(); doc.moveDown(.5);
  attempts.forEach((attempt) => { const score = Math.round((attempt.correct / attempt.total) * 100); doc.fillColor("#172033").text(attempt.student.name ?? attempt.student.email, 48, doc.y, { width: 220, continued: true }).text(`${attempt.correct}/${attempt.total}`, { width: 80, continued: true }).text(String(attempt.incorrect), { width: 85, continued: true }).text(`${score}%`); doc.moveDown(.45); });
  doc.end(); const pdf = await done; return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="quiz-report-${id}.pdf"` } });
}
