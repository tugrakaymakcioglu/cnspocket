const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('=== CHECKING FORUM POSTS ===\n');

    const allPosts = await prisma.post.findMany({
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                    avatar: true
                }
            }
        }
    });

    console.log('Total posts in database:', allPosts.length);

    const visiblePosts = allPosts.filter(p => p.isVisible);
    const hiddenPosts = allPosts.filter(p => !p.isVisible);

    console.log('Visible posts:', visiblePosts.length);
    console.log('Hidden posts:', hiddenPosts.length);

    if (allPosts.length > 0) {
        console.log('\n=== POST DETAILS ===');
        allPosts.forEach((post, i) => {
            console.log(`\n${i + 1}. "${post.title}"`);
            console.log(`   Author: ${post.author.name}`);
            console.log(`   Visible: ${post.isVisible}`);
            console.log(`   Created: ${post.createdAt}`);
        });
    }

    if (hiddenPosts.length > 0) {
        console.log('\n⚠️  There are hidden posts! Setting them back to visible...');
        await prisma.post.updateMany({
            where: { isVisible: false },
            data: { isVisible: true }
        });
        console.log('✅ All posts are now visible!');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
