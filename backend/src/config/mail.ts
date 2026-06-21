import nodemailer from 'nodemailer';
import { env } from './env';
import { logger } from './logger';

export const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    if (
      env.EMAIL_USER.includes('placeholder') || 
      env.EMAIL_PASSWORD.includes('placeholder') || 
      env.EMAIL_HOST.includes('placeholder')
    ) {
      logger.info(`[MAIL MOCK] To: ${to}, Subject: ${subject}`);
      logger.info(`[MAIL MOCK] Content:\n${html}`);
      return;
    }

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`[MAIL] Email sent successfully to ${to}`);
  } catch (error) {
    logger.error('❌ Failed to send email:', error);
    // In development/test mode, fall back to logging instead of crashing/blocking
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      logger.info(`[MAIL FALLBACK] To: ${to}, Subject: ${subject}`);
      logger.info(`[MAIL FALLBACK] Content:\n${html}`);
      return;
    }
    throw error;
  }
};
