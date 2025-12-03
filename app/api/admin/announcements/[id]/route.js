import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'POWERUSER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.announcement.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'POWERUSER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { active } = await req.json();

        const announcement = await prisma.announcement.update({
            where: { id },
            data: { active }
        });

        return NextResponse.json(announcement);
    } catch (error) {
        console.error('Error updating announcement:', error);
        return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }
}
