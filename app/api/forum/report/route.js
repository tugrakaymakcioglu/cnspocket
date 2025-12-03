import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { reason, postId, replyId } = await req.json();

        if (!reason) {
            return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
        }

        if (!postId && !replyId) {
            return NextResponse.json({ error: 'Post ID or Reply ID required' }, { status: 400 });
        }

        const report = await prisma.report.create({
            data: {
                reason,
                reporterId: session.user.id,
                postId: postId || undefined,
                replyId: replyId || undefined
            }
        });

        // Create notification for admins
        const admins = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'POWERUSER'] } }
        });

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    type: 'report',
                    reportId: report.id,
                    content: `Yeni bir rapor: ${reason}`,
                    postId: postId || undefined,
                    replyId: replyId || undefined
                }))
            });
        }

        return NextResponse.json({ message: 'Report submitted', report });

    } catch (error) {
        console.error('Report error:', error);
        return NextResponse.json({ error: 'Error submitting report' }, { status: 500 });
    }
}
