import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user
        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get all active sessions for this user
        const sessions = await prismaClient.userSession.findMany({
            where: {
                userId: user.id,
                expiresAt: {
                    gt: new Date() // Only active sessions
                }
            },
            orderBy: {
                lastActive: 'desc'
            }
        });

        // Format sessions for frontend
        const formattedSessions = sessions.map(s => ({
            id: s.id,
            device: s.device || 'Unknown Device',
            browser: s.browser || 'Unknown Browser',
            os: s.os || 'Unknown OS',
            ipAddress: s.ipAddress || 'Unknown',
            country: s.country || 'Unknown',
            city: s.city || 'Unknown',
            region: s.region || 'Unknown',
            createdAt: s.createdAt,
            lastActive: s.lastActive,
            // Mark current session (we'll use a simple heuristic)
            isCurrent: false // Will be determined by frontend
        }));

        return NextResponse.json({ sessions: formattedSessions });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Error fetching sessions' }, { status: 500 });
    }
}
