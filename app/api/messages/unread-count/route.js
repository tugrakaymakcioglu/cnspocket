import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ count: 0 });
        }

        const userEmail = session.user.email;
        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            return NextResponse.json({ count: 0 });
        }

        const count = await prisma.message.count({
            where: {
                receiverId: user.id,
                read: false
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return NextResponse.json({ count: 0 });
    }
}
