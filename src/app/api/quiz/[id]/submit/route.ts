import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("student"); if (!session) return NextResponse.json({ error: "Student login required" }, { status: 403 });
  const { id } = await params; if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid quiz" }, { status: 400 });
  const quiz = await (await db()).collection("quizzes").findOne({ _id: new ObjectId(id), published: true });
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  const { answers = [] } = await request.json();
  const attempts = (await db()).collection("quizAttempts"); const userId = new ObjectId(session.userId);
  const existing = await attempts.findOne({ quizId: quiz._id, userId });
  const attemptCount = Number(existing?.attemptCount ?? (existing ? 1 : 0));
  if (attemptCount >= 3) return NextResponse.json({ error: "You have already used all 3 attempts for this quiz." }, { status: 403 });
  const correct = quiz.questions.reduce((sum: number, question: { correctIndex: number }, index: number) => sum + (Number(answers[index]) === Number(question.correctIndex) ? 1 : 0), 0);
  const attempt = { quizId: quiz._id, userId, answers, correct, incorrect: quiz.questions.length - correct, total: quiz.questions.length, attemptCount: attemptCount + 1, submittedAt: new Date() };
  await attempts.updateOne({ quizId: quiz._id, userId }, { $set: attempt }, { upsert: true });
  return NextResponse.json({ correct, incorrect: attempt.incorrect, total: attempt.total, attemptCount: attempt.attemptCount });
}
