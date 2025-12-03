const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAdmins() {
    console.log('Listing all ADMIN users...');
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        });
        console.log('Found admins:', admins);
    } catch (error) {
        console.error('Error listing admins:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listAdmins();
