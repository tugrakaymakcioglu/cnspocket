import { NextResponse } from 'next/server';
import { getServerSession, signOut } from 'next-auth/react';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function POST(req) {
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

        // Delete all sessions for this user
        await prismaClient.userSession.deleteMany({
            where: { userId: user.id }
        });

        return NextResponse.json({ message: 'All sessions terminated successfully' });
    } catch (error) {
        console.error('Error terminating all sessions:', error);
        return NextResponse.json({ error: 'Error terminating sessions' }, { status: 500 });
    }
}
