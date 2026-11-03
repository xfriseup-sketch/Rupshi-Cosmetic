import nodemailer from "nodemailer";

function money(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """);
}

/**
 * Email the store admin when a customer places an order.
 * Missing SMTP settings skip quietly so checkout still succeeds.
 */
export async function notifyAdminOfOrder(order, origin) {
  const to = (process.env.ADMIN_EMAIL || "").trim();
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();
  if (!to || !user || !pass) {
    console.warn("Order email skipped: set ADMIN_EMAIL, SMTP_USER and SMTP_PASS");
    return { sent: false, reason: "not-configured" };
  }

  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const from = (process.env.SMTP_FROM || user).trim();
  const orderId = String(order._id);
  const shortId = orderId.slice(-6).toUpperCase();
  const items = Array.isArray(order.items) ? order.items : [];
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #f3e8ee">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #f3e8ee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #f3e8ee;text-align:right">${money(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const adminUrl = `${origin || "https://rupshi.vercel.app"}/admin`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:560px">
      <h2 style="color:#db2777;margin-bottom:4px">নতুন অর্ডার #${shortId}</h2>
      <p style="margin-top:0">একজন কাস্টমার অর্ডার কনফার্ম করেছে।</p>
      <p><strong>নাম:</strong> ${escapeHtml(order.customerName)}<br/>
         <strong>ফোন:</strong> ${escapeHtml(order.phone)}<br/>
         <strong>ঠিকানা:</strong> ${escapeHtml(order.address)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #f3e8ee">পণ্য</th>
            <th style="padding:8px;border-bottom:1px solid #f3e8ee">সংখ্যা</th>
            <th style="text-align:right;padding:8px;border-bottom:1px solid #f3e8ee">দাম</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p>
        ${order.couponCode ? `<strong>কুপন:</strong> ${escapeHtml(order.couponCode)} (−${money(order.discountAmount)})<br/>` : ""}
        <strong>মোট:</strong> ${money(order.totalAmount)}
      </p>
      <p><a href="${adminUrl}" style="color:#db2777">অ্যাডমিন প্যানেলে অর্ডার দেখো</a></p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Rupshi Cosmetics" <${from}>`,
    to,
    subject: `নতুন অর্ডার #${shortId} — ${order.customerName}`,
    html,
  });

  return { sent: true };
}
