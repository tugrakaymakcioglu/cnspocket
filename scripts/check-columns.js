const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking table structure...');

        // Query to get column names for User table in PostgreSQL
        const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User'
    `;

        console.log('Columns in User table:');
        console.log(columns);

    } catch (e) {
        console.error('Error checking columns:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
