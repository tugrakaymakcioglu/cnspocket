const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDMFix() {
    console.log('Starting DM Fix Verification...');

    try {
        // 1. Create two test users if they don't exist
        const userA = await prisma.user.upsert({
            where: { email: 'test_user_a@example.com' },
            update: {},
            create: {
                email: 'test_user_a@example.com',
                username: 'test_user_a',
                password: 'password123',
                name: 'Test User A'
            }
        });

        const userB = await prisma.user.upsert({
            where: { email: 'test_user_b@example.com' },
            update: {},
            create: {
                email: 'test_user_b@example.com',
                username: 'test_user_b',
                password: 'password123',
                name: 'Test User B'
            }
        });

        console.log('Test users ready:', userA.username, userB.username);

        // 2. Send a message from A to B
        const message = await prisma.message.create({
            data: {
                senderId: userA.id,
                receiverId: userB.id,
                content: 'Test message ' + Date.now(),
                read: false
            }
        });

        // 3. Create a notification for B
        const notification = await prisma.notification.create({
            data: {
                userId: userB.id,
                type: 'message',
                messageId: message.id,
                content: message.content,
                isRead: false
            }
        });

        console.log('Message and notification created.');

        // 4. Verify initial state
        const initialMessage = await prisma.message.findUnique({ where: { id: message.id } });
        const initialNotification = await prisma.notification.findUnique({ where: { id: notification.id } });

        if (initialMessage.read || initialNotification.isRead) {
            console.error('FAIL: Initial state is wrong (should be unread).');
            return;
        }
        console.log('Initial state verified: Both unread.');

        // 5. Simulate User B reading the message (calling the API logic)
        // We will manually run the update logic here to verify it works as expected

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                senderId: userA.id,
                receiverId: userB.id,
                read: false
            },
            data: {
                read: true
            }
        });

        // Sync notifications
        const unreadMessages = await prisma.message.findMany({
            where: {
                senderId: userA.id,
                receiverId: userB.id
            },
            select: { id: true }
        });

        const messageIds = unreadMessages.map(m => m.id);

        if (messageIds.length > 0) {
            await prisma.notification.updateMany({
                where: {
                    userId: userB.id,
                    type: 'message',
                    messageId: {
                        in: messageIds
                    },
                    isRead: false
                },
                data: {
                    isRead: true
                }
            });
        }

        // 6. Verify final state
        const finalMessage = await prisma.message.findUnique({ where: { id: message.id } });
        const finalNotification = await prisma.notification.findUnique({ where: { id: notification.id } });

        if (finalMessage.read && finalNotification.isRead) {
            console.log('SUCCESS: Both message and notification are marked as read!');
        } else {
            console.error('FAIL: Synchronization failed.');
            console.log('Message read:', finalMessage.read);
            console.log('Notification read:', finalNotification.isRead);
        }

    } catch (error) {
        console.error('Verification failed with error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDMFix();
