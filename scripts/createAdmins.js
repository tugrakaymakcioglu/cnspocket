import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminAccounts() {
    console.log('Creating admin accounts...');

    const adminAccounts = [
        {
            email: 'poweruser@cnspocket.com',
            username: 'poweruser',
            firstName: 'Power',
            lastName: 'User',
            password: 'PowerUser2024!',
            role: 'POWERUSER',
            university: 'System',
            department: 'Administration'
        },
        {
            email: 'admin1@cnspocket.com',
            username: 'admin1',
            firstName: 'Admin',
            lastName: 'One',
            password: 'Admin2024!',
            role: 'ADMIN',
            university: 'Boğaziçi Üniversitesi',
            department: 'Bilgisayar Mühendisliği'
        },
        {
            email: 'admin2@cnspocket.com',
            username: 'admin2',
            firstName: 'Admin',
            lastName: 'Two',
            password: 'Admin2024!',
            role: 'ADMIN',
            university: 'İstanbul Teknik Üniversitesi',
            department: 'Bilgisayar Mühendisliği'
        },
        {
            email: 'admin3@cnspocket.com',
            username: 'admin3',
            firstName: 'Admin',
            lastName: 'Three',
            password: 'Admin2024!',
            role: 'ADMIN',
            university: 'Orta Doğu Teknik Üniversitesi',
            department: 'Bilgisayar Mühendisliği'
        },
        {
            email: 'admin4@cnspocket.com',
            username: 'admin4',
            firstName: 'Admin',
            lastName: 'Four',
            password: 'Admin2024!',
            role: 'ADMIN',
            university: 'Hacettepe Üniversitesi',
            department: 'Bilgisayar Mühendisliği'
        },
        {
            email: 'admin5@cnspocket.com',
            username: 'admin5',
            firstName: 'Admin',
            lastName: 'Five',
            password: 'Admin2024!',
            role: 'ADMIN',
            university: 'Ankara Üniversitesi',
            department: 'Bilgisayar Mühendisliği'
        }
    ];

    for (const account of adminAccounts) {
        const hashedPassword = await bcrypt.hash(account.password, 10);

        try {
            const user = await prisma.user.upsert({
                where: { email: account.email },
                update: {
                    role: account.role,
                },
                create: {
                    email: account.email,
                    username: account.username,
                    firstName: account.firstName,
                    lastName: account.lastName,
                    password: hashedPassword,
                    role: account.role,
                    university: account.university,
                    department: account.department,
                },
            });

            console.log(`✅ Created ${account.role}: ${account.username} (${account.email})`);
        } catch (error) {
            console.error(`❌ Error creating ${account.username}:`, error.message);
        }
    }

    console.log('\n=== ADMIN CREDENTIALS ===');
    console.log('PowerUser:');
    console.log('  Email: poweruser@cnspocket.com');
    console.log('  Password: PowerUser2024!');
    console.log('\nAdmins (all have same password):');
    console.log('  admin1@cnspocket.com - Password: Admin2024!');
    console.log('  admin2@cnspocket.com - Password: Admin2024!');
    console.log('  admin3@cnspocket.com - Password: Admin2024!');
    console.log('  admin4@cnspocket.com - Password: Admin2024!');
    console.log('  admin5@cnspocket.com - Password: Admin2024!');
    console.log('========================\n');

    await prisma.$disconnect();
}

createAdminAccounts()
    .catch((error) => {
        console.error('Error in seed script:', error);
        process.exit(1);
    });
