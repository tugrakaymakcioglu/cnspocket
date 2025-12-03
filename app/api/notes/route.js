import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// GET all notes
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');
        const search = searchParams.get('search');

        const where = {
            // Show notes if:
            // 1. User is the author
            // 2. OR Note is public
            OR: [
                { authorId: user.id },
                { isPublic: true }
            ]
        };

        if (courseId) {
            where.courseId = courseId;
        }

        if (search) {
            where.AND = {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { tags: { contains: search, mode: 'insensitive' } }
                ]
            };
        }

        const notes = await prisma.note.findMany({
            where,
            include: {
                course: true,
                author: {
                    select: {
                        name: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

// POST create a new note
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const formData = await req.formData();
        const title = formData.get('title');
        const description = formData.get('description');
        const courseId = formData.get('courseId');
        const tags = formData.get('tags');
        const isPublic = formData.get('isPublic') === 'true';
        const files = formData.getAll('files');

        if (!title || !description || !courseId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Handle file uploads
        const fileUrls = [];
        for (const file of files) {
            if (file instanceof File) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                const filepath = path.join(uploadDir, filename);

                await writeFile(filepath, buffer);
                fileUrls.push(`/uploads/${filename}`);
            }
        }

        const note = await prisma.note.create({
            data: {
                title,
                description,
                courseId,
                tags: tags || '',
                isPublic,
                fileUrls: JSON.stringify(fileUrls),
                authorId: user.id
            },
            include: {
                course: true
            }
        });

        // If public, create a forum post
        if (isPublic) {
            await prisma.post.create({
                data: {
                    title: `(Not Paylaşıldı) ${title}`,
                    content: description,
                    tags: tags || 'Ders Notu',
                    fileUrls: JSON.stringify(fileUrls),
                    authorId: user.id,
                    noteId: note.id
                }
            });
        }

        return NextResponse.json(note, { status: 201 });

    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json({
            error: 'Failed to create note',
            details: error.message
        }, { status: 500 });
    }
}
