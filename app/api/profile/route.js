import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const globalForPrisma = global;
const prismaClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const university = formData.get('university');
        const department = formData.get('department');
        const avatarFile = formData.get('avatar');

        // Find user by email
        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData = {};

        // Update fields if provided
        if (firstName && firstName.trim()) {
            updateData.firstName = firstName.trim();
        }
        if (lastName && lastName.trim()) {
            updateData.lastName = lastName.trim();
        }
        // Update legacy name field
        if (firstName || lastName) {
            const first = firstName?.trim() || user.firstName || '';
            const last = lastName?.trim() || user.lastName || '';
            updateData.name = `${first} ${last}`.trim();
        }
        if (university) {
            updateData.university = university;
        }
        if (department) {
            updateData.department = department;
        }


        // Handle avatar upload if provided
        if (avatarFile && avatarFile.size > 0) {
            try {
                const uploadDir = path.join(process.cwd(), 'public/avatars');
                await mkdir(uploadDir, { recursive: true });

                const buffer = Buffer.from(await avatarFile.arrayBuffer());
                const filename = `${user.id}_${Date.now()}.jpg`;
                const filepath = path.join(uploadDir, filename);

                // Use sharp to resize to 200x200 square (1:1 ratio) and convert to JPEG
                await sharp(buffer)
                    .resize(200, 200, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .jpeg({ quality: 90 })
                    .toFile(filepath);

                updateData.avatar = `/avatars/${filename}`;
            } catch (error) {
                console.error('Error processing avatar:', error);
                return NextResponse.json({ error: 'Error processing image' }, { status: 500 });
            }
        }

        const coverColor = formData.get('coverColor');
        const coverImageFile = formData.get('coverImage');

        if (coverColor) {
            updateData.coverColor = coverColor;
            updateData.coverImage = null; // Reset image if color is selected
        }

        if (coverImageFile && coverImageFile.size > 0) {
            try {
                const uploadDir = path.join(process.cwd(), 'public/covers');
                await mkdir(uploadDir, { recursive: true });

                const buffer = Buffer.from(await coverImageFile.arrayBuffer());
                const filename = `cover_${user.id}_${Date.now()}.jpg`;
                const filepath = path.join(uploadDir, filename);

                // Use sharp to resize to 1200x400 (3:1 ratio) and convert to JPEG
                await sharp(buffer)
                    .resize(1200, 400, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .jpeg({ quality: 90 })
                    .toFile(filepath);

                updateData.coverImage = `/covers/${filename}`;
                updateData.coverColor = null; // Reset color if image is selected
            } catch (error) {
                console.error('Error processing cover image:', error);
                return NextResponse.json({ error: 'Error processing cover image' }, { status: 500 });
            }
        }

        // Update user
        await prismaClient.user.update({
            where: { id: user.id },
            data: updateData,
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            avatar: updateData.avatar,
            coverImage: updateData.coverImage,
            coverColor: updateData.coverColor
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
    }
}
