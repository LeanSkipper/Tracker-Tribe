import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, forbiddenResponse, getSession, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/peers/gps - Get GPS data for matched peers
export async function GET(req: Request) {
    try {
        // Get authenticated user from session
        const user = await getSession();

        if (!user) {
            return unauthorizedResponse('Please sign in to view peer GPS data');
        }

        // Check if user can view peer GPS (ENGAGED or CREATOR subscription required)
        const permission = await checkPermission(user, 'viewPeerGPS');

        if (!permission.allowed) {
            return forbiddenResponse(permission.message);
        }

        // Get all accepted matches for this user
        const sentMatches = await prisma.match.findMany({
            where: {
                initiatorId: user.id,
                status: 'ACCEPTED'
            },
            include: {
                target: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        reputationScore: true,
                    }
                }
            }
        });

        const receivedMatches = await prisma.match.findMany({
            where: {
                targetId: user.id,
                status: 'ACCEPTED'
            },
            include: {
                initiator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        reputationScore: true,
                    }
                }
            }
        });

        // Get unique peer IDs
        const peerIds = [
            ...sentMatches.map(m => m.targetId),
            ...receivedMatches.map(m => m.initiatorId)
        ];

        // Get GPS data for all matched peers
        const peersGPS = await Promise.all(
            peerIds.map(async (peerId) => {
                const goals = await prisma.goal.findMany({
                    where: {
                        userId: peerId,
                        visibility: {
                            in: ['PUBLIC', 'TRIBE'] // Only show public or tribe-shared goals
                        }
                    },
                    include: {
                        okrs: {
                            select: {
                                id: true,
                                metricName: true,
                                type: true,
                                targetValue: true,
                                currentValue: true,
                                deadlineYear: true,
                                deadlineMonth: true,
                            }
                        }
                    }
                });

                const matchedPeer = [...sentMatches, ...receivedMatches].find(
                    m => m.targetId === peerId || m.initiatorId === peerId
                );

                let peerData;
                if (matchedPeer && 'target' in matchedPeer && matchedPeer.targetId === peerId) {
                    peerData = matchedPeer.target;
                } else if (matchedPeer && 'initiator' in matchedPeer && matchedPeer.initiatorId === peerId) {
                    peerData = matchedPeer.initiator;
                }

                return {
                    peer: peerData,
                    goals: goals.map(g => ({
                        id: g.id,
                        vision: g.vision,
                        category: g.category,
                        status: g.status,
                        okrs: g.okrs
                    }))
                };
            })
        );

        return NextResponse.json(peersGPS);
    } catch (error) {
        console.error("Get Peer GPS Error:", error);
        return NextResponse.json({ error: "Failed to fetch peer GPS data" }, { status: 500 });
    }
}
