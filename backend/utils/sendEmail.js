const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Cortex <onboarding@resend.dev>",
      to: [to],
      subject,
      text,
    });

    if (error) {
      console.error(`Failed to send email to ${to}:`, error.message);
      return false;
    }

    console.log(`Email sent to ${to}:`, data.id);
    return true;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
    return false;
  }
};

module.exports = sendEmail;