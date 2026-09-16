import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const doc = new PDFDocument({ margin: 52 }); const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const complete = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));
  doc.fillColor("#15130d").fontSize(24).text("Learn.With.Akshay");
  doc.fillColor("#b77b00").fontSize(12).text("ASSIGNMENT WORKSHEET");
  doc.moveDown(2).fillColor("#15130d").fontSize(20).text("Science — Motion and Force");
  doc.moveDown().fontSize(12).fillColor("#3e4756").text("Complete all questions in your notebook, scan your answers as one PDF, and upload it from the Assignments page.");
  doc.moveDown(2).fillColor("#15130d").fontSize(13).text("1. Explain the difference between speed and velocity.");
  doc.moveDown().text("2. State Newton's second law of motion.");
  doc.moveDown().text("3. Give two examples of balanced forces.");
  doc.end(); const pdf = await complete;
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=motion-and-force-assignment.pdf" } });
}
