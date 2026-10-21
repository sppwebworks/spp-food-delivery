/**
 * ============================================================
 * SUPPORT EMAIL TEMPLATES
 * ============================================================
 */

import { baseTemplate } from "./baseTemplate.js";

/**
 * Email sent to the CUSTOMER when an Admin replies
 */
export const customerSupportReplyEmail = ({
  name,
  ticketNumber,
  subject,
  replyMessage,
  ticketId,
}) => {
  const ticketUrl = `${process.env.CLIENT_URL}/support/${ticketId}`;

  const content = `
    <h2 style="font-size: 20px; margin-bottom: 16px; color: #282c3f;">Support Team Replied</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #282c3f; margin-bottom: 24px;">
      Hi ${name}, our support team has replied to your ticket <strong>#${ticketNumber}</strong>.
    </p>
    
    <div style="background: #f4f6f8; border-left: 4px solid #FC8019; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: #93959f; margin-bottom: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Message:</p>
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #282c3f;">"${replyMessage}"</p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${ticketUrl}" style="background: #FC8019; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;">
        View & Reply to Ticket
      </a>
    </div>
  `;

  const emailSubject = `Re: [${ticketNumber}] ${subject}`;
  const html = baseTemplate({ title: emailSubject, body: content });

  return { subject: emailSubject, html }; // ✅ Returns proper subject and html
};

/**
 * Email sent to the ADMIN when a Customer replies
 */
export const adminSupportReplyEmail = ({
  customerName,
  ticketNumber,
  subject,
  replyMessage,
  ticketId,
}) => {
  const ticketUrl = `${process.env.ADMIN_URL}/support`;

  const content = `
    <h2 style="font-size: 20px; margin-bottom: 16px; color: #282c3f;">New Customer Reply</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #282c3f; margin-bottom: 24px;">
      <strong>${customerName}</strong> has replied to ticket <strong>#${ticketNumber}</strong>.
    </p>
    
    <div style="background: #f4f6f8; border-left: 4px solid #282C3F; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: #93959f; margin-bottom: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Message:</p>
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #282c3f;">"${replyMessage}"</p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${ticketUrl}" style="background: #FC8019; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;">
        Open Admin Inbox
      </a>
    </div>
  `;

  const emailSubject = `[Action Required] Customer Replied: ${ticketNumber}`;
  const html = baseTemplate({ title: emailSubject, body: content });

  return { subject: emailSubject, html }; // ✅ Returns proper subject and html
};
