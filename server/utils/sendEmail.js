import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("====================================");
    console.log("EMAIL SMTP NOT CONFIGURED");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Message:", text);
    console.log("====================================");

    return {
      success: true,
      mode: "console",
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return {
    success: true,
    mode: "email",
  };
}