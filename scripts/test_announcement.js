const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreateAnnouncement() {
    console.log('Testing announcement creation...');
    try {
        // Find an admin user first
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!admin) {
            console.error('No admin user found to create announcement with.');
            return;
        }

        console.log('Found admin:', admin.username);

        const announcement = await prisma.announcement.create({
            data: {
                title: 'Test Announcement',
                content: 'This is a test announcement created via script.',
                authorId: admin.id
            }
        });
        console.log('Successfully created announcement:', announcement);
    } catch (error) {
        console.error('Error creating announcement:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCreateAnnouncement();
