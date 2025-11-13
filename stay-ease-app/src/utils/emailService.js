// src/utils/emailService.js
import emailjs from "@emailjs/browser";

// Initialize EmailJS with public key
const initializeEmailJS = () => {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (publicKey) {
    emailjs.init(publicKey);
  }
};

// Initialize on import
initializeEmailJS();

/**
 * Send verification email via EmailJS
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - User's full name
 * @param {string} verificationLink - Firebase verification link
 */
export const sendVerificationEmail = async (toEmail, userName, verificationLink) => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("❌ EmailJS configuration missing. Please check your .env file.");
      throw new Error("Email service not configured");
    }

    const result = await emailjs.send(
      serviceId,
      templateId,
      {
        to_name: userName,
        to_email: toEmail,
        user_name: userName,
        email: toEmail,
        verification_link: verificationLink,
        app_name: "StayEase",
      },
      publicKey
    );

    console.log("✅ Verification email sent successfully!", result);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw error;
  }
};

/**
 * Send welcome email via EmailJS
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - User's full name
 */
export const sendWelcomeEmail = async (toEmail, userName) => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const welcomeTemplateId = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !welcomeTemplateId || !publicKey) {
      console.warn("⚠️ EmailJS welcome email configuration missing. Skipping welcome email.");
      return { success: false, skipped: true };
    }

    const result = await emailjs.send(
      serviceId,
      welcomeTemplateId,
      {
        to_name: userName,
        to_email: toEmail,
        user_name: userName,
        email: toEmail,
        app_name: "StayEase",
      },
      publicKey
    );

    console.log("✅ Welcome email sent successfully!", result);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    // Don't throw - welcome email is not critical
    return { success: false, error };
  }
};

