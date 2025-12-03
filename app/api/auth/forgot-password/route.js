import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // For security, don't reveal if user exists or not
            // Just return success
            return NextResponse.json({ success: true });
        }

        // Generate 6-digit code
        const resetCode = crypto.randomInt(100000, 999999).toString();
        const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetCode,
                resetCodeExpiry
            }
        });

        console.log(`Reset code for ${email}: ${resetCode}`);

        // Send email
        // Note: In production, use environment variables for SMTP config
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        try {
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"NotVarmı" <noreply@notvarmi.com>',
                    to: email,
                    subject: 'Şifre Sıfırlama Kodu',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #4F46E5;">Şifre Sıfırlama İsteği</h2>
                            <p>Hesabınız için şifre sıfırlama isteği aldık. Kodunuz:</p>
                            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1F2937;">${resetCode}</span>
                            </div>
                            <p>Bu kod 15 dakika süreyle geçerlidir.</p>
                            <p style="color: #6B7280; font-size: 14px;">Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
                        </div>
                    `
                });
                console.log('Email sent successfully');
            } else {
                console.warn('SMTP credentials not found. Email not sent, but code logged above.');
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the request if email fails, just log it (in dev)
            // In prod, you might want to return an error
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
