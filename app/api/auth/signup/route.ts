import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

// POST /api/auth/signup - Register new user
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        console.log('[SIGNUP] Starting signup process for:', email);

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        console.log('[SIGNUP] Hashing password...');
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('[SIGNUP] Creating user in database...');
        // Create user with 60-day trial
        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + 60); // 60 days from now

        // Check for referral cookie
        const cookieHeader = req.headers.get('cookie');
        let referralCode = null;
        if (cookieHeader) {
            const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
            referralCode = cookies['tracker_tribe_ref'];
        }

        let referrerId = null;
        if (referralCode) {
            const referrer = await prisma.user.findUnique({ where: { referralCode } });
            if (referrer) {
                referrerId = referrer.id;
            }
        }

        const user = await prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || null,
                    userProfile: 'SOFT',
                    subscriptionStatus: 'TRIAL',
                    subscriptionPlan: 'SOFT_FREE',
                    trialStartDate: now,
                    trialEndDate: trialEnd,
                    reputationScore: 0,
                    profileCompleteness: name ? 10 : 0,
                },
            });

            // Process referral if exists
            if (referrerId) {
                await tx.referral.create({
                    data: {
                        referrerId: referrerId,
                        referredUserId: createdUser.id,
                        status: "COMPLETED", // Signup completed
                    }
                });

                // Award 50 XP to referrer
                await tx.user.update({
                    where: { id: referrerId },
                    data: {
                        currentXP: { increment: 50 },
                        lifetimePositiveXP: { increment: 50 },
                        // Recalculate level if needed (simple logic provided here, ideally centralized)
                    }
                });
            }

            return createdUser;
        });

        console.log('[SIGNUP] User created successfully:', user.id);

        // Send Welcome Email (Fire and forget, don't await/block response)
        // We catch locally just in case, though sendWelcomeEmail already catches
        if (email) {
            sendWelcomeEmail(email, name || 'Member').catch(err =>
                console.error('[SIGNUP] Failed to trigger welcome email:', err)
            );
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            message: "Account created! Your 60-day free trial has started."
        });

    } catch (error) {
        console.error("=== SIGNUP ERROR ===");
        console.error("Error:", error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
        console.error("====================");

        return NextResponse.json(
            {
                message: "Failed to create account",
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
