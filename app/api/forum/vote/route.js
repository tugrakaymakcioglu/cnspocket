import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { type, postId, replyId } = await req.json();

        if (!['LIKE', 'DISLIKE'].includes(type)) {
            return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
        }

        if (!postId && !replyId) {
            return NextResponse.json({ error: 'Post ID or Reply ID required' }, { status: 400 });
        }

        const userId = session.user.id;

        // Check for existing vote
        const existingVote = await prisma.vote.findFirst({
            where: {
                userId,
                postId: postId || undefined,
                replyId: replyId || undefined
            }
        });

        if (existingVote) {
            if (existingVote.type === type) {
                // Toggle off (remove vote)
                await prisma.vote.delete({
                    where: { id: existingVote.id }
                });
                return NextResponse.json({ message: 'Vote removed', action: 'removed' });
            } else {
                // Change vote type
                const updatedVote = await prisma.vote.update({
                    where: { id: existingVote.id },
                    data: { type }
                });
                return NextResponse.json({ message: 'Vote updated', vote: updatedVote, action: 'updated' });
            }
        } else {
            // Create new vote
            const newVote = await prisma.vote.create({
                data: {
                    type,
                    userId,
                    postId: postId || undefined,
                    replyId: replyId || undefined
                }
            });
            return NextResponse.json({ message: 'Vote added', vote: newVote, action: 'added' });
        }

    } catch (error) {
        console.error('Vote error:', error);
        return NextResponse.json({ error: 'Error processing vote' }, { status: 500 });
    }
}
