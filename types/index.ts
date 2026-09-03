export type SessionStatus = 'active' | 'expired' | 'ended';

export type TemplateType = 'custom' | 'gdrive' | 'whatsapp' | 'zoom' | 'recaptcha';

export interface LocationSession {
  id: string;
  session_code: string;
  title: string;
  template_type: TemplateType;
  target_url?: string;
  site_name?: string;
  image_url?: string;
  description?: string;
  created_at: string;
  expires_at: string;
  status: SessionStatus;
}

export interface LocationRecord {
  id: string;
  session_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  timestamp: number;
  created_at: string;
}

export interface SessionVisitor {
  id: string;
  session_id: string;
  visitor_status: string;
  permission_status: 'prompt' | 'granted' | 'denied' | 'error';
  created_at: string;
}

export interface CreateSessionInput {
  title: string;
  templateType: TemplateType;
  targetUrl?: string;
  siteName?: string;
  imageUrl?: string;
  description?: string;
  expirationMinutes: number;
}
