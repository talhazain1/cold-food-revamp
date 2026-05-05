import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOrderEmail(
  to: string,
  orderId: string,
  total: number,
  lines: string[],
) {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px">
    <h2 style="color:#C8102E">Ready2Cook Order Confirmation</h2>
    <p>Thank you for your order <strong>#${orderId}</strong>.</p>
    <ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
    <p style="font-size:18px"><strong>Total: £${total.toFixed(2)}</strong></p>
    <p style="color:#006847">We will keep you updated on delivery status.</p>
  </div>
  `;
  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Ready2Cook Order #${orderId}`,
    html,
  });
}
