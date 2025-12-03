const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    console.log('Listing all users...');
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                name: true
            }
        });
        console.log('Found users:', users);
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
