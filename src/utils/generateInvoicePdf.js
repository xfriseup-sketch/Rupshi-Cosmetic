import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const ROSE = rgb(0.859, 0.153, 0.467);
const ROSE_DARK = rgb(0.616, 0.09, 0.302);
const INK = rgb(0.12, 0.14, 0.18);
const MUTED = rgb(0.39, 0.42, 0.46);
const LINE = rgb(0.93, 0.88, 0.9);
const ROW_ALT = rgb(0.992, 0.965, 0.973);
const WHITE = rgb(1, 1, 1);
const GREEN = rgb(0.06, 0.45, 0.28);
const BLUSH = rgb(0.992, 0.945, 0.957);

function safe(text, fallback = "-") {
  const raw = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return fallback;
  let out = "";
  for (const ch of raw) {
    const code = ch.charCodeAt(0);
    if (code >= 32 && code <= 126) out += ch;
  }
  const cleaned = out.replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}

function money(n) {
  const value = Number(n);
  const amount = Number.isFinite(value) ? value : 0;
  return `BDT ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function wrapText(text, font, size, maxWidth) {
  const words = safe(text, "-").split(" ").filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
      current = trial;
    } else {
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, size) > maxWidth) {
        let chunk = "";
        for (const ch of word) {
          const next = chunk + ch;
          if (font.widthOfTextAtSize(next, size) > maxWidth) {
            if (chunk) lines.push(chunk);
            chunk = ch;
          } else {
            chunk = next;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["-"];
}

/**
 * Build a branded A4 invoice. Returns a Node Buffer.
 * Standard fonts only (WinAnsi). Non-Latin characters are omitted so
 * generation never throws on Bengali names.
 */
export async function generateInvoicePdf(orderData) {
  const order = orderData && typeof orderData === "object" ? orderData : {};
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 42;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight;

  const paintChrome = (target) => {
    target.drawRectangle({
      x: 0,
      y: pageHeight - 10,
      width: pageWidth,
      height: 10,
      color: ROSE,
    });
    target.drawText("Rupshi Cosmetics", {
      x: margin,
      y: pageHeight - 46,
      size: 22,
      font: bold,
      color: ROSE_DARK,
    });
    target.drawText("Premium Beauty Products", {
      x: margin,
      y: pageHeight - 62,
      size: 10,
      font,
      color: MUTED,
    });

    const contact = ["Dhaka, Bangladesh", "Cash on Delivery", "rupshi.vercel.app"];
    contact.forEach((line, index) => {
      const width = font.widthOfTextAtSize(line, 9);
      target.drawText(line, {
        x: pageWidth - margin - width,
        y: pageHeight - 40 - index * 13,
        size: 9,
        font,
        color: MUTED,
      });
    });
  };

  const drawTableHeader = () => {
    page.drawRectangle({
      x: margin,
      y: y - 8,
      width: pageWidth - margin * 2,
      height: 24,
      color: ROSE,
    });
    const headers = [
      ["Product", margin + 10],
      ["Qty", margin + 292],
      ["Unit Price", margin + 340],
      ["Total", margin + 450],
    ];
    headers.forEach(([label, x]) => {
      page.drawText(label, { x, y: y - 1, size: 9, font: bold, color: WHITE });
    });
    y -= 30;
  };

  const newPage = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    paintChrome(page);
    y = pageHeight - 96;
    drawTableHeader();
  };

  const ensure = (needed) => {
    if (y - needed < 150) newPage();
  };

  paintChrome(page);
  y = pageHeight - 92;

  const rawId = String(order._id || order.id || "ORDER");
  const invoiceNo = `INV-${rawId.slice(-8).toUpperCase()}`;
  const created = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateLabel = Number.isNaN(created.getTime())
    ? "-"
    : created.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  page.drawText("INVOICE", { x: margin, y, size: 11, font: bold, color: ROSE });
  y -= 20;

  [
    ["Invoice No", invoiceNo],
    ["Date", dateLabel],
    ["Status", safe(order.status, "pending")],
  ].forEach(([label, value]) => {
    page.drawText(label, { x: margin, y, size: 9, font, color: MUTED });
    page.drawText(safe(value), { x: margin + 78, y, size: 10, font: bold, color: INK });
    y -= 15;
  });

  y -= 6;
  const addressLines = wrapText(
    order.address || "Address not provided",
    font,
    10,
    pageWidth - margin * 2 - 28
  ).slice(0, 2);
  const billLines = [
    safe(order.customerName, "Customer"),
    order.phone ? safe(order.phone, "") : "",
    ...addressLines,
  ].filter(Boolean);
  const billHeight = 28 + billLines.length * 14;
  page.drawRectangle({
    x: margin,
    y: y - billHeight,
    width: pageWidth - margin * 2,
    height: billHeight,
    color: BLUSH,
    borderColor: LINE,
    borderWidth: 1,
  });
  page.drawText("BILL TO", {
    x: margin + 14,
    y: y - 16,
    size: 8,
    font: bold,
    color: ROSE,
  });
  billLines.forEach((line, index) => {
    page.drawText(line, {
      x: margin + 14,
      y: y - 32 - index * 14,
      size: 10,
      font: index === 0 ? bold : font,
      color: INK,
    });
  });
  y -= billHeight + 26;

  drawTableHeader();

  const items = Array.isArray(order.items) ? order.items : [];
  if (items.length === 0) {
    page.drawText("No line items on this order.", {
      x: margin + 10,
      y,
      size: 10,
      font,
      color: MUTED,
    });
    y -= 22;
  }

  items.forEach((item, index) => {
    const nameLines = wrapText(item?.name || "Product", font, 9, 250).slice(0, 3);
    const rowHeight = Math.max(22, nameLines.length * 12 + 8);
    ensure(rowHeight + 6);
    if (index % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: y - rowHeight + 16,
        width: pageWidth - margin * 2,
        height: rowHeight,
        color: ROW_ALT,
      });
    }
    nameLines.forEach((line, lineIndex) => {
      page.drawText(line, {
        x: margin + 10,
        y: y - lineIndex * 12,
        size: 9,
        font,
        color: INK,
      });
    });
    const qty = Math.max(0, Math.floor(Number(item?.quantity) || 0));
    const unit = Number(item?.price) || 0;
    page.drawText(String(qty), { x: margin + 292, y, size: 9, font, color: INK });
    page.drawText(money(unit), { x: margin + 340, y, size: 9, font, color: INK });
    const totalLabel = money(unit * qty);
    const totalWidth = bold.widthOfTextAtSize(totalLabel, 9);
    page.drawText(totalLabel, {
      x: pageWidth - margin - 10 - totalWidth,
      y,
      size: 9,
      font: bold,
      color: INK,
    });
    y -= rowHeight;
  });

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
    0
  );
  const discount = Math.max(0, Number(order.discountAmount) || 0);
  const storedTotal = Number(order.totalAmount);
  const shipping = Number.isFinite(storedTotal)
    ? Math.max(0, Math.round((storedTotal - (subtotal - discount)) * 100) / 100)
    : 60;
  const grand = Number.isFinite(storedTotal)
    ? storedTotal
    : Math.max(0, subtotal - discount) + shipping;

  const rows = [["Subtotal", money(subtotal), INK, font]];
  if (discount > 0) {
    const code = order.couponCode ? ` (${safe(order.couponCode, "")})` : "";
    rows.push([`Discount${code}`, `- ${money(discount)}`, GREEN, font]);
  }
  rows.push(["Shipping", money(shipping), INK, font]);

  ensure(rows.length * 16 + 70);
  y -= 18;
  const boxWidth = 240;
  const boxX = pageWidth - margin - boxWidth;

  rows.forEach(([label, value, color, face]) => {
    page.drawText(label, { x: boxX, y, size: 10, font: face, color: MUTED });
    const valueWidth = face.widthOfTextAtSize(value, 10);
    page.drawText(value, {
      x: boxX + boxWidth - valueWidth,
      y,
      size: 10,
      font: face,
      color,
    });
    y -= 16;
  });

  y -= 4;
  page.drawRectangle({
    x: boxX - 10,
    y: y - 10,
    width: boxWidth + 10,
    height: 30,
    color: BLUSH,
    borderColor: ROSE,
    borderWidth: 1.2,
  });
  page.drawText("GRAND TOTAL", {
    x: boxX,
    y: y,
    size: 11,
    font: bold,
    color: ROSE_DARK,
  });
  const grandLabel = money(grand);
  const grandWidth = bold.widthOfTextAtSize(grandLabel, 12);
  page.drawText(grandLabel, {
    x: boxX + boxWidth - grandWidth,
    y: y,
    size: 12,
    font: bold,
    color: ROSE_DARK,
  });

  const pages = pdf.getPages();
  const last = pages[pages.length - 1];
  last.drawLine({
    start: { x: margin, y: 58 },
    end: { x: pageWidth - margin, y: 58 },
    thickness: 0.6,
    color: LINE,
  });
  const thanks = "Thank you for shopping with us!";
  const thanksWidth = bold.widthOfTextAtSize(thanks, 10);
  last.drawText(thanks, {
    x: (pageWidth - thanksWidth) / 2,
    y: 42,
    size: 10,
    font: bold,
    color: ROSE,
  });
  const site = "rupshi.vercel.app";
  const siteWidth = font.widthOfTextAtSize(site, 8);
  last.drawText(site, {
    x: (pageWidth - siteWidth) / 2,
    y: 28,
    size: 8,
    font,
    color: MUTED,
  });

  pdf.setTitle(`Rupshi Invoice ${invoiceNo}`);
  pdf.setAuthor("Rupshi Cosmetics");
  pdf.setSubject("Order invoice");

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
