import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { envConfig } from "../config/env";

export interface InvitationEmailInput {
  to: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  expiresAt: Date;
  acceptUrl: string;
}

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) {
    return transporter;
  }

  if (!envConfig.smtpHost) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: envConfig.smtpHost,
    port: envConfig.smtpPort,
    secure: envConfig.smtpSecure,
    ...(envConfig.smtpUser && envConfig.smtpPass
      ? {
          auth: {
            user: envConfig.smtpUser,
            pass: envConfig.smtpPass,
          },
        }
      : {}),
  });

  return transporter;
}

export function isEmailDeliveryConfigured() {
  return Boolean(envConfig.smtpHost);
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

function formatRole(role: string) {
  return role === "superAdmin"
    ? "Super Admin"
    : role.charAt(0).toUpperCase() + role.slice(1);
}

function formatExpiry(date: Date) {
  return date.toUTCString();
}

export async function sendInvitationEmail(
  input: InvitationEmailInput,
): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    console.warn(
      "[email] SMTP is not configured; invitation email was not sent.",
    );
    return false;
  }

  const role = formatRole(input.role);
  const expiry = formatExpiry(input.expiresAt);
  const acceptUrl = escapeHtml(input.acceptUrl);
  const workspaceName = escapeHtml(input.workspaceName);
  const inviterName = escapeHtml(input.inviterName);
  const to = escapeHtml(input.to);
  const subjectWorkspaceName = input.workspaceName.replace(/[\r\n]+/g, " ");

  const text = [
    `${input.inviterName} invited you to join ${input.workspaceName} on FMS.`,
    "",
    `Role: ${role}`,
    `Invitation expires: ${expiry}`,
    "",
    `Accept the invitation: ${input.acceptUrl}`,
    "",
    "If you were not expecting this invitation, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 16px;">You're invited to ${workspaceName}</h2>
      <p>${inviterName} invited you to join <strong>${workspaceName}</strong> on FMS.</p>
      <p style="margin: 20px 0;">
        <a href="${acceptUrl}" style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Accept invitation
        </a>
      </p>
      <table style="border-collapse: collapse; font-size: 14px; margin: 20px 0;">
        <tr>
          <td style="padding: 4px 12px 4px 0; color: #6b7280;">Role</td>
          <td style="padding: 4px 0;">${role}</td>
        </tr>
        <tr>
          <td style="padding: 4px 12px 4px 0; color: #6b7280;">Expires</td>
          <td style="padding: 4px 0;">${expiry}</td>
        </tr>
      </table>
      <p style="font-size: 12px; color: #6b7280;">
        If the button does not work, copy this link into your browser:<br />
        <a href="${acceptUrl}">${acceptUrl}</a>
      </p>
      <p style="font-size: 12px; color: #6b7280;">
        If you were not expecting this invitation, you can ignore this email.
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
        Sent to ${to}
      </p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: envConfig.mailFrom,
      to: input.to,
      subject: `You're invited to join ${subjectWorkspaceName} on FMS`,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error(
      "[email] Failed to send invitation email:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
