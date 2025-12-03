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

        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email },
            select: {
                profileVisible: true,
                allowMessages: true,
                showOnlineStatus: true,
            }
        });

        return NextResponse.json(user || {});
    } catch (error) {
        console.error('Error fetching privacy settings:', error);
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { profileVisible, allowMessages, showOnlineStatus } = await req.json();

        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updated = await prismaClient.user.update({
            where: { id: user.id },
            data: {
                profileVisible: profileVisible ?? user.profileVisible,
                allowMessages: allowMessages ?? user.allowMessages,
                showOnlineStatus: showOnlineStatus ?? user.showOnlineStatus,
            }
        });

        return NextResponse.json({
            profileVisible: updated.profileVisible,
            allowMessages: updated.allowMessages,
            showOnlineStatus: updated.showOnlineStatus,
        });
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
    }
}
