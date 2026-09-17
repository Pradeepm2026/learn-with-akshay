import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("student"); if (!session) return NextResponse.json({ error: "Student login required" }, { status: 403 });
  const { id } = await params; if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid quiz" }, { status: 400 });
  const quiz = await (await db()).collection("quizzes").findOne({ _id: new ObjectId(id), published: true });
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  const { answers = [], submissionId } = await request.json();
  const attempts = (await db()).collection("quizAttempts"); const userId = new ObjectId(session.userId);
  const existing = await attempts.findOne({ quizId: quiz._id, userId });
  if (typeof submissionId === "string" && submissionId && existing?.submissionId === submissionId) {
    return NextResponse.json({ correct: existing.correct, incorrect: existing.incorrect, total: existing.total, attemptCount: Number(existing.attemptCount ?? 1) });
  }
  const attemptCount = Number(existing?.attemptCount ?? (existing ? 1 : 0));
  if (attemptCount >= 3) return NextResponse.json({ error: "You have already used all 3 attempts for this quiz." }, { status: 403 });
  const correct = quiz.questions.reduce((sum: number, question: { correctIndex: number }, index: number) => sum + (Number(answers[index]) === Number(question.correctIndex) ? 1 : 0), 0);
  const attempt = { quizId: quiz._id, userId, answers, correct, incorrect: quiz.questions.length - correct, total: quiz.questions.length, attemptCount: attemptCount + 1, submissionId: typeof submissionId === "string" ? submissionId : null, submittedAt: new Date() };
  await attempts.updateOne({ quizId: quiz._id, userId }, { $set: attempt }, { upsert: true });
  return NextResponse.json({ correct, incorrect: attempt.incorrect, total: attempt.total, attemptCount: attempt.attemptCount });
}
