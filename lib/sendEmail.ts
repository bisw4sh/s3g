import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  text,
  html
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  try {
    resend.emails.send({
      from: 'automated@s3g.com',
      to,
      subject,
      html: html || text
    });
    console.log(`Email sent to ${to}`);
    return
  } catch (error) {
    console.error('Error sending email to ', to, error);
    throw error;
  }
};
