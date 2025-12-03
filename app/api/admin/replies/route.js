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

        const user = await prismaClient.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const replies = await prismaClient.reply.findMany({
            take: limit,
            skip: (page - 1) * limit,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        banned: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        return NextResponse.json({ replies });
    } catch (error) {
        console.error('Error fetching replies:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const user = await prismaClient.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const replyId = searchParams.get('id');

        if (!replyId) {
            return NextResponse.json({ error: 'Reply ID required' }, { status: 400 });
        }

        await prismaClient.reply.delete({
            where: { id: replyId }
        });

        return NextResponse.json({ message: 'Reply deleted successfully' });
    } catch (error) {
        console.error('Error deleting reply:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
