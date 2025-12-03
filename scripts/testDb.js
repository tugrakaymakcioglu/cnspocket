const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
    console.log('Testing Prisma query with "read" field...');
    try {
        const userId = 'cmigl994e0000ztjmo693xvw5'; // The user ID from the error

        // Test finding the user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        console.log('User found:', user ? 'YES' : 'NO');

        if (user) {
            // Test counting unread messages using 'read' field
            const count = await prisma.message.count({
                where: {
                    receiverId: user.id,
                    read: false
                }
            });
            console.log('Unread count (using read: false):', count);

            // Test finding messages
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: user.id },
                        { receiverId: user.id }
                    ]
                },
                take: 1
            });
            console.log('Messages found:', messages.length);
            if (messages.length > 0) {
                console.log('First message keys:', Object.keys(messages[0]));
            }
        }

    } catch (error) {
        console.error('Error executing query:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testQuery();
