import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

// GET all tasks for the logged-in user
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

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const completed = searchParams.get('completed');

        const where = {
            userId: user.id,
            ...(category && category !== 'ALL' ? { category } : {}),
            ...(completed !== null ? { completed: completed === 'true' } : {})
        };

        const tasks = await prismaClient.task.findMany({
            where,
            orderBy: [
                { completed: 'asc' },
                { dueDate: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST create a new task
export async function POST(req) {
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

        const body = await req.json();
        const { title, description, priority, category, dueDate, dueTime } = body;

        console.log('Creating task:', { title, priority, category, dueDate, dueTime });

        if (!title?.trim()) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const task = await prismaClient.task.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                priority: priority || 'MEDIUM',
                category: category || 'PERSONAL',
                dueDate: dueDate ? new Date(dueDate) : null,
                dueTime: dueTime || null,
                userId: user.id
            }
        });

        console.log('Task created successfully:', task.id);
        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({
            error: 'Failed to create task',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
