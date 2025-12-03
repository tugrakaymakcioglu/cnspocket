import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req) {
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

        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        name: true,
                        username: true
                    }
                }
            }
        });

        return NextResponse.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true }
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'POWERUSER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, content } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                authorId: user.id
            }
        });

        return NextResponse.json(announcement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        return NextResponse.json({ error: 'Failed to create announcement', details: error.message }, { status: 500 });
    }
}
