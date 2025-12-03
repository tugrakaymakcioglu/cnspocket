import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const globalForPrisma = global;

const prismaClient = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function GET(req, { params }) {
    try {
        // Await params for Next.js 15+ compatibility
        const { id } = await params;

        console.log('Fetching post with ID:', id);

        const post = await prismaClient.post.findUnique({
            where: { id },
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
                replies: {
                    include: {
                        author: {
                            select: {
                                name: true,
                                avatar: true,
                                username: true,
                                university: true,
                                department: true,
                            },
                        },
                        votes: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                votes: true,
            },
        });

        if (!post || !post.isVisible) {
            console.log('Post not found (or hidden) for ID:', id);
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Increment view count (Unique per user)
        try {
            const session = await getServerSession(authOptions);

            // Only count views for logged-in users
            if (session && session.user) {
                const userEmail = session.user.email;

                // We need the user ID. Since we don't have it in the session directly (usually),
                // we might need to fetch it or rely on the session structure.
                // Assuming session.user.id exists or we fetch the user.

                // Let's try to find the user first to be safe
                const currentUser = await prismaClient.user.findUnique({
                    where: { email: userEmail },
                    select: { id: true }
                });

                if (currentUser) {
                    // Check if this user has already viewed this post
                    const existingView = await prismaClient.postView.findUnique({
                        where: {
                            userId_postId: {
                                userId: currentUser.id,
                                postId: id
                            }
                        }
                    });

                    if (!existingView) {
                        // Create a view record and increment the count transactionally
                        await prismaClient.$transaction([
                            prismaClient.postView.create({
                                data: {
                                    userId: currentUser.id,
                                    postId: id
                                }
                            }),
                            prismaClient.post.update({
                                where: { id },
                                data: { viewCount: { increment: 1 } }
                            })
                        ]);
                    }
                }
            }
        } catch (updateError) {
            console.error('Failed to update view count:', updateError);
            // Continue to return the post even if view count update fails
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json({ error: 'Error fetching post' }, { status: 500 });
    }
}
