/**
 * ============================================================
 * BASE EMAIL TEMPLATE
 * ============================================================
 * Every email wraps its body with this function.
 * Provides a consistent header, footer, and food-themed branding.
 *
 * Uses inline CSS (email clients don't support <style> reliably).
 * ============================================================
 */

export const baseTemplate = ({
  preheader = "",
  title = "",
  body = "",
  ctaText = "",
  ctaUrl = "",
  accentColor = "#fc8019",
}) => {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#282c3f;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f7fb;padding:32px 16px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 32px 26px;text-align:center;">
              <div style="font-size:28px;margin-bottom:8px;">🍽️</div>
              <div style="font-size:22px;font-weight:800;color:${accentColor};letter-spacing:-0.5px;">
                FoodieHub
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:4px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">
                Order food, deliver happiness
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              ${body}
            </td>
          </tr>

          <!-- CTA button (optional) -->
          ${
            ctaText && ctaUrl
              ? `
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${ctaUrl}" style="display:inline-block;background:${accentColor};color:#ffffff;text-decoration:none;padding:14px 34px;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:0.5px;">
                ${ctaText}
              </a>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Divider + Support -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e9e9eb;margin:0 0 20px;" />
              <p style="font-size:13px;color:#686b78;margin:0 0 12px;line-height:1.6;">
                Need help? Reply to this email or visit our
                <a href="#" style="color:${accentColor};text-decoration:none;font-weight:600;">Help Center</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:24px 32px;text-align:center;border-top:1px solid #e9e9eb;">
              <p style="font-size:12px;color:#93959f;margin:0 0 10px;line-height:1.5;">
                © ${year} FoodieHub · Built with ❤️ in India
              </p>
              <p style="font-size:11px;color:#b0b3ba;margin:0;">
                You received this email because you have an account with FoodieHub.
              </p>
            </td>
          </tr>

        </table>

        <!-- Legal line under card -->
        <p style="font-size:11px;color:#93959f;margin:18px 0 0;text-align:center;line-height:1.5;">
          This is an automated message — please do not reply directly.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
};

export default baseTemplate;
