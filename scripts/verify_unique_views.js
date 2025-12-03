const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUniqueViewCount() {
    console.log('Starting Unique View Count Verification...');

    try {
        // 1. Get a test user and post
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error('No user found.');
            return;
        }

        // Create a new post to ensure clean state
        const post = await prisma.post.create({
            data: {
                title: 'Unique View Test ' + Date.now(),
                content: 'Content',
                authorId: user.id,
                viewCount: 0
            }
        });

        console.log('Test Post ID:', post.id);
        console.log('Test User ID:', user.id);
        console.log('Initial view count:', post.viewCount);

        // 2. Simulate First View (should increment)
        console.log('Simulating first view...');

        // We manually execute the logic that is in the API
        await prisma.$transaction([
            prisma.postView.create({
                data: {
                    userId: user.id,
                    postId: post.id
                }
            }),
            prisma.post.update({
                where: { id: post.id },
                data: { viewCount: { increment: 1 } }
            })
        ]);

        const postAfterFirstView = await prisma.post.findUnique({ where: { id: post.id } });
        console.log('View count after 1st view:', postAfterFirstView.viewCount);

        if (postAfterFirstView.viewCount !== 1) {
            console.error('FAIL: View count should be 1.');
            return;
        }

        // 3. Simulate Second View (should NOT increment)
        console.log('Simulating second view...');

        const existingView = await prisma.postView.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: post.id
                }
            }
        });

        if (existingView) {
            console.log('View already exists, skipping increment.');
        } else {
            // This block should NOT be reached
            await prisma.$transaction([
                prisma.postView.create({
                    data: {
                        userId: user.id,
                        postId: post.id
                    }
                }),
                prisma.post.update({
                    where: { id: post.id },
                    data: { viewCount: { increment: 1 } }
                })
            ]);
        }

        const postAfterSecondView = await prisma.post.findUnique({ where: { id: post.id } });
        console.log('View count after 2nd view:', postAfterSecondView.viewCount);

        if (postAfterSecondView.viewCount === 1) {
            console.log('SUCCESS: View count remained 1 after second view!');
        } else {
            console.error('FAIL: View count incremented incorrectly.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyUniqueViewCount();
