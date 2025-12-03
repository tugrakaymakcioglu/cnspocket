const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('=== FIXING EXISTING USERS ===\n');

    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users\n`);

    for (const user of users) {
        // Generate username from email
        const username = user.email.split('@')[0];
        console.log(`User: ${user.email} -> username: ${username}`);
    }

    console.log('\nThis script needs manual migration. Please run:');
    console.log('npx prisma db push --force-reset');
    console.log('\nWARNING: This will delete all data!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
