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

import { TribeApplicationAdminEmail, TribeApplicationUserConfirmationEmail } from './email-templates';

export async function sendTribeApplicationEmails({
    adminEmail,
    adminName,
    userEmail,
    userName,
    tribeName,
    tribeId,
    userProfileLink
}: {
    adminEmail: string;
    adminName: string;
    userEmail: string;
    userName: string;
    tribeName: string;
    tribeId: string;
    userProfileLink: string;
}) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Skipping application emails.');
        return null;
    }

    const resend = new Resend(apiKey);
    const results = { admin: null, user: null };

    // 1. Notify Admin
    try {
        const adminData = await resend.emails.send({
            from: 'Lapis Tribe <notifications@resend.dev>',
            to: [adminEmail],
            subject: `New Application: ${userName} wants to join ${tribeName}`,
            html: TribeApplicationAdminEmail(adminName, userName, tribeName, userProfileLink)
        });
        console.log('[EMAIL] Admin notification sent:', adminData);
        // @ts-ignore
        results.admin = adminData;
    } catch (error) {
        console.error('[EMAIL] Failed to send admin notification:', error);
    }

    // 2. Notify User (Confirmation)
    try {
        const userData = await resend.emails.send({
            from: 'Lapis Tribe <notifications@resend.dev>',
            to: [userEmail],
            subject: `Application Received: ${tribeName}`,
            html: TribeApplicationUserConfirmationEmail(userName, tribeName)
        });
        console.log('[EMAIL] User confirmation sent:', userData);
        // @ts-ignore
        results.user = userData;
    } catch (error) {
        console.error('[EMAIL] Failed to send user confirmation:', error);
    }

    return results;
}
