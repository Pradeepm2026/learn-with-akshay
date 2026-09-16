import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const subject = new URL(request.url).searchParams.get("subject") ?? "Study";
  const doc = new PDFDocument({ margin: 52 }); const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const complete = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));
  doc.fillColor("#15130d").fontSize(24).text("Learn.With.Akshay");
  doc.fillColor("#b77b00").fontSize(12).text("COACHING PORTAL");
  doc.moveDown(2).fillColor("#15130d").fontSize(20).text(`${subject} — Chapter Notes`);
  doc.moveDown().fontSize(12).fillColor("#3e4756").text(`These ${subject} study notes are shared by your teacher. Add your complete PDF material from the Admin Notes section.`);
  doc.moveDown(2).fillColor("#b77b00").fontSize(10).text("LEARN • PRACTISE • GROW");
  doc.end(); const pdf = await complete;
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${subject.toLowerCase()}-chapter-notes.pdf"` } });
}
