import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userEmail = session.user.email;
        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update lastSeen timestamp
        await prisma.user.update({
            where: { id: user.id },
            data: { lastSeen: new Date() }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating lastSeen:', error);
        return NextResponse.json({ error: 'Failed to update lastSeen' }, { status: 500 });
    }
}
