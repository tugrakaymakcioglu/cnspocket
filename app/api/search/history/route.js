import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

// Get search history
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ history: [] });
        }

        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ history: [] });
        }

        const history = await prismaClient.searchHistory.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
            distinct: ['query']
        });

        return NextResponse.json({ history: history.map(h => h.query) });
    } catch (error) {
        console.error('Error fetching search history:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}

// Clear search history
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await prismaClient.searchHistory.deleteMany({
            where: { userId: user.id }
        });

        return NextResponse.json({ message: 'History cleared' });
    } catch (error) {
        console.error('Error clearing history:', error);
        return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
    }
}
