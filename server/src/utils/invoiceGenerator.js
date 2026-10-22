/**
 * ============================================================
 * INVOICE GENERATOR — PDFKit
 * ============================================================
 */

import PDFDocument from "pdfkit";

export const generateInvoice = (order, user) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const PRIMARY = "#FC8019";
  const TEXT = "#282C3F";
  const MUTED = "#93959F";
  const BORDER = "#E9E9EB";
  const SUCCESS = "#48C479";
  const DANGER = "#E23744";

  const PAGE_W = doc.page.width;
  const MARGIN = 50;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // HEADER
  doc.rect(0, 0, PAGE_W, 6).fill(PRIMARY);
  doc
    .fontSize(24)
    .fillColor(PRIMARY)
    .font("Helvetica-Bold")
    .text("🍽️ SPP FoodieApp", MARGIN, 40);
  doc
    .fontSize(9)
    .fillColor(MUTED)
    .font("Helvetica")
    .text("Fresh food, fast delivery", MARGIN, 70);
  doc
    .fontSize(28)
    .fillColor(TEXT)
    .font("Helvetica-Bold")
    .text("INVOICE", 0, 40, { align: "right", width: PAGE_W - MARGIN });
  doc
    .fontSize(9)
    .fillColor(MUTED)
    .font("Helvetica")
    .text(`#INV-${order._id.toString().slice(-8).toUpperCase()}`, 0, 72, {
      align: "right",
      width: PAGE_W - MARGIN,
    });
  doc
    .moveTo(MARGIN, 100)
    .lineTo(PAGE_W - MARGIN, 100)
    .strokeColor(BORDER)
    .lineWidth(1)
    .stroke();

  // BILL TO + ORDER INFO
  const infoY = 120;
  doc
    .fontSize(9)
    .fillColor(MUTED)
    .font("Helvetica-Bold")
    .text("BILL TO", MARGIN, infoY);
  doc
    .fontSize(11)
    .fillColor(TEXT)
    .font("Helvetica-Bold")
    .text(user?.name || "Customer", MARGIN, infoY + 16);
  doc
    .fontSize(9)
    .fillColor(TEXT)
    .font("Helvetica")
    .text(user?.email || "", MARGIN, infoY + 32)
    .text(order.phone || "", MARGIN, infoY + 46);
  doc
    .fontSize(9)
    .fillColor(MUTED)
    .text(
      `${order.address?.line1 || ""}${order.address?.line2 ? ", " + order.address.line2 : ""}`,
      MARGIN,
      infoY + 64,
    )
    .text(
      `${order.address?.city || ""} — ${order.address?.pincode || ""}`,
      MARGIN,
      infoY + 78,
    );

  const rightX = PAGE_W - MARGIN - 200;
  doc
    .fontSize(9)
    .fillColor(MUTED)
    .font("Helvetica-Bold")
    .text("ORDER DETAILS", rightX, infoY);

  const infoRows = [
    { label: "Order ID", value: order._id.toString().slice(-12).toUpperCase() },
    {
      label: "Date",
      value: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    },
    { label: "Payment", value: (order.paymentMethod || "COD").toUpperCase() },
    {
      label: "Status",
      value: order.paymentStatus === "paid" ? "PAID" : "PENDING",
      color: order.paymentStatus === "paid" ? SUCCESS : DANGER,
    },
  ];

  infoRows.forEach((row, i) => {
    const y = infoY + 16 + i * 16;
    doc
      .fontSize(9)
      .fillColor(MUTED)
      .font("Helvetica")
      .text(row.label + ":", rightX, y);
    doc
      .fontSize(9)
      .fillColor(row.color || TEXT)
      .font("Helvetica-Bold")
      .text(row.value, rightX + 70, y);
  });

  // ITEMS TABLE
  let y = 260;
  doc.rect(MARGIN, y, CONTENT_W, 28).fill("#F9F9F9");
  doc
    .fontSize(9)
    .fillColor(TEXT)
    .font("Helvetica-Bold")
    .text("ITEM", MARGIN + 12, y + 9)
    .text("QTY", MARGIN + CONTENT_W - 200, y + 9, { width: 40, align: "right" })
    .text("PRICE", MARGIN + CONTENT_W - 150, y + 9, {
      width: 60,
      align: "right",
    })
    .text("TOTAL", MARGIN + CONTENT_W - 70, y + 9, {
      width: 58,
      align: "right",
    });

  y += 28;

  order.items.forEach((item, i) => {
    const rowH = 28;
    const rowY = y + i * rowH;
    if (i % 2 === 1) doc.rect(MARGIN, rowY, CONTENT_W, rowH).fill("#FCFCFC");
    doc
      .fontSize(10)
      .fillColor(TEXT)
      .font("Helvetica")
      .text(item.name, MARGIN + 12, rowY + 9, {
        width: CONTENT_W - 220,
        ellipsis: true,
      })
      .text(`${item.quantity}`, MARGIN + CONTENT_W - 200, rowY + 9, {
        width: 40,
        align: "right",
      })
      .text(`₹${item.price.toFixed(2)}`, MARGIN + CONTENT_W - 150, rowY + 9, {
        width: 60,
        align: "right",
      })
      .text(
        `₹${(item.price * item.quantity).toFixed(2)}`,
        MARGIN + CONTENT_W - 70,
        rowY + 9,
        { width: 58, align: "right" },
      );
  });

  y += order.items.length * 28 + 8;
  doc
    .moveTo(MARGIN, y)
    .lineTo(PAGE_W - MARGIN, y)
    .strokeColor(BORDER)
    .lineWidth(1)
    .stroke();

  // BILL SUMMARY
  y += 20;
  const summaryX = MARGIN + CONTENT_W - 220;
  const summaryW = 220;

  const summaryRows = [
    { label: "Subtotal", value: `₹${(order.subtotal || 0).toFixed(2)}` },
    { label: "Delivery Fee", value: `₹${(order.deliveryFee || 0).toFixed(2)}` },
  ];
  if (order.packagingFee > 0)
    summaryRows.push({
      label: "Packaging Fee",
      value: `₹${order.packagingFee.toFixed(2)}`,
    });
  summaryRows.push({ label: "Tax", value: `₹${(order.tax || 0).toFixed(2)}` });
  if (order.discount > 0)
    summaryRows.push({
      label: `Discount${order.couponCode ? ` (${order.couponCode})` : ""}`,
      value: `− ₹${order.discount.toFixed(2)}`,
      color: SUCCESS,
    });

  summaryRows.forEach((row, i) => {
    const rowY = y + i * 18;
    doc
      .fontSize(9)
      .fillColor(row.color || MUTED)
      .font("Helvetica")
      .text(row.label, summaryX, rowY, { width: summaryW - 80 })
      .fillColor(row.color || TEXT)
      .text(row.value, summaryX + summaryW - 80, rowY, {
        width: 80,
        align: "right",
      });
  });

  y += summaryRows.length * 18 + 8;
  doc
    .moveTo(summaryX, y)
    .lineTo(summaryX + summaryW, y)
    .strokeColor(BORDER)
    .lineWidth(1)
    .stroke();
  y += 10;

  doc
    .fontSize(11)
    .fillColor(TEXT)
    .font("Helvetica-Bold")
    .text("TOTAL", summaryX, y, { width: summaryW - 80 })
    .fontSize(13)
    .fillColor(PRIMARY)
    .text(`₹${(order.total || 0).toFixed(2)}`, summaryX + summaryW - 80, y, {
      width: 80,
      align: "right",
    });

  // REFUND INFO
  if (order.refundAmount > 0) {
    y += 40;
    doc.rect(MARGIN, y, CONTENT_W, 50).fill("#FEF2F2").stroke("#FECACA");
    doc
      .fontSize(9)
      .fillColor(DANGER)
      .font("Helvetica-Bold")
      .text("REFUND ISSUED", MARGIN + 14, y + 10);
    doc
      .fontSize(9)
      .fillColor(TEXT)
      .font("Helvetica")
      .text(
        `₹${order.refundAmount.toFixed(2)} refunded on ${order.refundedAt ? new Date(order.refundedAt).toLocaleDateString("en-IN") : "—"}. It may take 5–7 business days to appear in your account.`,
        MARGIN + 14,
        y + 26,
        { width: CONTENT_W - 28 },
      );
    y += 60;
  }

  // FOOTER
  const footerY = Math.max(y + 40, 700);
  doc
    .moveTo(MARGIN, footerY)
    .lineTo(PAGE_W - MARGIN, footerY)
    .strokeColor(BORDER)
    .lineWidth(1)
    .stroke();
  doc
    .fontSize(8)
    .fillColor(MUTED)
    .font("Helvetica")
    .text("Thank you for ordering from SPP FoodieApp!", MARGIN, footerY + 12, {
      width: CONTENT_W,
      align: "center",
    })
    .text(
      "This is a computer-generated invoice. No signature required.",
      MARGIN,
      footerY + 26,
      { width: CONTENT_W, align: "center" },
    )
    .text(
      "support@sppfoodieapp.com  ·  www.sppfoodieapp.com",
      MARGIN,
      footerY + 40,
      {
        width: CONTENT_W,
        align: "center",
      },
    );

  return doc;
};
