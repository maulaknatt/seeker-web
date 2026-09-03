import { NextRequest, NextResponse } from 'next/server';
import { getSessionByCode, getSessionById, endSession, getLocationsForSession, getVisitorCount } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    let session = await getSessionByCode(sessionId);
    if (!session) {
      session = await getSessionById(sessionId);
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found or expired.' }, { status: 404 });
    }

    const locations = await getLocationsForSession(session.id);
    const visitorCount = await getVisitorCount(session.id);

    return NextResponse.json({
      session,
      locations,
      visitorCount
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await req.json();

    if (body.action === 'end') {
      const success = await endSession(sessionId);
      if (success) {
        return NextResponse.json({ message: 'Session ended successfully.' });
      }
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
