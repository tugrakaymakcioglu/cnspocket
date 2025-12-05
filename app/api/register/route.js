import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimiters, applyRateLimit } from "@/lib/rate-limiter";
import { logSecurityEvent, getSecurityInfo } from "@/lib/security";

export async function POST(req) {
    // Apply rate limiting - 5 requests per 15 minutes
    const rateLimit = applyRateLimit(req, rateLimiters.register);
    if (rateLimit.limited) {
        logSecurityEvent('RATE_LIMIT_REGISTER', getSecurityInfo(req));
        return NextResponse.json(
            rateLimit.response.body,
            {
                status: rateLimit.response.status,
                headers: rateLimit.response.headers,
            }
        );
    }

    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Attempting to create user in DB:", { name, email });
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        });

        return NextResponse.json({ message: "User created" }, { status: 201 });
    } catch (error) {
        console.error("REGISTRATION ERROR:", error);
        return NextResponse.json({ message: "Error creating user", error: error.message }, { status: 500 });
    }
}
