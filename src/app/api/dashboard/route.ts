import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

function indiaToday() {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function GET() {
  try {
    const session = await requireRole();
    if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const database = await db();
    const today = indiaToday();
    const [subjects, notes, allAssignments, quiz] = await Promise.all([
      database.collection("subjects").find().sort({ name: 1 }).toArray(),
      database.collection("notes").find({}, { projection: { bytes: 0 } }).sort({ createdAt: -1 }).toArray(),
      database.collection("assignments").find(session.role === "student" ? { active: true } : {}).sort({ dueDate: 1 }).toArray(),
      database.collection("quizzes").findOne({ published: true, availableOn: today }),
    ]);
    const subjectName = new Map(subjects.map((subject) => [subject._id.toString(), subject.name]));
    const assignments = allAssignments.map((assignment) => ({ id: assignment._id.toString(), title: assignment.title, subject: subjectName.get(assignment.subjectId?.toString()) ?? "General", dueDate: assignment.dueDate, fileName: assignment.fileName }));
    const data: Record<string, unknown> = {
      subjects: subjects.map((subject) => ({ id: subject._id.toString(), name: subject.name })),
      notes: notes.map((note) => ({ id: note._id.toString(), subjectId: note.subjectId.toString(), title: note.title, fileName: note.fileName })),
      assignments,
      quiz: quiz ? { id: quiz._id.toString(), title: quiz.title, subject: quiz.subject, questions: quiz.questions.map((question: { text: string; options: string[]; correctIndex: number; image?: unknown }, index: number) => ({ text: question.text, options: question.options, correctIndex: question.correctIndex, imageUrl: question.image ? `/api/quiz/${quiz._id.toString()}/questions/${index}/image` : null })), timeLimit: quiz.timeLimit ?? "", availableOn: quiz.availableOn } : null,
    };
    const userId = ObjectId.isValid(session.userId) ? new ObjectId(session.userId) : session.userId;
    if (session.role === "student") {
      const [attempt, submissions, leaderboard] = await Promise.all([
        quiz ? database.collection("quizAttempts").findOne({ quizId: quiz._id, userId }) : null,
        database.collection("assignmentSubmissions").find({ userId }).toArray(),
        quiz ? database.collection("quizAttempts").aggregate([{ $match: { quizId: quiz._id } }, { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "student" } }, { $unwind: "$student" }, { $sort: { correct: -1, submittedAt: 1 } }, { $project: { correct: 1, total: 1, "student.name": 1 } }]).toArray() : [],
      ]);
      data.attempt = attempt ? { correct: attempt.correct, incorrect: attempt.incorrect, total: attempt.total, attemptCount: Number(attempt.attemptCount ?? 1) } : null;
      data.submissions = submissions.map((submission) => ({ assignmentId: submission.assignmentId.toString(), fileName: submission.fileName, reviewStatus: submission.reviewStatus ?? null, id: submission._id.toString() }));
      data.leaderboard = leaderboard.map((entry, index) => ({ rank: index + 1, name: entry.student?.name ?? "Student", correct: entry.correct, total: entry.total }));
    } else {
      const [studentCount, attempts, submissions] = await Promise.all([
        database.collection("users").countDocuments({ role: "student", active: { $ne: false } }),
        quiz ? database.collection("quizAttempts").find({ quizId: quiz._id }).sort({ submittedAt: -1 }).toArray() : [],
        database.collection("assignmentSubmissions").aggregate([{ $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "student" } }, { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } }, { $project: { assignmentId: 1, fileName: 1, reviewStatus: 1, "student.name": 1 } }]).toArray(),
      ]);
      data.stats = { studentCount, attempts: attempts.length, averageScore: attempts.length ? Math.round(attempts.reduce((sum, item) => sum + ((item.correct / item.total) * 100), 0) / attempts.length) : null };
      data.reportRows = attempts.map((attempt) => ({ userId: attempt.userId, correct: attempt.correct, incorrect: attempt.incorrect, total: attempt.total }));
      const names = await database.collection("users").find({ _id: { $in: attempts.map((attempt) => attempt.userId).filter((id): id is ObjectId => id instanceof ObjectId) } }).toArray();
      const nameMap = new Map(names.map((user) => [user._id.toString(), user.name]));
      data.reportRows = attempts.map((attempt) => ({ userId: attempt.userId.toString(), name: nameMap.get(attempt.userId.toString()) ?? "Student", correct: attempt.correct, incorrect: attempt.incorrect, total: attempt.total }));
      data.submissions = submissions.map((submission) => ({ id: submission._id.toString(), assignmentId: submission.assignmentId.toString(), fileName: submission.fileName, reviewStatus: submission.reviewStatus ?? null, studentName: submission.student?.name ?? "Student" }));
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Could not load live data. Check the MongoDB connection and Atlas network access." }, { status: 503 });
  }
}
