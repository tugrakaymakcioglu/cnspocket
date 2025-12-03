const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing raw query for lastSeen...');

        // Try to fetch users with raw query to get lastSeen
        const users = await prisma.$queryRaw`SELECT id, username, "lastSeen" FROM "User" LIMIT 5`;

        console.log('Raw query results:');
        console.log(users);

        if (users.length > 0) {
            console.log('First user lastSeen:', users[0].lastSeen);
            console.log('Type of lastSeen:', typeof users[0].lastSeen);
        }

    } catch (e) {
        console.error('Error executing raw query:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
