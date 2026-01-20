import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { targetUserId, scores, comment } = body;

        // Validation
        if (!targetUserId || !scores || Object.keys(scores).length !== 10) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Check if reviewing self
        if (targetUserId === session.id) {
            return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });
        }

        // Calculate average
        const criteria = [
            'reliability', 'activePresence', 'constructiveCandor', 'generosity',
            'energyCatalyst', 'responsiveness', 'coachability', 'knowledgeTransparency',
            'emotionalRegulation', 'preparation'
        ];

        // Ensure all are numbers 1-10
        let total = 0;
        for (const c of criteria) {
            const val = scores[c];
            if (typeof val !== 'number' || val < 1 || val > 10) {
                return NextResponse.json({ error: `Invalid score for ${c}` }, { status: 400 });
            }
            total += val;
        }
        const averageScore = total / 10;

        // Create Review
        const review = await prisma.reputationReview.create({
            data: {
                reviewerId: session.id,
                targetUserId,
                reliability: scores.reliability,
                activePresence: scores.activePresence,
                constructiveCandor: scores.constructiveCandor,
                generosity: scores.generosity,
                energyCatalyst: scores.energyCatalyst,
                responsiveness: scores.responsiveness,
                coachability: scores.coachability,
                knowledgeTransparency: scores.knowledgeTransparency,
                emotionalRegulation: scores.emotionalRegulation,
                preparation: scores.preparation,
                averageScore,
                comment,
            }
        });

        // Award XP to Reviewer (10 XP)
        await prisma.user.update({
            where: { id: session.id },
            data: {
                currentXP: { increment: 10 },
                lifetimePositiveXP: { increment: 10 },
                experience: { increment: 10 }
            }
        });

        // Recalculate Target User's Aggregate Reputation Score (Optional, user model has `reputationScore` float)
        // Let's update the user's main reputation score for quick access
        const allReviews = await prisma.reputationReview.findMany({
            where: { targetUserId },
            select: { averageScore: true }
        });
        const globalAvg = allReviews.reduce((acc, curr) => acc + curr.averageScore, 0) / allReviews.length;

        await prisma.user.update({
            where: { id: targetUserId },
            data: { reputationScore: globalAvg }
        });

        return NextResponse.json({ success: true, review, newReputation: globalAvg });

    } catch (error) {
        console.error("Reputation API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
