import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

import { ensureReferralCode } from "@/lib/referral";

// GET /api/profile - Get current user's profile
export async function GET() {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Ensure user has a referral code
        await ensureReferralCode(user.id);

        // Fetch full user profile
        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                name: true,
                email: true,
                userProfile: true,
                subscriptionStatus: true,
                subscriptionPlan: true,
                trialStartDate: true,
                trialEndDate: true,
                reputationScore: true,
                profileCompleteness: true,
                // Referral
                referralCode: true,
                _count: {
                    select: { referrals: true }
                },
                // KPI fields
                grit: true,
                level: true,
                currentXP: true,
                lifetimePositiveXP: true,
                lifetimeNegativeXP: true,
                reviewCount: true,
                createdAt: true,
            },
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error("GET Profile Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

// PUT /api/profile - Update current user's profile
export async function PUT(req: Request) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, email, currentPassword, newPassword } = body;

        // Validate inputs
        if (!name || !email) {
            return NextResponse.json(
                { error: "Name and email are required" },
                { status: 400 }
            );
        }

        // Check if email is being changed and if it's already taken
        if (email !== user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: "Email already in use" },
                    { status: 409 }
                );
            }
        }

        // Prepare update data
        const updateData: any = {
            name,
            email,
        };

        // Handle password change if requested
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: "Current password is required to set a new password" },
                    { status: 400 }
                );
            }

            // Verify current password
            const userWithPassword = await prisma.user.findUnique({
                where: { id: user.id },
                select: { password: true },
            });

            if (!userWithPassword?.password) {
                return NextResponse.json(
                    { error: "No password set for this account" },
                    { status: 400 }
                );
            }

            const isPasswordValid = await bcrypt.compare(
                currentPassword,
                userWithPassword.password
            );

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: "Current password is incorrect" },
                    { status: 401 }
                );
            }

            // Hash new password
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Update user profile
        const updatedProfile = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                userProfile: true,
                subscriptionStatus: true,
                subscriptionPlan: true,
                trialStartDate: true,
                trialEndDate: true,
                reputationScore: true,
                profileCompleteness: true,
                // KPI fields
                grit: true,
                level: true,
                currentXP: true,
                lifetimePositiveXP: true,
                lifetimeNegativeXP: true,
                reviewCount: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            message: "Profile updated successfully",
            profile: updatedProfile,
        });
    } catch (error) {
        console.error("PUT Profile Error:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
