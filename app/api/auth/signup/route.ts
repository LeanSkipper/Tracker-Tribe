import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                userProfile: 'SOFT', // Default to SOFT
                subscriptionStatus: 'TRIAL',
                subscriptionPlan: 'SOFT_FREE',
                trialStartDate: now,
                trialEndDate: trialEnd,
                reputationScore: 0,
                profileCompleteness: name ? 10 : 0,
            }
        });

        console.log('[SIGNUP] User created successfully:', user.id);

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

    } catch (error) {
    console.error("=== SIGNUP ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error:", error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Prisma client available:", !!prisma);
    console.error("Prisma user model:", prisma.user ? 'Available' : 'Not available');
    console.error("===================");

    return NextResponse.json(
        {
            error: "Failed to create account",
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
    );
}
}
