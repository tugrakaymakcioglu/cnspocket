import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

// GET deadline notifications
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Get tasks with approaching deadlines (within 24 hours)
        const approachingDeadlines = await prismaClient.task.findMany({
            where: {
                userId: user.id,
                completed: false,
                dueDate: {
                    gte: now,
                    lte: tomorrow
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });

        // Get overdue tasks
        const overdueTasks = await prismaClient.task.findMany({
            where: {
                userId: user.id,
                completed: false,
                dueDate: {
                    lt: now
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });

        // Get tasks that need showing (deadline time has arrived)
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

        const deadlineNow = await prismaClient.task.findMany({
            where: {
                userId: user.id,
                completed: false,
                dueDate: {
                    gte: new Date(now.setHours(0, 0, 0, 0)),
                    lte: new Date(now.setHours(23, 59, 59, 999))
                },
                dueTime: {
                    lte: currentTimeString
                },
                notifiedAt: null
            }
        });

        return NextResponse.json({
            approaching: approachingDeadlines,
            overdue: overdueTasks,
            now: deadlineNow,
            count: approachingDeadlines.length + overdueTasks.length + deadlineNow.length
        });

    } catch (error) {
        console.error('Error fetching deadline notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PATCH mark task as notified
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { taskId } = body;

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
        }

        await prismaClient.task.update({
            where: { id: taskId },
            data: { notifiedAt: new Date() }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error marking notification:', error);
        return NextResponse.json({ error: 'Failed to mark notification' }, { status: 500 });
    }
}
