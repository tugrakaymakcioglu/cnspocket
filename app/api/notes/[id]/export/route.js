import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function GET(req, { params }) {
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

        const note = await prismaClient.quickNote.findUnique({
            where: { id }
        });

        if (!note || note.userId !== user.id) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        // Return note data for client-side PDF generation
        return NextResponse.json({
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            wordCount: note.wordCount,
            tags: note.tags,
            folder: note.folder
        });

    } catch (error) {
        console.error('Error exporting note:', error);
        return NextResponse.json({ error: 'Failed to export note' }, { status: 500 });
    }
}
