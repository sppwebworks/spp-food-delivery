/**
 * Barrel export — import everything from one place:
 *   import { sendEmail, welcomeEmail, orderConfirmationEmail } from "../emails/index.js";
 */

export { sendEmail, sendAsync } from "./emailService.js";
export { baseTemplate } from "./templates/baseTemplate.js";
export { welcomeEmail } from "./templates/welcomeEmail.js";
export { loginAlertEmail } from "./templates/loginAlertEmail.js";
export { orderConfirmationEmail } from "./templates/orderConfirmationEmail.js";
export { orderStatusEmail } from "./templates/orderStatusEmail.js";
export { passwordResetEmail } from "./templates/passwordResetEmail.js";
export {
  contactAdminEmail,
  contactUserEmail,
} from "./templates/contactUsEmail.js";

export {
  customerSupportReplyEmail,
  adminSupportReplyEmail,
} from "./templates/supportReplyEmail.js";
