import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.mailEnabled) return null; // dev: log-only
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export interface CapsuleOpenedMail {
  to: string;
  capsuleTitle: string;
  capsuleId: string;
  openAt: Date;
}

export async function sendCapsuleOpenedEmail(mail: CapsuleOpenedMail): Promise<void> {
  const openLink = `${env.FRONTEND_URL}/capsules/${mail.capsuleId}`;
  const subject = `\u23F3 Kapsul waktumu telah terbuka: ${mail.capsuleTitle}`;
  const text = [
    `Halo!`,
    ``,
    `Kapsul waktumu "${mail.capsuleTitle}" yang dijadwalkan terbuka pada ${mail.openAt.toISOString()} kini sudah bisa dibuka.`,
    ``,
    `Buka di sini: ${openLink}`,
    ``,
    `— Time Capsule`,
  ].join("\n");
  const html = `<p>Halo!</p><p>Kapsul waktumu <strong>${escapeHtml(mail.capsuleTitle)}</strong> kini sudah bisa dibuka.</p><p><a href="${openLink}">Buka kapsul</a></p><p>— Time Capsule</p>`;

  const tx = getTransporter();
  if (!tx) {
    console.log(`[mail:dev] to=${mail.to} subject=${subject}\n${text}`);
    return;
  }
  await tx.sendMail({ from: env.MAIL_FROM, to: mail.to, subject, text, html });
}

function escapeHtml(s: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return s.replace(/[&<>"']/g, (c) => map[c] ?? c);
}
