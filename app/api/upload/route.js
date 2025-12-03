import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Next.js 15: bodyParser config is deprecated, formData() handles file uploads automatically
// No config needed - formData() works out of the box

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type - Allow images and documents
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'application/zip',
            'application/x-rar-compressed'
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: 'File type not allowed. Supported: Images, PDF, Word, Excel, TXT, ZIP'
            }, { status: 400 });
        }

        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 100MB' }, { status: 400 });
        }

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'notes');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename with shorter ID
        const randomId = Math.random().toString(36).substring(2, 8); // 6 character random ID
        const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        const extension = file.name.split('.').pop();
        const filename = `${originalName}_${randomId}.${extension}`;
        const filepath = path.join(uploadDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Return public URL
        const url = `/uploads/notes/${filename}`;
        return NextResponse.json({ url, filename }, { status: 201 });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file', details: error.message }, { status: 500 });
    }
}
