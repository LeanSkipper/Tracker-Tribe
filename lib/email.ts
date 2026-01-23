import { Resend } from 'resend';
import { WelcomeEmailTemplate, CreatorWelcomeEmailTemplate } from './email-templates';

export async function sendWelcomeEmail(email: string, name: string) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Skipping email sending.');
        return null;
    }

    const resend = new Resend(apiKey);

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

export async function sendCreatorWelcomeEmail(email: string, name: string) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Skipping creator email.');
        return null;
    }

    const resend = new Resend(apiKey);

    try {
        const data = await resend.emails.send({
            from: 'Lapis Team <onboarding@resend.dev>',
            to: [email],
            subject: '👑 Welcome to the Creator Circle',
            html: CreatorWelcomeEmailTemplate(name)
        });

        console.log('[EMAIL] Creator email sent:', data);
        return data;
    } catch (error) {
        console.error('[EMAIL] Failed to send creator email:', error);
        return null;
    }
}
