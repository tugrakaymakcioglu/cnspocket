const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyViewCount() {
    console.log('Starting View Count Verification...');

    try {
        // 1. Get an existing post or create one
        let post = await prisma.post.findFirst();

        if (!post) {
            const user = await prisma.user.findFirst();
            if (!user) {
                console.error('No user found to create a post.');
                return;
            }
            post = await prisma.post.create({
                data: {
                    title: 'Test Post for View Count',
                    content: 'Content',
                    authorId: user.id,
                    tags: 'test'
                }
            });
        }

        console.log('Using post:', post.id);
        console.log('Initial view count:', post.viewCount);

        // 2. Simulate fetching the post (which should increment viewCount)
        // We can't call the API directly from here easily without fetch, 
        // but we can verify the DB update logic if we were testing the API handler.
        // Since we want to verify the SCHEMA update, we will try to update it via Prisma.

        const updatedPost = await prisma.post.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } }
        });

        console.log('Updated view count:', updatedPost.viewCount);

        if (updatedPost.viewCount > (post.viewCount || 0)) {
            console.log('SUCCESS: View count incremented successfully!');
        } else {
            console.error('FAIL: View count did not increment.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
        if (error.message.includes('Unknown argument')) {
            console.error('FAIL: Schema update likely failed. viewCount field does not exist.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

verifyViewCount();
