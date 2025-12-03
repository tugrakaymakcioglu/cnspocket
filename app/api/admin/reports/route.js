import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/roles';

export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const reports = await prisma.report.findMany({
            include: {
                reporter: {
                    select: {
                        username: true,
                        email: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        title: true,
                        content: true
                    }
                },
                reply: {
                    select: {
                        id: true,
                        content: true,
                        post: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Error fetching reports' }, { status: 500 });
    }
}
