const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreateNote() {
    try {
        console.log('Testing note creation...');

        // Find a user first
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error('No user found to create note for.');
            return;
        }
        console.log('User found:', user.email);

        const note = await prisma.quickNote.create({
            data: {
                title: 'Test Note',
                content: 'This is a test note content.',
                userId: user.id,
                wordCount: 6
            }
        });

        console.log('Note created successfully:', note);

    } catch (error) {
        console.error('Error creating note:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCreateNote();
