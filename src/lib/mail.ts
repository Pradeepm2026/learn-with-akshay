import nodemailer from "nodemailer";

export async function sendResetEmail(email: string, token: string) {
  const baseUrl = process.env.APP_URL;
  if (!baseUrl || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return;
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 587), secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
  const url = `${baseUrl}/?reset=${encodeURIComponent(token)}`;
  await transport.sendMail({ from: process.env.MAIL_FROM ?? process.env.SMTP_USER, to: email, subject: "Reset your Learn.With.Akshay password", text: `Reset your password: ${url}\nThis link expires in 30 minutes.`, html: `<p>Reset your Learn.With.Akshay password:</p><p><a href="${url}">Reset password</a></p><p>This link expires in 30 minutes.</p>` });
}
