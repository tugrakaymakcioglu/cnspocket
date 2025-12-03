const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSearch() {
    console.log('Testing search functionality...');
    const query = 'deneme1';

    try {
        // Test Posts with relations
        console.log('Testing Post search with relations...');
        const posts = await prisma.post.findMany({
            where: {
                AND: [
                    { isVisible: true },
                    { isDeleted: false },
                    {
                        OR: [
                            { title: { contains: query } },
                            { content: { contains: query } },
                            { tags: { contains: query } }
                        ]
                    }
                ]
            },
            include: {
                author: {
                    select: {
                        name: true,
                        username: true,
                        avatar: true
                    }
                },
                _count: {
                    select: { replies: true, votes: true }
                }
            },
            take: 5
        });
        console.log('Posts success:', posts.length);

        // Test Users
        console.log('Testing User search...');
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { username: { contains: query } }
                ]
            },
            take: 5
        });
        console.log('Users success:', users.length);

        // Test Announcements
        console.log('Testing Announcement search...');
        const announcements = await prisma.announcement.findMany({
            where: {
                active: true,
                OR: [
                    { title: { contains: query } },
                    { content: { contains: query } }
                ]
            },
            take: 5
        });
        console.log('Announcements success:', announcements.length);

    } catch (error) {
        console.error('Search Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSearch();
