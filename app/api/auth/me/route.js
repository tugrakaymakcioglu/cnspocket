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

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Fetch fresh user data from database
        const user = await prismaClient.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                banned: true,
                avatar: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
