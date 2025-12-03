const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking posts...');
    const posts = await prisma.post.findMany();
    console.log('Total posts found:', posts.length);

    if (posts.length > 0) {
        console.log('Sample post visibility:', posts[0].isVisible);

        console.log('Updating all posts to be visible...');
        const updated = await prisma.post.updateMany({
            data: {
                isVisible: true,
            },
        });
        console.log('Successfully updated posts:', updated.count);
    } else {
        console.log('No posts found in the database. The database might have been reset.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
