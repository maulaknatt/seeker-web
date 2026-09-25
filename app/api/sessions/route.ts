import { NextRequest, NextResponse } from 'next/server';
import { createSession, getAllSessions, deleteSession } from '@/lib/db';
import { sanitizeInput, normalizeUrl } from '@/lib/security';
import { TemplateType } from '@/types';

export async function GET() {
  try {
    const sessions = await getAllSessions(100);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }
    await deleteSession(id);
    return NextResponse.json({ success: true, message: 'Session deleted.' });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Failed to delete session.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = sanitizeInput(body.title || 'Link Preview Sharing');
    const templateType: TemplateType = body.templateType || 'custom';
    const targetUrl = normalizeUrl(sanitizeInput(body.targetUrl || ''));
    const siteName = sanitizeInput(body.siteName || '');
    const imageUrl = sanitizeInput(body.imageUrl || '');
    const description = sanitizeInput(body.description || '');
    const expirationMinutes = parseInt(body.expirationMinutes || '60', 10);

    if (isNaN(expirationMinutes) || expirationMinutes < 1 || expirationMinutes > 10080) {
      return NextResponse.json({ error: 'Invalid expiration duration.' }, { status: 400 });
    }

    const session = await createSession(
      title,
      expirationMinutes,
      templateType,
      targetUrl,
      siteName,
      imageUrl,
      description
    );

    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || '';
    const shareUrl = `${origin}/share/${session.session_code}`;
    const dashboardUrl = `${origin}/dashboard/${session.id}`;

    return NextResponse.json({
      session,
      shareUrl,
      dashboardUrl
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 });
  }
}
