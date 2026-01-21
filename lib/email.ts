import { Resend } from 'resend';
import { WelcomeEmailTemplate } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email sending.');
        return null;
    }

    try {
        const data = await resend.emails.send({
            from: 'Lapis Team <onboarding@resend.dev>', // Update this with your verified domain later
            to: [email],
            subject: 'Welcome to Lapis Platform! 🚀',
            html: WelcomeEmailTemplate(name)
        });

        console.log('[EMAIL] Welcome email sent:', data);
        return data;
    } catch (error) {
        console.error('[EMAIL] Failed to send welcome email:', error);
        // We don't throw here to avoid failing the signup process
        return null;
    }
}
