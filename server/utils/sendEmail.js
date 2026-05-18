export async function sendEmail({ to, subject, text, html }) {
  const { RESEND_API_KEY, RESEND_FROM } = process.env;

  if (!RESEND_API_KEY) {
    console.log("====================================");
    console.log("RESEND API KEY NOT CONFIGURED");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Message:", text);
    console.log("====================================");

    return {
      success: true,
      mode: "console",
    };
  }

  const from = RESEND_FROM || "CareerGuide AI <onboarding@resend.dev>";

  console.log("====================================");
  console.log("RESEND EMAIL SEND STARTED");
  console.log("FROM:", from);
  console.log("TO:", to);
  console.log("SUBJECT:", subject);
  console.log("====================================");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: html || `<p>${text}</p>`,
        text,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("RESEND EMAIL ERROR:", result);
      throw new Error(result?.message || result?.error || "Resend email failed");
    }

    console.log("Email sent successfully:", result?.id);

    return {
      success: true,
      mode: "resend",
      messageId: result?.id,
    };
  } catch (error) {
    console.error("RESEND EMAIL ERROR:", error.message);
    throw new Error(`Email send failed: ${error.message}`);
  }
}
