import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { isAdmin, isPowerUser } from '@/lib/roles';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const currentUser = await prismaClient.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!currentUser || !isAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { banned, role } = body;

        const targetUser = await prismaClient.user.findUnique({
            where: { id },
            select: { role: true }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Cannot modify PowerUser
        if (targetUser.role === 'POWERUSER') {
            return NextResponse.json({ error: 'Cannot modify PowerUser' }, { status: 403 });
        }

        // Only PowerUser can change roles or ban admins
        if (targetUser.role === 'ADMIN' && !isPowerUser(currentUser.role)) {
            return NextResponse.json({ error: 'Only PowerUser can modify admins' }, { status: 403 });
        }

        // Only PowerUser can assign admin/poweruser roles
        if (role && (role === 'ADMIN' || role === 'POWERUSER') && !isPowerUser(currentUser.role)) {
            return NextResponse.json({ error: 'Only PowerUser can assign admin roles' }, { status: 403 });
        }

        const updateData = {};
        if (banned !== undefined) updateData.banned = banned;
        if (role && role !== 'POWERUSER') updateData.role = role; // Prevent creating new powerusers

        const updatedUser = await prismaClient.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                banned: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
