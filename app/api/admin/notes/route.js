import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '@/lib/roles';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const user = await prismaClient.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const notes = await prismaClient.note.findMany({
            take: limit,
            skip: (page - 1) * limit,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        banned: true
                    }
                },
                course: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return NextResponse.json({ notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const user = await prismaClient.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const noteId = searchParams.get('id');

        if (!noteId) {
            return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
        }

        await prismaClient.note.delete({
            where: { id: noteId }
        });

        return NextResponse.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
