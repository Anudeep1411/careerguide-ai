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

  const port = Number(SMTP_PORT || 587);

  console.log("====================================");
  console.log("SMTP EMAIL SEND STARTED");
  console.log("SMTP_HOST:", SMTP_HOST);
  console.log("SMTP_PORT:", port);
  console.log("SMTP_USER:", SMTP_USER);
  console.log("TO:", to);
  console.log("====================================");

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    await transporter.verify();
    console.log("SMTP verified successfully");

    const info = await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", info.messageId);

    return {
      success: true,
      mode: "email",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("SMTP EMAIL ERROR:", error.message);

    throw new Error(`Email send failed: ${error.message}`);
  }
}