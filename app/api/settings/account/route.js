import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete user (Prisma will cascade delete related data based on schema)
        await prismaClient.user.delete({
            where: { id: user.id }
        });

        return NextResponse.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json({ error: 'Error deleting account' }, { status: 500 });
    }
}
