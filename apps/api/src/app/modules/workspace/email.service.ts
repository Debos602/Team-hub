import nodemailer from 'nodemailer';
import config from '../../../config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailSender.email,
    pass: config.emailSender.app_pass,
  },
});

export const sendInviteEmail = async (
  to: string,
  inviterName: string,
  workspaceName: string,
  role: string,
  inviteLink: string
) => {
  const subject = `You've been invited to join ${workspaceName} on Team Hub`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You've Been Invited!</h2>
      <p><strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace as a <strong>${role}</strong>.</p>
      <p>Click the button below to accept the invitation:</p>
      <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Accept Invitation
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${inviteLink}</p>
      <p><em>This invitation will expire in 7 days.</em></p>
      <hr style="margin: 24px 0;" />
      <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: config.emailSender.email,
    to,
    subject,
    html,
  });
};
