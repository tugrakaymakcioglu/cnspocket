import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const globalForPrisma = global;

const prismaClient = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function GET() {
    try {
        const posts = await prismaClient.post.findMany({
            where: { isVisible: true },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                        avatar: true,
                        username: true,
                        university: true,
                        department: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                        votes: true
                    },
                },
                votes: {
                    select: {
                        type: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const title = formData.get('title');
        const content = formData.get('content');
        const tags = formData.get('tags');
        const files = formData.getAll('files'); // Get all files

        console.log('Received POST request');
        console.log('Title:', title);
        console.log('Files count:', files.length);

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        if (files.length > 5) {
            return NextResponse.json({ error: 'Maximum 5 files allowed' }, { status: 400 });
        }

        // Find user by email to get ID
        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const fileUrls = [];

        if (files && files.length > 0) {
            const uploadDir = path.join(process.cwd(), 'public/uploads');
            console.log('Upload directory:', uploadDir);
            await mkdir(uploadDir, { recursive: true });

            for (const file of files) {
                console.log('Processing file:', file.name, 'Size:', file.size);
                if (file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const randomId = Math.random().toString(36).substring(2, 8);
                    const originalName = file.name.replace(/\.[^/.]+$/, '').replaceAll(' ', '_');
                    const extension = file.name.split('.').pop();
                    const filename = `${originalName}_${randomId}.${extension}`;

                    try {
                        const filepath = path.join(uploadDir, filename);
                        console.log('Saving to:', filepath);
                        await writeFile(filepath, buffer);
                        fileUrls.push(`/uploads/${filename}`);
                        console.log('File saved successfully');
                    } catch (e) {
                        console.error('Error saving file:', e);
                        return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
                    }
                }
            }
        }

        const post = await prismaClient.post.create({
            data: {
                title,
                content,
                tags: tags || '',
                fileUrls: JSON.stringify(fileUrls), // Store as JSON string
                authorId: user.id,
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
    }
}
