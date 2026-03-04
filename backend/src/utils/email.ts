import { Resend } from 'resend';
import { env } from '../config/env';

// Make sure to use environment variable
const resend = new Resend(env.resendApiKey);

export const sendFineEmail = async (to: string, subject: string, html: string) => {
    try {
        if (!env.resendApiKey) {
            console.warn('RESEND_API_KEY is not configured. Skipping email sending.');
            return null;
        }

        const data = await resend.emails.send({
            from: 'RMUTI Library <onboarding@resend.dev>', // Update with official domain if needed
            to: [to],
            subject,
            html,
        });

        console.log(`Email sent successfully to ${to}`);
        return data;
    } catch (error) {
        console.error('Error sending fine email:', error);
        throw error;
    }
};
