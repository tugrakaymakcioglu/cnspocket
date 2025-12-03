import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileUrl = searchParams.get('url');

        if (!fileUrl) {
            return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
        }

        let fileBuffer;
        let contentType = 'application/octet-stream';
        let originalFilename;

        // Check if it's a local file (starts with /uploads/)
        if (fileUrl.startsWith('/uploads/') || fileUrl.startsWith('/public/uploads/')) {
            // Handle local file
            const cleanPath = fileUrl.replace('/public/', '');
            const filePath = path.join(process.cwd(), 'public', cleanPath.replace('/uploads/', 'uploads/'));

            if (!existsSync(filePath)) {
                return NextResponse.json({ error: 'File not found' }, { status: 404 });
            }

            fileBuffer = await readFile(filePath);
            originalFilename = path.basename(filePath);

            // Determine content type from extension
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.pdf': 'application/pdf',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.xls': 'application/vnd.ms-excel',
                '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.txt': 'text/plain',
                '.zip': 'application/zip'
            };
            contentType = mimeTypes[ext] || 'application/octet-stream';
        } else {
            // Handle external URL
            const response = await fetch(fileUrl);

            if (!response.ok) {
                return NextResponse.json({ error: 'Failed to fetch file' }, { status: response.status });
            }

            fileBuffer = Buffer.from(await response.arrayBuffer());
            contentType = response.headers.get('Content-Type') || 'application/octet-stream';
            originalFilename = fileUrl.split('/').pop();
        }

        // Add prefix to filename
        const prefixedFilename = `Notvarmi.com_${originalFilename}`;

        // Create response with headers
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Content-Disposition', `attachment; filename="${prefixedFilename}"`);
        headers.set('Content-Length', fileBuffer.byteLength.toString());

        return new NextResponse(fileBuffer, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Failed to download file', details: error.message }, { status: 500 });
    }
}
