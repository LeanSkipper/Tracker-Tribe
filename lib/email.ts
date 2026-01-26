import { Resend } from 'resend';
import { WelcomeEmailTemplate, CreatorWelcomeEmailTemplate } from './email-templates';

export async function sendWelcomeEmail(email: string, name: string) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Skipping email sending.');
        return null;
    }

    const resend = new Resend(apiKey);

    const fromEmail = process.env.EMAIL_FROM || 'Lapis Team <onboarding@resend.dev>';

    try {
        const response = await resend.emails.send({
            from: fromEmail,
            to: [email],
            subject: 'Welcome to Lapis Platform! 🚀',
            html: WelcomeEmailTemplate(name)
        });

        if (response.error) {
            console.error('[EMAIL] Welcome email API error:', response.error);
            return null;
        }

        console.log('[EMAIL] Welcome email sent successfully:', response.data);
        return response;
    } catch (error) {
        console.error('[EMAIL] Failed to send welcome email:', JSON.stringify(error, null, 2));
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

    const fromEmail = process.env.EMAIL_FROM || 'Lapis Team <onboarding@resend.dev>';

    try {
        const response = await resend.emails.send({
            from: fromEmail,
            to: [email],
            subject: '👑 Welcome to the Creator Circle',
            html: CreatorWelcomeEmailTemplate(name)
        });

        if (response.error) {
            console.error('[EMAIL] Creator email API error:', response.error);
            return null;
        }

        console.log('[EMAIL] Creator email sent successfully:', response.data);
        return response;
    } catch (error) {
        console.error('[EMAIL] Failed to send creator email:', JSON.stringify(error, null, 2));
        return null;
    }
}

import { TribeApplicationAdminEmail, TribeApplicationUserConfirmationEmail } from './email-templates';

export async function sendTribeApplicationEmails({
    adminEmail,
    adminName,
    userEmail,
    userName,
    tribeName,
    userProfileLink
}: {
    adminEmail: string;
    adminName: string;
    userEmail: string;
    userName: string;
    tribeName: string;
    userProfileLink: string;
}) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Skipping application emails.');
        return null;
    }

    const resend = new Resend(apiKey);
    const results = { admin: null, user: null };

    const fromEmail = process.env.EMAIL_FROM || 'Lapis Tribe <notifications@resend.dev>';

    // 1. Notify Admin
    try {
        const adminResponse = await resend.emails.send({
            from: fromEmail,
            to: [adminEmail],
            subject: `New Application: ${userName} wants to join ${tribeName}`,
            html: TribeApplicationAdminEmail(adminName, userName, tribeName, userProfileLink)
        });

        if (adminResponse.error) {
            console.error('[EMAIL] Admin notification API error:', adminResponse.error);
        } else {
            console.log('[EMAIL] Admin notification sent successfully:', adminResponse.data);
            // @ts-expect-error - resend types might be slightly off
            results.admin = adminResponse;
        }
    } catch (error) {
        console.error('[EMAIL] Failed to send admin notification:', JSON.stringify(error, null, 2));
    }

    // 2. Notify User (Confirmation)
    try {
        const userResponse = await resend.emails.send({
            from: fromEmail,
            to: [userEmail],
            subject: `Application Received: ${tribeName}`,
            html: TribeApplicationUserConfirmationEmail(userName, tribeName)
        });

        if (userResponse.error) {
            console.error('[EMAIL] User confirmation API error:', userResponse.error);
        } else {
            console.log('[EMAIL] User confirmation sent successfully:', userResponse.data);
            // @ts-expect-error - resend types might be slightly off
            results.user = userResponse;
        }
    } catch (error) {
        console.error('[EMAIL] Failed to send user confirmation:', JSON.stringify(error, null, 2));
    }

    return results;
}
