import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

// PATCH update a task
export async function PATCH(req, { params }) {
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

        const { id } = await params;
        const body = await req.json();

        // Verify task belongs to user
        const existingTask = await prismaClient.task.findUnique({
            where: { id }
        });

        if (!existingTask || existingTask.userId !== user.id) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const task = await prismaClient.task.update({
            where: { id },
            data: {
                ...(body.title !== undefined && { title: body.title.trim() }),
                ...(body.description !== undefined && { description: body.description?.trim() }),
                ...(body.completed !== undefined && { completed: body.completed }),
                ...(body.priority !== undefined && { priority: body.priority }),
                ...(body.category !== undefined && { category: body.category }),
                ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
                ...(body.dueTime !== undefined && { dueTime: body.dueTime })
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

// DELETE delete a task
export async function DELETE(req, { params }) {
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

        const { id } = await params;

        // Verify task belongs to user
        const existingTask = await prismaClient.task.findUnique({
            where: { id }
        });

        if (!existingTask || existingTask.userId !== user.id) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        await prismaClient.task.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
