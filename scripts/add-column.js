const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Adding lastSeen column...');

        // Add lastSeen column
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN "lastSeen" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`;

        console.log('Column added successfully.');

    } catch (e) {
        console.error('Error adding column:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
