import { prisma } from "./prisma";
import crypto from 'crypto';

export function generateReferralCode(length = 8): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase();
}

export async function ensureReferralCode(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referralCode: true }
    });

    if (user?.referralCode) return user.referralCode;

    // Generate unique code
    let code = generateReferralCode();
    let unique = false;
    let attempts = 0;

    while (!unique && attempts < 5) {
        const existing = await prisma.user.findUnique({
            where: { referralCode: code }
        });
        if (!existing) {
            unique = true;
        } else {
            code = generateReferralCode();
            attempts++;
        }
    }

    if (!unique) throw new Error("Failed to generate unique referral code");

    await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code }
    });

    return code;
}
