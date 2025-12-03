import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { isAdmin, isPowerUser } from '@/lib/roles';

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
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';
        const banned = searchParams.get('banned');

        const where = {};

        if (search) {
            where.OR = [
                { username: { contains: search } },
                { email: { contains: search } },
                { firstName: { contains: search } },
                { lastName: { contains: search } }
            ];
        }

        if (role) {
            where.role = role;
        }

        if (banned !== null && banned !== undefined && banned !== '') {
            where.banned = banned === 'true';
        }

        const [users, total] = await Promise.all([
            prismaClient.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    university: true,
                    department: true,
                    role: true,
                    banned: true,
                    createdAt: true,
                    _count: {
                        select: {
                            posts: true,
                            replies: true,
                            notes: true
                        }
                    }
                }
            }),
            prismaClient.user.count({ where })
        ]);

        return NextResponse.json({
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
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
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Check if trying to delete admin or poweruser
        const targetUser = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only PowerUser can delete admins
        if (targetUser.role === 'ADMIN' && !isPowerUser(user.role)) {
            return NextResponse.json({ error: 'Only PowerUser can delete admins' }, { status: 403 });
        }

        // Cannot delete PowerUser
        if (targetUser.role === 'POWERUSER') {
            return NextResponse.json({ error: 'Cannot delete PowerUser' }, { status: 403 });
        }

        // Delete all related data manually since cascade delete might not be set up in DB
        await prismaClient.$transaction(async (tx) => {
            // 1. Delete notifications
            await tx.notification.deleteMany({ where: { userId } });

            // 2. Delete messages (sent and received)
            await tx.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } });

            // 3. Delete replies
            await tx.reply.deleteMany({ where: { authorId: userId } });

            // 4. Delete posts (and their replies)
            const userPosts = await tx.post.findMany({ where: { authorId: userId }, select: { id: true } });
            const postIds = userPosts.map(p => p.id);
            if (postIds.length > 0) {
                await tx.reply.deleteMany({ where: { postId: { in: postIds } } }); // Delete replies to user's posts
                await tx.post.deleteMany({ where: { id: { in: postIds } } });
            }

            // 5. Delete notes
            await tx.note.deleteMany({ where: { authorId: userId } });

            // 6. Delete courses (and their notes)
            const userCourses = await tx.course.findMany({ where: { userId: userId }, select: { id: true } });
            const courseIds = userCourses.map(c => c.id);
            if (courseIds.length > 0) {
                await tx.note.deleteMany({ where: { courseId: { in: courseIds } } }); // Delete notes in user's courses
                await tx.course.deleteMany({ where: { id: { in: courseIds } } });
            }

            // 7. Finally delete user
            await tx.user.delete({ where: { id: userId } });
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
