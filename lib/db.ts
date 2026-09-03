import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LocationSession, LocationRecord, SessionVisitor, TemplateType } from '@/types';
import { generateSessionCode } from './utils';

/* eslint-disable no-var */
declare global {
  var _mockSessions: Map<string, LocationSession> | undefined;
  var _mockLocations: Map<string, LocationRecord[]> | undefined;
  var _mockVisitors: Map<string, SessionVisitor[]> | undefined;
}

const mockSessions = globalThis._mockSessions ?? new Map<string, LocationSession>();
const mockLocations = globalThis._mockLocations ?? new Map<string, LocationRecord[]>();
const mockVisitors = globalThis._mockVisitors ?? new Map<string, SessionVisitor[]>();

if (process.env.NODE_ENV !== 'production') {
  globalThis._mockSessions = mockSessions;
  globalThis._mockLocations = mockLocations;
  globalThis._mockVisitors = mockVisitors;
}

let supabase: SupabaseClient | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    console.warn('Failed to initialize Supabase client, falling back to local memory store.', e);
  }
}

export async function createSession(
  title: string,
  expirationMinutes: number,
  templateType: TemplateType = 'custom',
  targetUrl?: string,
  siteName?: string,
  imageUrl?: string,
  description?: string
): Promise<LocationSession> {
  const id = crypto.randomUUID();
  const sessionCode = generateSessionCode(8);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expirationMinutes * 60 * 1000).toISOString();

  const newSession: LocationSession = {
    id,
    session_code: sessionCode,
    title: title || 'Link Preview Sharing',
    template_type: templateType,
    target_url: targetUrl || '',
    site_name: siteName || '',
    image_url: imageUrl || '',
    description: description || '',
    created_at: now.toISOString(),
    expires_at: expiresAt,
    status: 'active'
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        id,
        session_code: sessionCode,
        title: newSession.title,
        template_type: newSession.template_type,
        target_url: newSession.target_url,
        site_name: newSession.site_name,
        image_url: newSession.image_url,
        description: newSession.description,
        created_at: newSession.created_at,
        expires_at: expiresAt,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase createSession error:', error);
    } else if (data) {
      return data as LocationSession;
    }
  }

  // Fallback / local store
  mockSessions.set(sessionCode, newSession);
  mockSessions.set(id, newSession);
  mockLocations.set(id, []);
  mockVisitors.set(id, []);

  return newSession;
}

export async function getSessionByCode(code: string): Promise<LocationSession | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_code', code)
      .single();

    if (!error && data) {
      const session = data as LocationSession;
      if (new Date(session.expires_at) < new Date() && session.status === 'active') {
        session.status = 'expired';
        await supabase.from('sessions').update({ status: 'expired' }).eq('id', session.id);
      }
      return session;
    }
  }

  const session = mockSessions.get(code) || mockSessions.get(code.toLowerCase());
  if (!session) return null;

  if (new Date(session.expires_at) < new Date() && session.status === 'active') {
    session.status = 'expired';
  }
  return session;
}

export async function getSessionById(id: string): Promise<LocationSession | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      const session = data as LocationSession;
      if (new Date(session.expires_at) < new Date() && session.status === 'active') {
        session.status = 'expired';
        await supabase.from('sessions').update({ status: 'expired' }).eq('id', session.id);
      }
      return session;
    }
  }

  const session = mockSessions.get(id);
  if (!session) return null;

  if (new Date(session.expires_at) < new Date() && session.status === 'active') {
    session.status = 'expired';
  }
  return session;
}

export async function endSession(idOrCode: string): Promise<boolean> {
  const session = await getSessionByCode(idOrCode) || await getSessionById(idOrCode);
  if (!session) return false;

  session.status = 'ended';

  if (supabase) {
    await supabase.from('sessions').update({ status: 'ended' }).eq('id', session.id);
  }

  return true;
}

export async function addLocation(
  sessionId: string,
  latitude: number,
  longitude: number,
  accuracy: number,
  altitude?: number | null,
  speed?: number | null
): Promise<LocationRecord> {
  const id = crypto.randomUUID();
  const now = new Date();

  const record: LocationRecord = {
    id,
    session_id: sessionId,
    latitude,
    longitude,
    accuracy,
    altitude: altitude ?? null,
    speed: speed ?? null,
    timestamp: now.getTime(),
    created_at: now.toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        id,
        session_id: sessionId,
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        timestamp: record.timestamp,
        created_at: record.created_at
      })
      .select()
      .single();

    if (!error && data) {
      return data as LocationRecord;
    }
  }

  const locs = mockLocations.get(sessionId) || [];
  locs.push(record);
  mockLocations.set(sessionId, locs);

  return record;
}

export async function getLocationsForSession(sessionId: string): Promise<LocationRecord[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as LocationRecord[];
    }
  }

  return mockLocations.get(sessionId) || [];
}

export async function recordVisitor(
  sessionId: string,
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'error'
): Promise<SessionVisitor> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const visitor: SessionVisitor = {
    id,
    session_id: sessionId,
    visitor_status: 'visited',
    permission_status: permissionStatus,
    created_at: now
  };

  if (supabase) {
    await supabase.from('session_visitors').insert({
      id,
      session_id: sessionId,
      visitor_status: 'visited',
      permission_status: permissionStatus,
      created_at: now
    });
  } else {
    const visitors = mockVisitors.get(sessionId) || [];
    visitors.push(visitor);
    mockVisitors.set(sessionId, visitors);
  }

  return visitor;
}

export async function getVisitorCount(sessionId: string): Promise<number> {
  if (supabase) {
    const { count, error } = await supabase
      .from('session_visitors')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (!error && count !== null) return count;
  }

  return (mockVisitors.get(sessionId) || []).length;
}
