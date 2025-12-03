const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const targetEmail = 'kaymakcioglu2006@gmail.com';
        const user = await prisma.user.findUnique({
            where: { email: targetEmail }
        });

        if (!user) {
            console.log('User NOT found');
            return;
        }

        console.log(`User: ${user.username} (${user.email}) ID: ${user.id}`);

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: user.id },
                    { receiverId: user.id }
                ]
            }
        });

        console.log(`Message count: ${messages.length}`);
        if (messages.length > 0) {
            console.log('First message:', messages[0].content);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
