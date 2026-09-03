import { NextRequest, NextResponse } from 'next/server';
import { addLocation, getSessionByCode, getSessionById, recordVisitor } from '@/lib/db';
import { isValidCoordinates } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, latitude, longitude, accuracy, altitude, speed, permissionStatus } = body;

    let session = await getSessionByCode(sessionId);
    if (!session) {
      session = await getSessionById(sessionId);
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found or expired.' }, { status: 404 });
    }

    if (session.status !== 'active') {
      return NextResponse.json({ error: 'Session is no longer active.' }, { status: 410 });
    }

    // Record visitor consent attempt
    if (permissionStatus) {
      await recordVisitor(session.id, permissionStatus);
    }

    // If permission was granted and coordinates provided, record location
    if (permissionStatus === 'granted' || (latitude !== undefined && longitude !== undefined)) {
      if (!isValidCoordinates(latitude, longitude)) {
        return NextResponse.json({ error: 'Invalid coordinates provided.' }, { status: 400 });
      }

      const record = await addLocation(
        session.id,
        latitude,
        longitude,
        accuracy || 0,
        altitude,
        speed
      );

      return NextResponse.json({
        success: true,
        record
      });
    }

    return NextResponse.json({ success: true, message: 'Status recorded.' });
  } catch (error) {
    console.error('Error saving location:', error);
    return NextResponse.json({ error: 'Failed to record location.' }, { status: 500 });
  }
}
