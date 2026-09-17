import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/mongodb";

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);

export async function GET() {
  const session = await requireRole("admin");
  if (!session) return new NextResponse("Administrator login required.", { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  try {
    const users = await (await db()).collection("users").find({ role: "student", mobile: { $exists: true, $ne: "" } }, { projection: { name: 1, mobile: 1 } }).sort({ name: 1 }).toArray();
    const rows = users.map((user, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(user.name || "Student")}</td><td>${escapeHtml(user.mobile)}</td></tr>`).join("") || "<tr><td colspan='3'>No registered student accounts found.</td></tr>";
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Registered users</title><style>body{font-family:Arial,sans-serif;color:#171717;margin:32px}h1{margin:0 0 6px;font-size:25px}p{margin:0 0 24px;color:#555}table{width:100%;border-collapse:collapse}th,td{border:1px solid #b8b8b8;padding:10px;text-align:left}th{background:#f1f1f1}@media print{body{margin:16px}}</style></head><body><h1>Learn.With.Akshay</h1><p>Registered student accounts · ${users.length} total</p><table><thead><tr><th>#</th><th>Name</th><th>Mobile number</th></tr></thead><tbody>${rows}</tbody></table><script>window.addEventListener('load',()=>window.print())</script></body></html>`;
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  } catch {
    return new NextResponse("Could not load registered users. Check the database connection.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
