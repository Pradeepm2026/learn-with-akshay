"use client";

import { useEffect, useRef, useState } from "react";

type Role = "student" | "admin";
type AuthMode = "login" | "signup" | "forgot" | "reset";
type QuestionImage = { data: string; contentType: string; width: number; height: number };
type AdminQuestion = { question: string; options: string[]; correct: string; image?: QuestionImage; imageUrl?: string };
type CoachingAssignment = { id: string; title: string; subject: string; dueDate: string; fileName?: string };
type AssignmentSubmission = { id?: string; assignmentId: string; studentName?: string; fileName: string; reviewStatus?: "correct" | "wrong" | null };
type NoteItem = { id: string; subjectId: string; title: string; fileName: string };
type LiveQuiz = { id: string; title: string; subject: string; timeLimit: string; availableOn: string };

const subjects = ["Mathematics", "Science", "English"];

function Brand({ onPhotoClick }: { onPhotoClick?: () => void }) {
  return <div className="brand"><button type="button" className="brand-photo" onClick={onPhotoClick} aria-label="View Akshay's profile photo"><img src="/akshay-profile.png" alt="Akshay profile" /></button><span><strong>Learn.With.Akshay</strong><small>COACHING PORTAL</small></span></div>;
}

function Stat({ value, label }: { value: string; label: string }) {
  return <article className="stat"><strong>{value}</strong><span>{label}</span></article>;
}

function indiaToday() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function indiaDateCard() {
  const date = new Date();
  return {
    weekday: new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "long" }).format(date).toUpperCase(),
    day: new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", day: "2-digit" }).format(date),
    monthYear: new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "long", year: "numeric" }).format(date),
  };
}

