import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (query) {
            // Autocomplete suggestions
            const users = await prismaClient.user.findMany({
                where: {
                    OR: [
                        { name: { contains: query } },
                        { username: { contains: query } }
                    ]
                },
                take: 3,
                select: { name: true, username: true }
            });

            const posts = await prismaClient.post.findMany({
                where: {
                    title: { contains: query }
                },
                take: 3,
                select: { title: true }
            });

            const suggestions = [
                ...users.map(u => u.name),
                ...users.map(u => `@${u.username}`),
                ...posts.map(p => p.title)
            ];

            return NextResponse.json({ suggestions });
        }

        // Get trending topics (most viewed posts in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendingPosts = await prismaClient.post.findMany({
            where: {
                AND: [
                    { isVisible: true },
                    { isDeleted: false },
                    { createdAt: { gte: sevenDaysAgo } }
                ]
            },
            orderBy: { viewCount: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                tags: true,
                viewCount: true
            }
        });

        // Get popular searches (most common recent searches)
        const popularSearches = await prismaClient.searchHistory.findMany({
            where: {
                createdAt: { gte: sevenDaysAgo }
            },
            select: { query: true },
            take: 100
        });

        // Count frequency
        const queryCount = {};
        popularSearches.forEach(s => {
            queryCount[s.query] = (queryCount[s.query] || 0) + 1;
        });

        const trending = Object.entries(queryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([query]) => query);

        return NextResponse.json({
            trending,
            trendingPosts: trendingPosts.map(p => ({
                title: p.title,
                tags: p.tags,
                views: p.viewCount
            }))
        });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
}
