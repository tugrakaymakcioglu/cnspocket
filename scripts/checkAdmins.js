import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmins() {
    console.log('Checking admin accounts in database...\n');

    const admins = await prisma.user.findMany({
        where: {
            OR: [
                { role: 'ADMIN' },
                { role: 'POWERUSER' }
            ]
        },
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            password: true
        }
    });

    if (admins.length === 0) {
        console.log('❌ NO ADMIN ACCOUNTS FOUND IN DATABASE!\n');
    } else {
        console.log(`✅ Found ${admins.length} admin account(s):\n`);
        admins.forEach(admin => {
            console.log(`  - ${admin.email} (${admin.username})`);
            console.log(`    Role: ${admin.role}`);
            console.log(`    Password hash exists: ${admin.password ? 'Yes' : 'No'}`);
            console.log(`    Password hash length: ${admin.password?.length || 0}`);
            console.log('');
        });
    }

    await prisma.$disconnect();
}

checkAdmins();
