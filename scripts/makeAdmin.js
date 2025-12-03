import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUserAdmin() {
    console.log('Making tugrakaymakcioglu a POWERUSER...\n');

    try {
        const user = await prisma.user.update({
            where: { username: 'tugrakaymakcioglu' },
            data: {
                role: 'POWERUSER',
                banned: false
            },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
            }
        });

        console.log('✅ SUCCESS! User updated:');
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log('\n🎉 You are now a POWERUSER with full admin access!\n');
        console.log('Next steps:');
        console.log('1. Logout from your current session');
        console.log('2. Login again with your credentials');
        console.log('3. Look for the "🛡️ Admin Paneli" button in the navbar');
        console.log('4. Click it to access the admin panel\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    await prisma.$disconnect();
}

makeUserAdmin();
