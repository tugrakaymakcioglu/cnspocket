const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('=== DATABASE STATUS ===\n');

    const posts = await prisma.post.findMany({
        include: {
            author: true,
            replies: true
        }
    });

    console.log('Total posts in database:', posts.length);
    console.log('\nPost details:');
    posts.forEach((post, i) => {
        console.log(`\n${i + 1}. Title: "${post.title}"`);
        console.log(`   Author: ${post.author.name || post.author.email}`);
        console.log(`   Visible: ${post.isVisible}`);
        console.log(`   Replies: ${post.replies.length}`);
        console.log(`   Created: ${post.createdAt}`);
    });

    const visiblePosts = posts.filter(p => p.isVisible);
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total posts: ${posts.length}`);
    console.log(`Visible posts: ${visiblePosts.length}`);
    console.log(`Hidden posts: ${posts.length - visiblePosts.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
