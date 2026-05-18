import nodemailer from "nodemailer";
import dns from "dns/promises";

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

  const port = Number(SMTP_PORT || 465);

  console.log("====================================");
  console.log("SMTP EMAIL SEND STARTED");
  console.log("SMTP_HOST:", SMTP_HOST);
  console.log("SMTP_PORT:", port);
  console.log("SMTP_USER:", SMTP_USER);
  console.log("TO:", to);
  console.log("====================================");

  let smtpHostForConnection = SMTP_HOST;

  try {
    const ipv4 = await dns.lookup(SMTP_HOST, { family: 4 });
    smtpHostForConnection = ipv4.address;
    console.log("SMTP IPv4 resolved:", smtpHostForConnection);
  } catch (error) {
    console.error("SMTP IPv4 resolve failed:", error.message);
  }

  const transporter = nodemailer.createTransport({
    host: smtpHostForConnection,
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      servername: SMTP_HOST,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
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