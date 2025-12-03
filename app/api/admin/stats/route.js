import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '@/lib/roles';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get user's current role from database
        const user = await prismaClient.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get statistics
        const [totalUsers, totalPosts, totalReplies, totalNotes, totalMessages] = await Promise.all([
            prismaClient.user.count(),
            prismaClient.post.count(),
            prismaClient.reply.count(),
            prismaClient.note.count(),
            prismaClient.message.count(),
        ]);

        const bannedUsers = await prismaClient.user.count({ where: { banned: true } });
        const recentUsers = await prismaClient.user.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                role: true
            }
        });

        return NextResponse.json({
            stats: {
                totalUsers,
                totalPosts,
                totalReplies,
                totalNotes,
                totalMessages,
                bannedUsers
            },
            recentUsers
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
