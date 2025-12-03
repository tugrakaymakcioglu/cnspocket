import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: credentials.email },
                            { username: credentials.email }
                        ]
                    }
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                    role: user.role,
                    banned: user.banned
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.avatar = user.avatar;
                token.role = user.role;
                token.banned = user.banned;
            }
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user.avatar = token.avatar;
                session.user.role = token.role;
                session.user.banned = token.banned;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
