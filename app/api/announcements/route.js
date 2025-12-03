import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { active: true },
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