function indiaGreeting() {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function Home() {
  const [role, setRole] = useState<Role>("student");
  const [tab, setTab] = useState("Dashboard");
  const [quizQuestions, setQuizQuestions] = useState<AdminQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>(Array(quizQuestions.length).fill(""));
  const [draftAnswer, setDraftAnswer] = useState("");
  const [quizScore, setQuizScore] = useState({ correct: 0, incorrect: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [quizAttemptsUsed, setQuizAttemptsUsed] = useState(0);
  const [quizDeadline, setQuizDeadline] = useState<number | null>(null);
  const [quizSecondsLeft, setQuizSecondsLeft] = useState<number | null>(null);
  const [login, setLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggedInName, setLoggedInName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [photoZoom, setPhotoZoom] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const answerFileRef = useRef<HTMLInputElement>(null);
  const [answerFileName, setAnswerFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminQuestionCount, setAdminQuestionCount] = useState(0);
  const [adminStatus, setAdminStatus] = useState("");
  const [adminSubject, setAdminSubject] = useState("Mathematics");
  const [customSubject, setCustomSubject] = useState("");
  const [adminQuestionText, setAdminQuestionText] = useState("");
  const [adminQuestionImage, setAdminQuestionImage] = useState<QuestionImage | null>(null);
  const [adminOptions, setAdminOptions] = useState(["", "", "", ""]);
  const [adminCorrectOption, setAdminCorrectOption] = useState("");
  const [adminQuestions, setAdminQuestions] = useState<AdminQuestion[]>([]);
  const [adminQuizTitle, setAdminQuizTitle] = useState("");
  const [adminTimeLimit, setAdminTimeLimit] = useState("");
  const [publishedQuiz, setPublishedQuiz] = useState<LiveQuiz | null>(null);
  const [courseSubjects, setCourseSubjects] = useState(subjects);
  const [subjectIds, setSubjectIds] = useState<Record<string, string>>({});
  const [noteItems, setNoteItems] = useState<NoteItem[]>([]);
  const [subjectsWithNotes, setSubjectsWithNotes] = useState<string[]>([]);
  const [notesBySubject, setNotesBySubject] = useState<Record<string, string[]>>({});
  const [newSubjectName, setNewSubjectName] = useState("");
  const [subjectToDelete, setSubjectToDelete] = useState("");
  const [notesSubject, setNotesSubject] = useState("Mathematics");
  const [notesFileName, setNotesFileName] = useState("");
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [noteDeleteSubject, setNoteDeleteSubject] = useState("");
  const [noteToDelete, setNoteToDelete] = useState("");
  const [assignments, setAssignments] = useState<CoachingAssignment[]>([]);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentSubject, setAssignmentSubject] = useState("Science");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentFileName, setAssignmentFileName] = useState("");
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState("");
  const [assignmentToUpload, setAssignmentToUpload] = useState("");
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);
  const [downloadedNotes, setDownloadedNotes] = useState<string[]>([]);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [registeredStudentCount, setRegisteredStudentCount] = useState(0);
  const [newUserName, setNewUserName] = useState("");
  const [newUserMobile, setNewUserMobile] = useState("");
  const [deleteUserName, setDeleteUserName] = useState("");
  const [deleteUserMobile, setDeleteUserMobile] = useState("");
  const [userAccountStatus, setUserAccountStatus] = useState("");
  const [assignmentReviewChoices, setAssignmentReviewChoices] = useState<Record<string, "correct" | "wrong">>({});
  const [liveReportRows, setLiveReportRows] = useState<Array<{ userId: string; name: string; correct: number; incorrect: number; total: number }>>([]);
  const [liveAdminStats, setLiveAdminStats] = useState({ studentCount: 0, attempts: 0, averageScore: null as number | null });
  const [leaderboard, setLeaderboard] = useState<Array<{ rank: number; name: string; correct: number; total: number }>>([]);
  const [showMoreLeaderboard, setShowMoreLeaderboard] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const tabHistory = useRef<string[]>([]);
  const currentTabRef = useRef(tab);
  const isGoingBackRef = useRef(false);
  const autoSubmittingQuizRef = useRef(false);
  const quizSubmissionRef = useRef<{ quizId: string; submissionId: string; inFlight: boolean } | null>(null);
  const today = indiaToday();
  const dateCard = indiaDateCard();
  const greeting = indiaGreeting();
  const isQuizLive = Boolean(publishedQuiz && publishedQuiz.availableOn === today);
  const canTakeQuiz = isQuizLive && quizAttemptsUsed < 3;
  const formattedQuizTime = quizSecondsLeft === null ? "--:--" : `${String(Math.floor(quizSecondsLeft / 60)).padStart(2, "0")}:${String(quizSecondsLeft % 60).padStart(2, "0")}`;
  const pendingAssignmentCount = assignments.filter((assignment) => !assignmentSubmissions.some((submission) => submission.assignmentId === assignment.id)).length;
  const tasksToday = pendingAssignmentCount + (submitted ? 0 : 1);
  const quizAccuracy = submitted ? `${Math.round((quizScore.correct / quizQuestions.length) * 100)}%` : "—";
  const quizAttemptCount = submitted ? 1 : 0;
  const averageQuizScore = submitted && quizQuestions.length ? `${Math.round((quizScore.correct / quizQuestions.length) * 100)}%` : "—";
  const nav = role === "admin" ? ["Dashboard", "Daily Quiz", "Subjects & Notes", "User Accounts", "Assignments", "Quiz Reports"] : ["Dashboard", "Daily Quiz", "Notes", "Assignments", "My Results"];
  const changeRole = (r: Role) => { tabHistory.current = []; currentTabRef.current = "Dashboard"; setRole(r); setTab("Dashboard"); };
  const goBack = () => { const previousTab = tabHistory.current.pop(); isGoingBackRef.current = true; setTab(previousTab ?? "Dashboard"); };
  const scrollToContinueLearning = () => { setTab("Dashboard"); window.setTimeout(() => document.getElementById("continue-learning")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  const openSubjectNotes = (subject: string) => { setSelectedSubject(subject); setTab("Notes"); };
  const readResponse = async <T,>(response: Response): Promise<T> => { const raw = await response.text(); try { return (raw ? JSON.parse(raw) : {}) as T; } catch { throw new Error("The server returned an invalid response. Please try again."); } };
  const loadLiveData = async () => {
    const response = await fetch("/api/dashboard", { cache: "no-store" }); const data = await readResponse<Record<string, unknown>>(response);
    if (!response.ok) throw new Error(String(data.error ?? "Could not load live data."));
    const liveSubjects = (data.subjects as Array<{ id: string; name: string }> ?? []); const liveNotes = (data.notes as NoteItem[] ?? []);
    setCourseSubjects(liveSubjects.map((subject) => subject.name)); setSubjectIds(Object.fromEntries(liveSubjects.map((subject) => [subject.name, subject.id]))); setNoteItems(liveNotes);
    const namesById = new Map(liveSubjects.map((subject) => [subject.id, subject.name])); const grouped: Record<string, string[]> = {};
    liveNotes.forEach((note) => { const subject = namesById.get(note.subjectId); if (subject) grouped[subject] = [...(grouped[subject] ?? []), note.title]; }); setNotesBySubject(grouped); setSubjectsWithNotes(Object.keys(grouped));
    setAssignments((data.assignments as CoachingAssignment[] ?? []).map((assignment) => ({ ...assignment, dueDate: assignment.dueDate ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(`${assignment.dueDate}T00:00:00`)) : "" })));
    const quiz = data.quiz as { id: string; title: string; subject: string; timeLimit?: string; availableOn: string; questions: Array<{ text: string; options: string[]; correctIndex: number; imageUrl?: string | null }> } | null;
    const loadedQuestions = quiz?.questions.map((question) => ({ question: question.text, options: question.options, correct: question.options[question.correctIndex], imageUrl: question.imageUrl ?? undefined })) ?? [];
    setPublishedQuiz(quiz ? { id: quiz.id, title: quiz.title, subject: quiz.subject, timeLimit: quiz.timeLimit ?? "", availableOn: quiz.availableOn } : null); setQuizQuestions(loadedQuestions); setQuizAnswers(Array(loadedQuestions.length).fill(""));
    const attempt = data.attempt as { correct: number; incorrect: number; total: number; attemptCount?: number } | null; setSubmitted(Boolean(attempt)); setQuizAttemptsUsed(attempt?.attemptCount ?? 0); setQuizScore(attempt ? { correct: attempt.correct, incorrect: attempt.incorrect } : { correct: 0, incorrect: 0 });
    setAssignmentSubmissions(data.submissions as AssignmentSubmission[] ?? []); setLeaderboard(data.leaderboard as Array<{ rank: number; name: string; correct: number; total: number }> ?? []); if (data.stats) setLiveAdminStats(data.stats as { studentCount: number; attempts: number; averageScore: number | null }); if (data.reportRows) setLiveReportRows(data.reportRows as Array<{ userId: string; name: string; correct: number; incorrect: number; total: number }>);
  };
  const selectAnswerPdf = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) { setUploadError("Please select a PDF file only."); event.target.value = ""; return; }
    if (!assignmentToUpload) { setUploadError("Please choose an assignment first."); return; }
    try { const form = new FormData(); form.append("file", file); const response = await fetch(`/api/assignments/${assignmentToUpload}/submission`, { method: "POST", body: form }); const data = await readResponse<{ error?: string }>(response); if (!response.ok) throw new Error(data.error ?? "Could not upload answer PDF."); setAnswerFileName(file.name); setUploadError(""); await loadLiveData(); } catch (error) { setUploadError(error instanceof Error ? error.message : "Could not upload answer PDF."); } finally { event.target.value = ""; }
  };
  const addAdminQuestion = () => {
    if (adminQuestionCount >= 20) {
      setAdminStatus("Daily quiz limit reached: only 20 questions can be added.");
      return;
    }
    const cleanOptions = adminOptions.map((option) => option.trim());
    if ((!adminQuestionText.trim() && !adminQuestionImage) || cleanOptions.some((option) => !option) || adminCorrectOption === "") {
      setAdminStatus("Add question text or one 1200 × 675 px image, all four options, and the correct answer.");
      return;
    }
    const correct = cleanOptions[Number(adminCorrectOption)];
    setAdminQuestions((questions) => [...questions, { question: adminQuestionText.trim(), options: cleanOptions, correct, image: adminQuestionImage ?? undefined }]);
    setAdminQuestionCount((count) => count + 1);
    setAdminQuestionText(""); setAdminQuestionImage(null); setAdminOptions(["", "", "", ""]); setAdminCorrectOption("");
    setAdminStatus("Question added to today’s quiz.");
  };
  const publishDailyQuiz = async () => {
    const subject = adminSubject === "Other" ? customSubject.trim() : adminSubject;
    if (!adminQuizTitle.trim() || !subject || !adminTimeLimit || !adminQuestions.length) { setAdminStatus("Enter quiz title, subject, time limit, and add at least one question."); return; }
    try { const response = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: adminQuizTitle.trim(), subject, timeLimit: adminTimeLimit, availableOn: today, published: true, questions: adminQuestions.map((question) => ({ text: question.question, options: question.options, correctIndex: question.options.indexOf(question.correct), image: question.image })) }) }); const data = await readResponse<{ error?: string }>(response); if (!response.ok) throw new Error(data.error ?? "Could not publish quiz."); setAdminQuestions([]); setAdminQuestionCount(0); setAdminQuizTitle(""); setQuizQuestions([]); setQuizAnswers([]); setCurrentQuestion(0); setDraftAnswer(""); setQuizScore({ correct: 0, incorrect: 0 }); setSubmitted(false); await loadLiveData(); setAdminStatus("Daily quiz published for students."); } catch (error) { setAdminStatus(error instanceof Error ? error.message : "Could not publish quiz."); }
  };
  const selectQuestionImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { setAdminStatus("Please select an image file."); event.target.value = ""; return; }
    const preview = new Image(); const previewUrl = URL.createObjectURL(file);
    preview.onload = () => { URL.revokeObjectURL(previewUrl); if (preview.width > 1200 || preview.height > 675) { setAdminStatus("Question image must be 1200 × 675 px or smaller."); event.target.value = ""; return; } const reader = new FileReader(); reader.onload = () => { setAdminQuestionImage({ data: String(reader.result), contentType: file.type, width: preview.width, height: preview.height }); setAdminStatus(`Question image selected (${preview.width} × ${preview.height} px).`); }; reader.readAsDataURL(file); }; preview.onerror = () => { URL.revokeObjectURL(previewUrl); setAdminStatus("This image could not be read."); event.target.value = ""; }; preview.src = previewUrl;
  };
  const addSubject = async () => {
    const subject = newSubjectName.trim();
    if (!subject) { setAdminStatus("Please enter a subject name."); return; }
    try { const response = await fetch("/api/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: subject }) }); const data = await readResponse<{ error?: string }>(response); if (!response.ok) throw new Error(data.error ?? "Could not create subject."); setNewSubjectName(""); await loadLiveData(); setAdminStatus(`${subject} subject created.`); } catch (error) { setAdminStatus(error instanceof Error ? error.message : "Could not create subject."); }
  };
  const deleteSubject = async () => {
    if (!subjectToDelete) { setAdminStatus("Choose a subject to delete."); return; }
    try { const response = await fetch(`/api/subjects/${subjectIds[subjectToDelete]}`, { method: "DELETE" }); const data = await readResponse<{ error?: string }>(response); if (!response.ok) throw new Error(data.error ?? "Could not delete subject."); if (selectedSubject === subjectToDelete) setSelectedSubject(null); setSubjectToDelete(""); await loadLiveData(); setAdminStatus(`${subjectToDelete} subject deleted.`); } catch (error) { setAdminStatus(error instanceof Error ? error.message : "Could not delete subject."); }
  };
  const uploadNotes = async () => {
    if (!notesFile || !notesFileName) { setAdminStatus("Choose a PDF file before uploading notes."); return; }
    try { const form = new FormData(); form.append("file", notesFile); form.append("title", notesFileName.replace(/\.pdf$/i, "")); form.append("subjectId", subjectIds[notesSubject] ?? ""); const response = await fetch("/api/notes", { method: "POST", body: form }); const data = await readResponse<{ error?: string }>(response); if (!response.ok) throw new Error(data.error ?? "Could not upload notes."); setNotesFileName(""); setNotesFile(null); await loadLiveData(); setAdminStatus(`${notesFileName} uploaded under ${notesSubject}.`); } catch (error) { setAdminStatus(error instanceof Error ? error.message : "Could not upload notes."); }
  };
  const deleteNotes = async () => {
    if (!noteDeleteSubject || !noteToDelete) { setAdminStatus("Choose the subject and note to delete."); return; }
    const note = noteItems.find((item) => item.subjectId === subjectIds[noteDeleteSubject] && item.title === noteToDelete); if (!note) { setAdminStatus("Note not found."); return; }
    try { const response = await fetch(`/api/notes/${note.id}`, { method: "DELETE" }); const data = await readResponse<{ error?: string }>(response); if (!response.ok) throw new Error(data.error ?? "Could not delete note."); setNoteToDelete(""); await loadLiveData(); setAdminStatus(`${noteToDelete} deleted.`); } catch (error) { setAdminStatus(error instanceof Error ? error.message : "Could not delete note."); }
  };
  const addAssignment = async () => {
    if (!assignmentTitle.trim() || !assignmentDueDate || !assignmentFile) { setAdminStatus("Enter title, due date, and choose the assignment PDF."); return; }
    try { const form = new FormData(); form.append("title", assignmentTitle.trim()); form.append("dueDate", assignmentDueDate); form.append("subjectId", subjectIds[assignmentSubject] ?? ""); form.append("file", assignmentFile); const response = await fetch("/api/assignments", { method: "POST", body: form }); const data = await readResponse<{ error?: string }>(response); if (!response.ok) throw new Error(data.error ?? "Could not publish assignment."); const title = assignmentTitle.trim(); setAssignmentTitle(""); setAssignmentDueDate(""); setAssignmentFileName(""); setAssignmentFile(null); await loadLiveData(); setAdminStatus(`${title} published for students.`); } catch (error) { setAdminStatus(error instanceof Error ? error.message : "Could not publish assignment."); }
  };
  const deleteAssignment = async () => {
    if (!assignmentToDelete) { setAdminStatus("Choose an assignment to delete."); return; }
    const assignment = assignments.find((item) => item.id === assignmentToDelete);
    try { const response = await fetch(`/api/assignments/${assignmentToDelete}`, { method: "DELETE" }); const data = await readResponse<{ error?: string }>(response); if (!response.ok) throw new Error(data.error ?? "Could not delete assignment."); setAssignmentToDelete(""); await loadLiveData(); setAdminStatus(`${assignment?.title ?? "Assignment"} deleted.`); } catch (error) { setAdminStatus(error instanceof Error ? error.message : "Could not delete assignment."); }
  };
  const logoutAdmin = async () => { await fetch("/api/auth/logout", { method: "POST" }); setLoggedInName(""); changeRole("student"); window.location.href = "/"; };
  const logoutStudent = async () => { await fetch("/api/auth/logout", { method: "POST" }); setLoggedInName(""); window.location.href = "/user/login"; };
  const createUserAccount = async () => {
    setUserAccountStatus("");
    try { const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newUserName, mobile: newUserMobile }) }); const raw = await response.text(); let data: { error?: string; name?: string; mobile?: string } = {}; try { data = raw ? JSON.parse(raw) : {}; } catch { throw new Error("Database server did not return a valid response. Check the MongoDB connection and try again."); } if (!response.ok) throw new Error(data.error ?? "Could not create user account. Check the MongoDB connection and try again."); setNewUserName(""); setNewUserMobile(""); setRegisteredStudentCount((count) => count + 1); setUserAccountStatus(`✓ ${data.name} can now login using ${data.mobile}.`); } catch (error) { setUserAccountStatus(error instanceof Error ? error.message : "Could not create user account."); }
  };
  const deleteUserAccount = async () => {
    setUserAccountStatus("");
    try { const response = await fetch(`/api/admin/users?mobile=${encodeURIComponent(deleteUserMobile)}&name=${encodeURIComponent(deleteUserName)}`, { method: "DELETE" }); const raw = await response.text(); let data: { error?: string } = {}; try { data = raw ? JSON.parse(raw) : {}; } catch { throw new Error("Database server did not return a valid response. Check the MongoDB connection and try again."); } if (!response.ok) throw new Error(data.error ?? "Could not delete user account. Check the MongoDB connection and try again."); setDeleteUserName(""); setDeleteUserMobile(""); setRegisteredStudentCount((count) => Math.max(0, count - 1)); setUserAccountStatus("✓ User account deleted."); } catch (error) { setUserAccountStatus(error instanceof Error ? error.message : "Could not delete user account."); }
  };
  const printSubmissionPdf = (fileId?: string) => { if (fileId) window.open(`/api/files/${fileId}`, "_blank", "noopener,noreferrer"); };
  const printRegisteredUsers = () => { window.open("/api/admin/users/print", "_blank", "noopener,noreferrer"); };
  const submitAssignmentReview = async (submission: AssignmentSubmission) => {
    const reviewStatus = submission.id ? assignmentReviewChoices[submission.id] : undefined; if (!submission.id || !reviewStatus) { setAdminStatus("Choose Correct or Wrong before submitting the review."); return; }
    try { const response = await fetch(`/api/assignments/${submission.assignmentId}/submissions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submissionId: submission.id, reviewStatus }) }); const data = await readResponse<{ error?: string }>(response); if (!response.ok) throw new Error(data.error ?? "Could not save review."); await loadLiveData(); setAdminStatus("Assignment result sent to the student."); } catch (error) { setAdminStatus(error instanceof Error ? error.message : "Could not save review."); }
  };
  const recordNoteDownload = (noteId: string) => setDownloadedNotes((items) => items.includes(noteId) ? items : [...items, noteId]);
  useEffect(() => {
    if (tab === currentTabRef.current) return;
    if (isGoingBackRef.current) isGoingBackRef.current = false;
    else tabHistory.current.push(currentTabRef.current);
    currentTabRef.current = tab;
  }, [tab]);
  useEffect(() => {
    if (publishedQuiz && publishedQuiz.availableOn !== today) { setPublishedQuiz(null); setQuizQuestions([]); setQuizAnswers([]); setCurrentQuestion(0); setDraftAnswer(""); setQuizScore({ correct: 0, incorrect: 0 }); setSubmitted(false); }
  }, [publishedQuiz, today]);
  const selectedAnswer = draftAnswer;
  const calculateQuizScore = (answers: string[]) => answers.reduce((score, answer, index) => {
    if (!answer) return score;
    return answer === quizQuestions[index]?.correct ? { ...score, correct: score.correct + 1 } : { ...score, incorrect: score.incorrect + 1 };
  }, { correct: 0, incorrect: 0 });
  const saveAndContinue = () => {
    if (currentQuestion === quizQuestions.length - 1) return;
    const nextAnswers = Array.from({ length: quizQuestions.length }, (_, index) => index === currentQuestion ? selectedAnswer : (quizAnswers[index] ?? ""));
    setQuizAnswers(nextAnswers); setQuizScore(calculateQuizScore(nextAnswers)); setCurrentQuestion((question) => question + 1); setDraftAnswer(nextAnswers[currentQuestion + 1] ?? "");
  };
  const submitQuiz = async () => {
    const finalAnswers = Array.from({ length: quizQuestions.length }, (_, index) => index === currentQuestion ? selectedAnswer : (quizAnswers[index] ?? ""));
    if (!publishedQuiz) return;
    if (quizSubmissionRef.current?.inFlight) return;
    const submissionId = quizSubmissionRef.current?.quizId === publishedQuiz.id ? quizSubmissionRef.current.submissionId : crypto.randomUUID();
    quizSubmissionRef.current = { quizId: publishedQuiz.id, submissionId, inFlight: true };
    try { const answers = finalAnswers.map((answer, index) => quizQuestions[index].options.indexOf(answer)); const response = await fetch(`/api/quiz/${publishedQuiz.id}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers, submissionId }) }); const data = await readResponse<{ error?: string; correct: number; incorrect: number; attemptCount: number }>(response); if (!response.ok) throw new Error(data.error ?? "Could not submit quiz."); setQuizAnswers(finalAnswers); setQuizScore({ correct: data.correct, incorrect: data.incorrect }); setQuizAttemptsUsed(data.attemptCount); setSubmitted(true); setTab("My Results"); await loadLiveData(); } catch (error) { setUploadError(error instanceof Error ? error.message : "Could not submit quiz."); } finally { if (quizSubmissionRef.current?.submissionId === submissionId) quizSubmissionRef.current.inFlight = false; }
  };
  const startNextQuizAttempt = () => { autoSubmittingQuizRef.current = false; quizSubmissionRef.current = null; setQuizDeadline(null); setQuizSecondsLeft(null); setQuizAnswers(Array(quizQuestions.length).fill("")); setCurrentQuestion(0); setDraftAnswer(""); setQuizScore({ correct: 0, incorrect: 0 }); setSubmitted(false); setTab("Daily Quiz"); };
  const resetStudentQuizAttempts = async (userId: string, name: string) => {
    if (!publishedQuiz) return;
    try { const response = await fetch(`/api/quiz/${publishedQuiz.id}/attempts/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) }); const data = await readResponse<{ error?: string }>(response); if (!response.ok) throw new Error(data.error ?? "Could not reset quiz attempts."); await loadLiveData(); setAdminStatus(`${name}'s quiz attempts have been reset.`); } catch (error) { setAdminStatus(error instanceof Error ? error.message : "Could not reset quiz attempts."); }
  };
  useEffect(() => {
    if (role !== "student" || tab !== "Daily Quiz" || submitted || !canTakeQuiz || !publishedQuiz) return;
    const minutes = Number(publishedQuiz.timeLimit); if (!Number.isFinite(minutes) || minutes <= 0) return;
    if (quizDeadline === null) { setQuizDeadline(Date.now() + minutes * 60_000); setQuizSecondsLeft(Math.round(minutes * 60)); return; }
    const tick = () => { const remaining = Math.max(0, Math.ceil((quizDeadline - Date.now()) / 1000)); setQuizSecondsLeft(remaining); if (remaining === 0 && !autoSubmittingQuizRef.current) { autoSubmittingQuizRef.current = true; void submitQuiz(); } };
    tick(); const interval = window.setInterval(tick, 1000); return () => window.clearInterval(interval);
  }, [role, tab, submitted, canTakeQuiz, publishedQuiz, quizDeadline, submitQuiz]);
  useEffect(() => { const params = new URLSearchParams(window.location.search); const token = params.get("reset"); if (token) { setResetToken(token); setLogin(true); setAuthMode("reset"); } if (params.get("login") === "1") { setLogin(true); setAuthMode("login"); } if (params.get("admin") === "1") changeRole("admin"); }, []);
  useEffect(() => { fetch("/api/auth/session").then((response) => response.ok ? response.json() : null).then(async (data) => { if (data?.user) { setAuthenticated(true); setLoggedInName(data.user.name ?? ""); changeRole(data.user.role === "admin" ? "admin" : "student"); try { await loadLiveData(); } catch (error) { setAdminStatus(error instanceof Error ? error.message : "Could not load live data."); } } else window.location.replace("/login"); }).catch(() => window.location.replace("/login")).finally(() => setAuthChecked(true)); }, []);
  useEffect(() => { fetch("/api/visitors").then((response) => response.ok ? response.json() : null).then((data) => { if (typeof data?.count === "number") setVisitorCount(data.count); }).catch(() => undefined); }, []);
  const submitAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoggingIn(true); setLoginError("");
    try {
      const request = authMode === "login" ? ["/api/auth/login", { email, password }] : authMode === "signup" ? ["/api/auth/signup", { name, email, password }] : authMode === "forgot" ? ["/api/auth/password-reset/request", { email }] : ["/api/auth/password-reset/confirm", { token: resetToken, password }];
      const response = await fetch(request[0] as string, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request[1]) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Login failed.");
      if (authMode === "login" || authMode === "signup") { if (authMode === "signup") setRegisteredStudentCount((count) => count + 1); setAuthenticated(true); setLoggedInName(data.user.name ?? ""); changeRole(data.user.role); setLogin(false); setPassword(""); }
      else { setLoginError(data.message); if (authMode === "reset") { setAuthMode("login"); setPassword(""); } }
    } catch (error) { setLoginError(error instanceof Error ? error.message : "Login failed."); }
    finally { setLoggingIn(false); }
  };

  if (!authChecked || !authenticated) return <main className="access-check">Checking secure access…</main>;

  return <main>
    <header>
      <div className="header-brand"><button className="mobile-menu-button" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation menu">☰</button><Brand onPhotoClick={() => setPhotoZoom(true)} /></div>
      <div className="header-actions">{role === "admin" ? <button className="dark-button" onClick={logoutAdmin}>Logout</button> : <button className="dark-button" onClick={() => { window.location.href = "/admin/login"; }}>Admin Login</button>}</div>
    </header>
    {mobileMenuOpen && <button className="sidebar-backdrop" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu" />}
    <div className="app-shell">
      <aside className={mobileMenuOpen ? "mobile-open" : ""}>
        <button className="mobile-sidebar-close" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu">×</button>
        <div className="profile"><i>{role === "admin" ? "A" : (loggedInName.trim().charAt(0).toUpperCase() || "S")}</i><div><strong>{role === "admin" ? "Akshay Kumar" : (loggedInName || "Student account")}</strong>{role === "admin" && <small>Administrator</small>}</div></div>
        <nav>{nav.map(item => <button className={tab === item ? "active" : ""} onClick={() => { item === "Notes" ? scrollToContinueLearning() : setTab(item); setMobileMenuOpen(false); }} key={item}>{item}</button>)}{role === "student" && <button type="button" className="sidebar-logout" onClick={logoutStudent}>↪ Logout</button>}</nav>
        <p className="motto">✦ Learn every day.<br />Grow with confidence.</p>
      </aside>
      <section className="content">
        {tab !== "Dashboard" && <button type="button" className="page-back" onClick={goBack}>← Back</button>}
        <div className="page-heading"><div><p>{role === "admin" ? "ADMIN CONSOLE" : "STUDENT DASHBOARD"}</p><h1>{tab === "Dashboard" ? role === "admin" ? `${greeting}, Akshay.` : "Ready to learn today?" : tab}</h1>{role === "student" && tab === "Dashboard" && <strong className="student-greeting">{greeting}, {loggedInName || "Student"}.</strong>}<span>{role === "admin" ? "Manage your class, materials and daily progress from one place." : "Your daily tasks and learning material are waiting for you."}</span></div><div className="date"><small>{dateCard.weekday}</small><b>{dateCard.day}</b><small>{dateCard.monthYear}</small></div></div>

        {role === "student" && tab === "Dashboard" && <>
          <div className="stats"><Stat value={String(tasksToday).padStart(2, "0")} label="Tasks for today" /><Stat value={quizAccuracy} label="Quiz accuracy" /><Stat value={String(downloadedNotes.length).padStart(2, "0")} label="Notes downloaded" /></div>
          {isQuizLive && publishedQuiz ? <article className="hero"><div><p>TODAY'S QUIZ · {publishedQuiz.subject.toUpperCase()}</p><h2>{publishedQuiz.title}</h2><span>{quizQuestions.length} questions · {publishedQuiz.timeLimit} minutes · {canTakeQuiz ? `${3 - quizAttemptsUsed} attempt${3 - quizAttemptsUsed === 1 ? "" : "s"} remaining` : "All 3 attempts completed"}</span>{canTakeQuiz ? <button onClick={() => submitted ? startNextQuizAttempt() : setTab("Daily Quiz")}>{submitted ? "Try again →" : "Start today’s quiz →"}</button> : <button onClick={() => setTab("My Results")}>View final result →</button>}</div><b className="round">{quizQuestions.length}<small>questions</small></b></article> : <p className="empty-notes">No daily quiz has been published yet.</p>}
          <div className="section-title" id="continue-learning"><div><h2>Continue learning</h2><span>Fresh notes from your teachers</span></div></div>
          <div className="cards subject-cards">{courseSubjects.map((subject, i) => { const noteCount = notesBySubject[subject]?.length ?? 0; return <article className="subject-card" onClick={() => openSubjectNotes(subject)} key={subject}><em>{i === 0 ? "▣" : i === 1 ? "◈" : "✎"}</em><h3>{subject}</h3><div className="subject-card-footer"><span>{noteCount ? `${noteCount} study note${noteCount === 1 ? "" : "s"} available` : "No notes available"}</span><button onClick={() => openSubjectNotes(subject)}>Open notes →</button></div></article>; })}</div>
          <section className="visit-socials"><h2>Please Visit Our <span>→</span></h2><div><a className="social-facebook" href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Visit our Facebook page">f</a><a className="social-instagram" href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Visit our Instagram page">◎</a><a className="social-youtube" href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="Visit our YouTube channel">▶</a></div></section>
        </>}

        {role === "student" && tab === "Daily Quiz" && (isQuizLive && publishedQuiz && quizQuestions.length ? (quizAttemptsUsed >= 3 ? <article className="workspace results result-workspace"><p>QUIZ ATTEMPTS COMPLETED</p><h2>You have used all 3 attempts</h2><span>This quiz is now locked for today. Your last submitted result is available in My Results.</span><button className="dark-button" onClick={() => setTab("My Results")}>View my result →</button></article> : submitted ? <article className="workspace results result-workspace"><p>ATTEMPT {quizAttemptsUsed} OF 3 SUBMITTED</p><h2>Your result has been saved</h2><span>You can attempt this quiz {3 - quizAttemptsUsed} more time{3 - quizAttemptsUsed === 1 ? "" : "s"}.</span><button className="dark-button" onClick={startNextQuizAttempt}>Start next attempt →</button></article> : <article className="workspace quiz-workspace"><div className="progress"><span>Question {currentQuestion + 1} of {quizQuestions.length}</span><i><b style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }} /></i><strong>{Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}%</strong></div><div className="quiz-timer" aria-live="polite"><small>TIME LEFT</small><b>{formattedQuizTime}</b></div><p>{publishedQuiz.subject.toUpperCase()} · TODAY&apos;S QUIZ · ATTEMPT {quizAttemptsUsed + 1} OF 3</p>{quizQuestions[currentQuestion].question && <h2>{quizQuestions[currentQuestion].question}</h2>}{quizQuestions[currentQuestion].imageUrl && <img className="quiz-question-image" src={quizQuestions[currentQuestion].imageUrl} alt="Quiz question" />}<div className="answers">{quizQuestions[currentQuestion].options.map((option, index) => <button className={selectedAnswer === option ? "chosen" : ""} onClick={() => setDraftAnswer(option)} key={option}><i>{"ABCD"[index]}</i>{option}</button>)}</div><div className="quiz-live-score"><span>✓ Correct: <b>{quizScore.correct}</b></span><span>✕ Wrong: <b>{quizScore.incorrect}</b></span></div><div className="workspace-footer"><span>{selectedAnswer ? "Your answer will be saved when you continue or submit." : "You can skip this question and continue anytime."}</span><div className="quiz-actions"><button className="save-continue" onClick={currentQuestion === quizQuestions.length - 1 ? submitQuiz : saveAndContinue}>{currentQuestion === quizQuestions.length - 1 ? "Save & Submit" : "Save & Continue →"}</button><button onClick={submitQuiz}>Submit quiz</button></div></div></article>) : <p className="empty-notes">No daily quiz has been published by the admin yet.</p>)}

        {role === "student" && tab === "Notes" && <><div className="section-title"><div><h2>{selectedSubject ? `${selectedSubject} notes` : "Subject notes"}</h2><span>{selectedSubject ? `Study material for ${selectedSubject}.` : "Download PDF notes shared by your teachers."}</span></div></div><div className="files notes-files">{courseSubjects.filter((subject) => !selectedSubject || subject === selectedSubject).flatMap((subject) => noteItems.filter((note) => note.subjectId === subjectIds[subject]).map((note) => <article key={note.id}><b>PDF</b><div><h3>{note.title}</h3><span>{subject} · PDF document</span></div><a className="download-link" onClick={() => recordNoteDownload(note.id)} href={`/api/files/${note.id}`}>↓ Download</a></article>))}</div>{selectedSubject && !subjectsWithNotes.includes(selectedSubject) && <p className="empty-notes">No notes have been uploaded for this subject yet.</p>}</>}
        {role === "student" && tab === "Assignments" && <><div className="section-title"><div><h2>Your assignments</h2><span>Submit your answer PDF before the due date.</span></div></div>{assignments.length ? assignments.map((assignment) => { const submission = assignmentSubmissions.find((item) => item.assignmentId === assignment.id); return <article className="assignment assignment-workspace" key={assignment.id}><div><p>{assignment.subject.toUpperCase()} · DUE {assignment.dueDate.toUpperCase()}</p><h3>{assignment.title}</h3><span>Download the assignment, complete it, and upload a single PDF answer file.</span>{submission && <small className="uploaded-file">✓ {submission.fileName}</small>}{submission?.reviewStatus && <small className={`assignment-review ${submission.reviewStatus}`}>{submission.reviewStatus === "correct" ? "✓ Your assignment is correct." : "✕ Your assignment needs correction."}</small>}{uploadError && assignmentToUpload === assignment.id && <small className="upload-error">{uploadError}</small>}</div><div><b className={submission ? "done" : "pending"}>{submission ? "✓ Submitted" : "Pending"}</b><div className="assignment-buttons"><a href={`/api/files/${assignment.id}`}>↓ Download PDF</a><button onClick={() => { setAssignmentToUpload(assignment.id); answerFileRef.current?.click(); }}>{submission ? "Replace answer PDF" : "Upload answer PDF"}</button></div></div></article>; }) : <p className="empty-notes">No assignments have been published yet.</p>}<input ref={answerFileRef} className="pdf-file-input" type="file" accept="application/pdf,.pdf" onChange={selectAnswerPdf} /></>}
        {role === "student" && tab === "My Results" && <><article className="workspace results result-workspace"><p>QUIZ RESULT</p><h2>{submitted ? "Your quiz has been submitted" : "No quiz attempted yet"}</h2><div className="score"><b>{submitted ? quizScore.correct : "—"}</b><span>out of {quizQuestions.length} correct</span></div><div className="split"><div><b>{submitted ? quizScore.correct : "—"}</b><span>Correct</span></div><div><b>{submitted ? quizScore.incorrect : "—"}</b><span>Incorrect</span></div><div><b>{submitted && quizQuestions.length ? `${Math.round((quizScore.correct / quizQuestions.length) * 100)}%` : "—"}</b><span>Accuracy</span></div></div></article>{leaderboard.length > 0 && <section className="leaderboard"><div><p>LIVE LEADERBOARD</p><h2>Top three</h2><span>Latest quiz scores from all students.</span></div><div className="top-three">{[leaderboard[1], leaderboard[0], leaderboard[2]].filter(Boolean).map((entry) => <article className={`rank-card rank-${entry.rank}`} key={entry.rank}><b>#{entry.rank}</b><i>{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</i><strong>{entry.name}</strong><span>{entry.correct}/{entry.total} points</span></article>)}</div>{leaderboard.length > 3 && <div className="ranking-strips">{leaderboard.slice(3, showMoreLeaderboard ? undefined : 7).map((entry) => <div className={entry.name === loggedInName ? "current-user-rank" : ""} key={entry.rank}><b>#{entry.rank}</b><strong>{entry.name}</strong><span>{entry.correct}/{entry.total}</span></div>)}</div>}{leaderboard.length > 7 && <button type="button" className="view-more-ranks" onClick={() => setShowMoreLeaderboard((open) => !open)}>{showMoreLeaderboard ? "Show less ↑" : "View more rankings ↓"}</button>}</section>}</>}

        {role === "admin" && tab === "Dashboard" && <div className="admin-dashboard"><div className="admin-dashboard-banner"><span>ADMIN CONTROL CENTER</span><b>Manage your coaching in one place</b></div><div className="stats admin-stats"><Stat value={String(liveAdminStats.studentCount).padStart(2, "0")} label="Registered students" /><Stat value={String(liveAdminStats.attempts).padStart(2, "0")} label="Quiz attempts today" /><Stat value={liveAdminStats.averageScore === null ? "—" : `${liveAdminStats.averageScore}%`} label="Average score" /></div><article className="notice admin-notice"><div><p>DAILY QUIZ</p><h2>{isQuizLive ? "Today’s quiz is live" : "No quiz published yet"}</h2><span>{isQuizLive && publishedQuiz ? `${quizQuestions.length} questions · ${publishedQuiz.title}` : "Create and publish a quiz for your students."}</span></div><button onClick={() => setTab(isQuizLive ? "Quiz Reports" : "Daily Quiz")}>{isQuizLive ? "View report →" : "Create quiz →"}</button></article><div className="section-title admin-section-title"><div><p>QUICK ACTIONS</p><h2>Run your classroom</h2><span>Create quizzes, share notes and assign practice work.</span></div></div><div className="cards actions admin-actions-grid"><button onClick={() => setTab("Daily Quiz")}><i>＋</i><span>Create daily quiz</span><small>Set today&apos;s questions</small></button><button onClick={() => setTab("Subjects & Notes")}><i>↑</i><span>Upload notes</span><small>Share study material</small></button><button onClick={() => setTab("Assignments")}><i>□</i><span>Add assignment</span><small>Collect student answers</small></button></div></div>}
        {role === "admin" && tab === "Daily Quiz" && <article className="workspace admin-workspace">
          <p>DAILY QUIZ MANAGEMENT</p><h2>Create and publish today&apos;s quiz</h2>
          <div className="form admin-form-grid">
            <label>Quiz title<input value={adminQuizTitle} onChange={(event) => setAdminQuizTitle(event.target.value)} placeholder="e.g. Algebra: Linear equations" /></label>
            <label>Subject<select value={adminSubject} onChange={(event) => setAdminSubject(event.target.value)}><option>Mathematics</option><option>Science</option><option>English</option><option value="Other">Other</option></select></label>
            {adminSubject === "Other" && <label className="other-subject-field">Custom subject<input value={customSubject} onChange={(event) => setCustomSubject(event.target.value)} placeholder="Enter subject name" /></label>}
            <label>Available date<input type="date" value={today} readOnly title="Automatically set to today’s date" /></label>
            <label>Time limit<input type="number" value={adminTimeLimit} onChange={(event) => setAdminTimeLimit(event.target.value)} placeholder="15 minutes" /></label>
          </div>
          <section className="question-builder">
            <div><b>Question {adminQuestionCount + 1}</b><span>{adminQuestionCount} question{adminQuestionCount === 1 ? "" : "s"} added</span></div>
            <div className="question-content-inputs"><textarea value={adminQuestionText} onChange={(event) => setAdminQuestionText(event.target.value)} placeholder="Type your quiz question here (optional if you upload an image)..." /><label className="question-image-upload">Question image <small>Optional · maximum 1200 × 675 px</small><input type="file" accept="image/*" onChange={selectQuestionImage} />{adminQuestionImage && <span>✓ Image ready: {adminQuestionImage.width} × {adminQuestionImage.height} px</span>}</label></div>
            <div className="option-grid">{["A", "B", "C", "D"].map((letter, index) => <label key={letter}>{letter}<input type="text" value={adminOptions[index]} onChange={(event) => setAdminOptions((options) => options.map((option, optionIndex) => optionIndex === index ? event.target.value : option))} placeholder={`Option ${letter}: 25, 3.14, or text`} /></label>)}</div><small className="option-value-help">Each option can be an integer, decimal number, or text.</small>
            <select value={adminCorrectOption} onChange={(event) => setAdminCorrectOption(event.target.value)}><option value="" disabled>Choose correct answer</option>{["A", "B", "C", "D"].map((letter, index) => <option value={String(index)} key={letter}>Option {letter}</option>)}</select>
            <button type="button" className="secondary-button" disabled={adminQuestionCount >= 20} onClick={addAdminQuestion}>{adminQuestionCount >= 20 ? "20 question limit reached" : "+ Add question"}</button>
            {adminQuestions.length > 0 && <div className="added-questions">{adminQuestions.map((question, index) => <div key={`${question.question}-${index}`}><b>{index + 1}.</b><span>{question.question}</span><small>Correct: {question.correct}</small></div>)}</div>}
          </section>
          <div className="admin-actions"><span>{adminStatus}</span><button type="button" className="dark-button" onClick={publishDailyQuiz}>Publish daily quiz</button></div>
        </article>}
        {role === "admin" && tab === "Subjects & Notes" && <article className="workspace admin-workspace">
          <p>STUDY MATERIAL MANAGEMENT</p><h2>Subjects and notes</h2>
          <div className="admin-split">
            <section>
              <h3>Create subject</h3>
              <label>Subject name<input value={newSubjectName} onChange={(event) => setNewSubjectName(event.target.value)} placeholder="e.g. Mathematics" /></label>
              <button type="button" className="secondary-button" onClick={addSubject}>+ Create subject</button>
            </section>
            <section>
              <h3>Delete subject</h3>
              <label className="delete-subject-label">Delete subject<select value={subjectToDelete} onChange={(event) => setSubjectToDelete(event.target.value)}><option value="">Select subject</option>{courseSubjects.map((subject) => <option value={subject} key={subject}>{subject}</option>)}</select></label>
              <button type="button" className="delete-subject-button" onClick={deleteSubject}>Delete selected subject</button>
            </section>
            <section>
              <h3>Upload notes</h3>
              <label>Choose subject<select value={notesSubject} onChange={(event) => setNotesSubject(event.target.value)}>{courseSubjects.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
              <label>Notes PDF<input type="file" accept="application/pdf,.pdf" onChange={(event) => { const file = event.target.files?.[0] ?? null; setNotesFile(file); setNotesFileName(file?.name ?? ""); }} /></label>
              <button type="button" className="dark-button" onClick={uploadNotes}>Upload notes PDF</button>
            </section>
            <section>
              <h3>Delete notes</h3>
              <label className="delete-subject-label">Delete notes — choose subject<select value={noteDeleteSubject} onChange={(event) => { setNoteDeleteSubject(event.target.value); setNoteToDelete(""); }}><option value="">Select subject</option>{subjectsWithNotes.map((subject) => <option value={subject} key={subject}>{subject}</option>)}</select></label>
              {noteDeleteSubject && <label>Available notes<select value={noteToDelete} onChange={(event) => setNoteToDelete(event.target.value)}><option value="">Select a note</option>{(notesBySubject[noteDeleteSubject] ?? []).map((note) => <option value={note} key={note}>{note}</option>)}</select></label>}
              <button type="button" className="delete-subject-button" disabled={!noteDeleteSubject || !noteToDelete} onClick={deleteNotes}>Delete selected notes</button>
            </section>
          </div>{adminStatus && <p className="admin-status">✓ {adminStatus}</p>}
        </article>}
        {role === "admin" && tab === "User Accounts" && <article className="workspace admin-workspace user-accounts-workspace"><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}><div><p>USER ACCOUNT MANAGEMENT</p><h2>Create or delete user accounts</h2><span className="user-account-help">Users can login with the mobile number you register here.</span></div><button type="button" className="dark-button" onClick={printRegisteredUsers}>🖨 Print registered users</button></div><div className="admin-split user-account-grid"><section><h3>Create user account</h3><label>User name<input value={newUserName} onChange={(event) => setNewUserName(event.target.value)} placeholder="e.g. Rohan Kumar" /></label><label>Mobile number<input inputMode="numeric" maxLength={10} value={newUserMobile} onChange={(event) => setNewUserMobile(event.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" /></label><button type="button" className="secondary-button" onClick={createUserAccount}>+ Create user account</button></section><section><h3>Delete user account</h3><label>User name<input value={deleteUserName} onChange={(event) => setDeleteUserName(event.target.value)} placeholder="Enter user name" /></label><label>Mobile number<input inputMode="numeric" maxLength={10} value={deleteUserMobile} onChange={(event) => setDeleteUserMobile(event.target.value.replace(/\D/g, ""))} placeholder="Registered mobile number" /></label><button type="button" className="delete-subject-button" onClick={deleteUserAccount}>Delete user account</button></section></div>{userAccountStatus && <p className="admin-status">{userAccountStatus}</p>}<p className="user-login-note">User login page: <a href="/user/login">/user/login</a></p></article>}
        {role === "admin" && tab === "Assignments" && <article className="workspace admin-workspace"><p>ASSIGNMENT MANAGEMENT</p><h2>Create assignment and review answers</h2><div className="form admin-form-grid"><label>Assignment title<input value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} placeholder="e.g. Motion and force worksheet" /></label><label>Subject<select value={assignmentSubject} onChange={(event) => setAssignmentSubject(event.target.value)}>{courseSubjects.map((subject) => <option key={subject}>{subject}</option>)}</select></label><label className="submission-deadline">Last date of submission<input type="date" value={assignmentDueDate} onChange={(event) => setAssignmentDueDate(event.target.value)} /></label><label>Assignment PDF<input type="file" accept="application/pdf,.pdf" onChange={(event) => { const file = event.target.files?.[0] ?? null; setAssignmentFile(file); setAssignmentFileName(file?.name ?? ""); }} /></label></div><button type="button" className="dark-button" onClick={addAssignment}>Publish assignment</button><section className="assignment-admin-delete"><h3>Delete assignment</h3><label>Choose assignment<select value={assignmentToDelete} onChange={(event) => setAssignmentToDelete(event.target.value)}><option value="">Select assignment</option>{assignments.map((assignment) => <option value={assignment.id} key={assignment.id}>{assignment.title}</option>)}</select></label><button type="button" className="delete-subject-button" disabled={!assignmentToDelete} onClick={deleteAssignment}>Delete selected assignment</button></section>{adminStatus && <p className="admin-status">✓ {adminStatus}</p>}<section className="submission-panel"><div><h3>Student answer submissions</h3><span>Submitted answer PDFs from students.</span></div>{assignmentSubmissions.length ? assignmentSubmissions.map((submission) => { const assignment = assignments.find((item) => item.id === submission.assignmentId); return <div className="submission-row" key={submission.id ?? submission.assignmentId}><div><b>{submission.studentName}</b><small>{assignment?.title}</small></div><span className="done">Submitted</span>{submission.id && <button type="button" onClick={() => printSubmissionPdf(submission.id)}>🖨 Print PDF</button>}<select className="assignment-review-select" value={submission.id ? (assignmentReviewChoices[submission.id] ?? submission.reviewStatus ?? "") : ""} onChange={(event) => submission.id && setAssignmentReviewChoices((choices) => ({ ...choices, [submission.id as string]: event.target.value as "correct" | "wrong" }))}><option value="">Review result</option><option value="correct">Correct</option><option value="wrong">Wrong</option></select><button type="button" className="review-submit-button" onClick={() => submitAssignmentReview(submission)}>Send result</button></div>; }) : <p className="empty-notes">No student answer submissions yet.</p>}</section></article>}
        {role === "admin" && tab === "Quiz Reports" && (isQuizLive && publishedQuiz ? <><div className="section-title report-title"><div><p>DAILY QUIZ · {dateCard.day} {dateCard.monthYear.toUpperCase()}</p><h2>{publishedQuiz.title}</h2><span>{liveReportRows.length} student{liveReportRows.length === 1 ? "" : "s"} attempted this quiz.</span></div>{liveReportRows.length > 0 && <button className="dark-button" onClick={() => window.print()}>Print live report</button>}</div>{liveReportRows.length ? <div className="table"><div className="table-head"><span>Student</span><span>Correct</span><span>Incorrect</span><span>Score</span><span>Action</span></div>{liveReportRows.map((row) => <div className="table-row" key={row.userId}><span>{row.name}</span><span>{row.correct} / {row.total}</span><span>{row.incorrect}</span><span>{Math.round((row.correct / row.total) * 100)}%</span><button type="button" className="review-submit-button" onClick={() => resetStudentQuizAttempts(row.userId, row.name)}>Reset attempts</button></div>)}</div> : <p className="empty-notes">No student has submitted this quiz yet.</p>}</> : <p className="empty-notes">Publish today&apos;s quiz to view its live report.</p>)}
      </section>
    </div>
    <footer className="site-footer"><span>© {new Date().getFullYear()} Learn.With.Akshay</span><div><span className="visitor-dot" /> <strong>{visitorCount === null ? "—" : visitorCount.toLocaleString("en-IN")}</strong> visitors</div><span className="last-update">Last updated: {dateCard.day} {dateCard.monthYear}</span></footer>
    {login && <div className="overlay"><form className="modal auth-modal" onSubmit={submitAuth}><button type="button" className="x" onClick={() => setLogin(false)}>×</button><Brand /><div className="auth-mark">✦</div><p className="auth-kicker">{authMode === "login" ? "WELCOME BACK" : authMode === "signup" ? "JOIN THE ACADEMY" : "ACCOUNT RECOVERY"}</p><h2>{authMode === "login" ? "Your learning space awaits." : authMode === "signup" ? "Begin your learning journey." : authMode === "forgot" ? "Forgot your password?" : "Choose a new password."}</h2><span>{authMode === "login" ? "Use your coaching account to continue." : authMode === "signup" ? "Create a student account in just a moment." : authMode === "forgot" ? "Enter your email and we’ll send a secure reset link." : "Create a strong new password for your account."}</span>{authMode === "signup" && <label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" /></label>}{authMode !== "reset" && <label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>}{authMode === "reset" && <label>Reset token<input required value={resetToken} onChange={(event) => setResetToken(event.target.value)} placeholder="Token from reset email" /></label>}{authMode !== "forgot" && <label>Password<span className="password-field"><input required minLength={8} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "🙈" : "👁"}</button></span></label>}{loginError && <p className="auth-message">{loginError}</p>}<button disabled={loggingIn} className="dark-button">{loggingIn ? "Please wait…" : authMode === "login" ? "Login securely" : authMode === "signup" ? "Create student account" : authMode === "forgot" ? "Send reset link" : "Update password"}</button><div className="auth-links">{authMode === "login" && <><button type="button" onClick={() => setAuthMode("forgot")}>Forgot password?</button><span>•</span><button type="button" onClick={() => setAuthMode("signup")}>Create account</button></>}{authMode !== "login" && <button type="button" onClick={() => { setAuthMode("login"); setLoginError(""); }}>← Back to login</button>}</div><small>{authMode === "signup" ? "New accounts are created as student accounts." : "Your account and learning progress stay protected."}</small></form></div>}
    {photoZoom && <div className="photo-overlay" role="dialog" aria-modal="true" aria-label="Akshay profile photo" onClick={() => setPhotoZoom(false)}><button type="button" className="photo-close" onClick={() => setPhotoZoom(false)}>×</button><img src="/akshay-profile.png" alt="Akshay profile enlarged" onClick={(event) => event.stopPropagation()} /></div>}
  </main>;
}
