import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';
        const type = searchParams.get('type') || 'all'; // all, posts, users, notes, courses, announcements
        const sort = searchParams.get('sort') || 'relevance';

        if (!query.trim()) {
            return NextResponse.json({ results: [] });
        }

        const lowerQuery = query.toLowerCase();
        const queryTerms = lowerQuery.split(/\s+/).filter(t => t.length > 2);

        // Helper to calculate relevance score
        const calculateScore = (item, titleField = 'title', contentField = 'content') => {
            let score = 0;
            const title = item[titleField]?.toLowerCase() || '';
            const content = item[contentField]?.toLowerCase() || '';

            // 1. Exact Title Match (Highest Priority)
            if (title === lowerQuery) score += 100;

            // 2. Title Starts With Query
            else if (title.startsWith(lowerQuery)) score += 50;

            // 3. Title Contains Query
            else if (title.includes(lowerQuery)) score += 20;

            // 4. Content Contains Query
            if (content.includes(lowerQuery)) score += 5;

            // 5. Term Matching (Boost for matching individual terms)
            queryTerms.forEach(term => {
                if (title.includes(term)) score += 5;
                if (content.includes(term)) score += 1;
            });

            // 6. Recency Boost
            if (item.createdAt) {
                const daysOld = (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24);
                if (daysOld < 7) score += 5;
                if (daysOld < 30) score += 2;
            }

            // 7. Popularity Boost
            if (item.viewCount) {
                score += Math.min(item.viewCount / 100, 10);
            }

            return score;
        };

        const results = {
            posts: [],
            users: [],
            notes: [],
            courses: [],
            announcements: []
        };

        // --- SEARCH POSTS (Case-insensitive) ---
        if (type === 'all' || type === 'posts') {
            try {
                const posts = await prismaClient.post.findMany({
                    where: {
                        AND: [
                            { isVisible: true },
                            { isDeleted: false },
                            {
                                OR: [
                                    { title: { contains: query, mode: 'insensitive' } },
                                    { content: { contains: query, mode: 'insensitive' } },
                                    { tags: { contains: query, mode: 'insensitive' } }
                                ]
                            }
                        ]
                    },
                    include: {
                        author: { select: { name: true, username: true, avatar: true } },
                        _count: { select: { replies: true, votes: true } }
                    },
                    take: 50
                });

                results.posts = posts
                    .map(p => ({ ...p, score: calculateScore(p, 'title', 'content') }))
                    .sort((a, b) => sort === 'relevance' ? b.score - a.score : 0)
                    .slice(0, 20);

                if (sort === 'date') results.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                if (sort === 'popularity') results.posts.sort((a, b) => b.viewCount - a.viewCount);

            } catch (e) { console.error('Error searching posts:', e); }
        }

        // --- SEARCH USERS (Case-insensitive) ---
        if (type === 'all' || type === 'users') {
            try {
                const users = await prismaClient.user.findMany({
                    where: {
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { username: { contains: query, mode: 'insensitive' } },
                            { university: { contains: query, mode: 'insensitive' } },
                            { department: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    select: { id: true, name: true, username: true, avatar: true, university: true, department: true },
                    take: 20
                });

                results.users = users
                    .map(u => ({ ...u, score: calculateScore(u, 'name', 'username') }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10);
            } catch (e) { console.error('Error searching users:', e); }
        }

        // --- SEARCH NOTES (Case-insensitive) ---
        if (type === 'all' || type === 'notes') {
            try {
                const notes = await prismaClient.note.findMany({
                    where: {
                        AND: [
                            { isDeleted: false },
                            {
                                OR: [
                                    { title: { contains: query, mode: 'insensitive' } },
                                    { content: { contains: query, mode: 'insensitive' } }
                                ]
                            }
                        ]
                    },
                    include: { author: { select: { name: true, username: true } } },
                    take: 20
                });

                results.notes = notes
                    .map(n => ({ ...n, score: calculateScore(n, 'title', 'content') }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10);
            } catch (e) { console.error('Error searching notes:', e); }
        }

        // --- SEARCH COURSES (Case-insensitive) ---
        if (type === 'all' || type === 'courses') {
            try {
                const courses = await prismaClient.course.findMany({
                    where: {
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { code: { contains: query, mode: 'insensitive' } },
                            { department: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 20
                });

                results.courses = courses
                    .map(c => ({ ...c, score: calculateScore(c, 'name', 'code') }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10);
            } catch (e) { console.error('Error searching courses:', e); }
        }

        // --- SEARCH ANNOUNCEMENTS (Case-insensitive) ---
        if (type === 'all' || type === 'announcements') {
            try {
                const announcements = await prismaClient.announcement.findMany({
                    where: {
                        active: true,
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { content: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    include: { author: { select: { name: true, username: true } } },
                    take: 20
                });

                results.announcements = announcements
                    .map(a => ({ ...a, score: calculateScore(a, 'title', 'content') }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10);
            } catch (e) { console.error('Error searching announcements:', e); }
        }

        // Save History
        try {
            const session = await getServerSession(authOptions);
            if (session?.user) {
                const user = await prismaClient.user.findUnique({ where: { email: session.user.email } });
                if (user) {
                    await prismaClient.searchHistory.create({
                        data: { userId: user.id, query: query.trim() }
                    }).catch(() => { });
                }
            }
        } catch (e) { console.error('Error saving history:', e); }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 });
    }
}
