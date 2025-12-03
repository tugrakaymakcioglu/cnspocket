import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
            uptime: process.uptime()
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        }, { status: 503 });
    }
}
