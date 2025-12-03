import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    try {
        console.log("Connecting to DB...");
        // Test connection
        await prisma.$connect();
        console.log("Connected.");

        const email = `test_${Date.now()}@example.com`;
        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Creating user...", email);
        const user = await prisma.user.create({
            data: {
                name: "Test User",
                email,
                password: hashedPassword
            }
        });
        console.log("User created:", user);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
