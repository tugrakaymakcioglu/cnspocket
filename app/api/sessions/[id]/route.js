import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Get user
        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify session belongs to user
        const userSession = await prismaClient.userSession.findUnique({
            where: { id }
        });

        if (!userSession || userSession.userId !== user.id) {
            return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
        }

        // Delete session
        await prismaClient.userSession.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Session terminated successfully' });
    } catch (error) {
        console.error('Error deleting session:', error);
        return NextResponse.json({ error: 'Error deleting session' }, { status: 500 });
    }
}
