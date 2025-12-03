import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/roles';

export async function PUT(req, { params }) {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { status } = await req.json();

        if (!['PENDING', 'RESOLVED', 'DISMISSED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const report = await prisma.report.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ report });
    } catch (error) {
        console.error('Error updating report:', error);
        return NextResponse.json({ error: 'Error updating report' }, { status: 500 });
    }
}
