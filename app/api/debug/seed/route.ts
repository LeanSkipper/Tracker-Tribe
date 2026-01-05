import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BadgeType } from "@prisma/client";

export async function GET() {
    try {
        // 1. Create Badge Catalog (Idempotent)
        const badges = [
            { name: "Scout", type: BadgeType.Rank, iconName: "Bronze Chevron", description: "Default Entry Level", criteriaLogic: "Sessions < 10" },
            { name: "Ranger", type: BadgeType.Rank, iconName: "Silver Shield", description: "The Regular", criteriaLogic: "Attendance > 80% (last 10 weeks) AND Task_Completion > 60%" },
            { name: "Guardian", type: BadgeType.Rank, iconName: "Gold Shield with Wings", description: "The Supporter", criteriaLogic: "Active > 6 months AND Sponsorship > 500 AND Go-Giver award" },
            { name: "Captain", type: BadgeType.Rank, iconName: "Gold Bars", description: "The Leader", criteriaLogic: "Active > 1 Year AND Task_Completion > 85%" },
            { name: "Commander", type: BadgeType.Rank, iconName: "Diamond Eagle", description: "The Legend", criteriaLogic: "Manual Admin/Tribe Vote" },
            { name: "The Go-Giver", type: BadgeType.Monthly_Honor, iconName: "🤝", description: "Highest Altruism votes", criteriaLogic: "Won Monthly Vote" },
            { name: "The Investor", type: BadgeType.Monthly_Honor, iconName: "💰", description: "Contributed > 500€ to Sponsorship", criteriaLogic: "Sponsorship > 500" },
        ];

        for (const b of badges) {
            await prisma.badgeCatalog.upsert({
                where: { name: b.name },
                update: b,
                create: b as any,
            });
        }

        // Cleanup existing data for clean slate (except users/badges)
        // Using raw SQL to avoid potential Prisma client naming issues during rapid prototyping
        try {
            await prisma.$executeRawUnsafe(`DELETE FROM "TribeMember";`);
            await prisma.$executeRawUnsafe(`DELETE FROM "UserAchievement";`);
            await prisma.$executeRawUnsafe(`DELETE FROM "Action";`);
            await prisma.$executeRawUnsafe(`DELETE FROM "OKR";`);
            await prisma.$executeRawUnsafe(`DELETE FROM "Goal";`);
            await prisma.$executeRawUnsafe(`DELETE FROM "Tribe";`);
        } catch (e) {
            console.warn("Cleanup warning (ignorable if tables empty):", e);
        }

        // 2. Create User (Tiago - Guardian Level)
        const tiagoData = {
            username: "tiago",
            password: "password123",
            name: "Tiago",
            level: 5,
            experience: 3500,
            grit: 85,
            sessionsAttended: 12,
            taskCompletionRate: 0.75,
            totalSponsorship: 650,
            totalReliability: 92,
            skills: JSON.stringify({ Marketing: 4, Sales: 3, Tech: 5 }),
            createdAt: new Date(Date.now() - 7 * 30 * 24 * 60 * 60 * 1000), // 7 months ago
        };

        const tiago = await prisma.user.upsert({
            where: { email: "tiago@example.com" },
            update: tiagoData,
            create: { ...tiagoData, email: "tiago@example.com" }
        });

        // Award badges to make him Guardian
        const gBadge = await prisma.badgeCatalog.findUnique({ where: { name: "The Go-Giver" } });
        const iBadge = await prisma.badgeCatalog.findUnique({ where: { name: "The Investor" } });
        if (gBadge && iBadge) {
            await prisma.userAchievement.createMany({
                data: [
                    { userId: tiago.id, badgeId: gBadge.id },
                    { userId: tiago.id, badgeId: iBadge.id }
                ],
                skipDuplicates: true
            });
        }

        // 3. Create Tribes with Creator
        const tribeAlpha = await prisma.tribe.create({
            data: {
                id: "tribe-alpha",
                name: "Alpha Mastermind",
                topic: "Scaling SaaS",
                meetingTime: "Friday 10:00 AM",
                creatorId: tiago.id,
                matchmakingCriteria: "SaaS Focus, $5k+ MRR",
                affiliateCommission: 15.0,
                members: {
                    create: { userId: tiago.id, role: "ADMIN" }
                }
            }
        });

        const tribeBeta = await prisma.tribe.create({
            data: {
                id: "tribe-beta",
                name: "Beta Growth",
                topic: "E-commerce Mastery",
                meetingTime: "Wednesday 4:00 PM",
                creatorId: tiago.id,
                members: {
                    create: { userId: tiago.id, role: "ADMIN" }
                }
            }
        });

        // 4. Create Members
        const sarah = await prisma.user.upsert({
            where: { email: "sarah@example.com" },
            update: { name: "Sarah" },
            create: { email: "sarah@example.com", name: "Sarah" }
        });

        await prisma.tribeMember.create({
            data: { userId: sarah.id, tribeId: tribeAlpha.id, role: "MODERATOR" }
        });

        // 5. Create Goals & OKRs (Explicitly shared with Alpha)
        await prisma.goal.create({
            data: {
                userId: tiago.id,
                vision: "Build the Ultimate Mastermind Platform",
                okrs: {
                    create: [
                        {
                            metricName: "Active Users",
                            targetValue: 1000,
                            currentValue: 450,
                            sharedTribes: { connect: { id: tribeAlpha.id } },
                            actions: {
                                create: [
                                    { userId: tiago.id, description: "Launch Profile Pages", status: "DONE", dueDate: new Date(), weekDate: new Date() },
                                    { userId: tiago.id, description: "Integrate Real-time GPS View", status: "NOT_DONE", dueDate: new Date(), weekDate: new Date() }
                                ]
                            }
                        }
                    ]
                }
            }
        });

        return NextResponse.json({ message: "Seeding successful", tribe: "Alpha Mastermind", creator: "Tiago (Admin)" });
    } catch (error) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: "Seed failed", details: String(error) }, { status: 500 });
    }
}
