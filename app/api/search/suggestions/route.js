import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (query && query.trim().length > 0) {
            // Autocomplete suggestions (Case-insensitive)
            const [users, posts, courses] = await Promise.all([
                prismaClient.user.findMany({
                    where: {
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { username: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 3,
                    select: { name: true, username: true }
                }),
                prismaClient.post.findMany({
                    where: {
                        AND: [
                            { isVisible: true },
                            { isDeleted: false },
                            {
                                OR: [
                                    { title: { contains: query, mode: 'insensitive' } },
                                    { tags: { contains: query, mode: 'insensitive' } }
                                ]
                            }
                        ]
                    },
                    take: 5,
                    select: { title: true },
                    orderBy: { viewCount: 'desc' }
                }),
                prismaClient.course.findMany({
                    where: {
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { code: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 3,
                    select: { name: true, code: true }
                })
            ]);

            const suggestions = [
                ...posts.map(p => ({ type: 'post', text: p.title })),
                ...users.map(u => ({ type: 'user', text: u.name, username: u.username })),
                ...courses.map(c => ({ type: 'course', text: `${c.code} - ${c.name}` }))
            ];

            // Also return simple string array for backward compatibility
            const simpleList = [
                ...posts.map(p => p.title),
                ...users.map(u => u.name),
                ...courses.map(c => c.name)
            ];

            return NextResponse.json({
                suggestions: simpleList,
                detailedSuggestions: suggestions
            });
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
            const q = s.query.toLowerCase().trim();
            if (q.length > 1) {
                queryCount[q] = (queryCount[q] || 0) + 1;
            }
        });

        const trending = Object.entries(queryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([query]) => query);

        return NextResponse.json({
            trending,
            trendingPosts: trendingPosts.map(p => ({
                id: p.id,
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
