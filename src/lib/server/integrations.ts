import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createClient, type User } from '@supabase/supabase-js';

function supabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error('Supabase server configuration is missing.');
  return value;
}

export function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Supabase service configuration is missing.');
  return createClient(supabaseUrl(), key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function authenticatedUser(request: Request): Promise<User | null> {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer ([^\s]+)$/i)?.[1];
  if (!token) return null;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error('Supabase authentication configuration is missing.');
  const client = createClient(supabaseUrl(), anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error) return null;
  return data.user;
}

function encryptionKey(): Buffer {
  const encoded = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!encoded) throw new Error('Google Calendar encryption is not configured.');
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
  return key;
}

export function createGoogleOAuthState(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + 10 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', encryptionKey()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyGoogleOAuthState(state: string): { userId: string } | null {
  const [payload, suppliedSignature, extra] = state.split('.');
  if (!payload || !suppliedSignature || extra) return null;
  const expectedSignature = createHmac('sha256', encryptionKey()).update(payload).digest();
  const receivedSignature = Buffer.from(suppliedSignature, 'base64url');
  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(receivedSignature, expectedSignature)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { userId?: unknown; expiresAt?: unknown };
    if (typeof parsed.userId !== 'string' || typeof parsed.expiresAt !== 'number' || parsed.expiresAt <= Date.now()) return null;
    return { userId: parsed.userId };
  } catch {
    return null;
  }
}

export function encryptGoogleToken(token: string): { ciphertext: string; iv: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return { ciphertext: ciphertext.toString('base64'), iv: iv.toString('base64') };
}

export function decryptGoogleToken(ciphertext: string, encodedIv: string): string {
  const encrypted = Buffer.from(ciphertext, 'base64');
  const iv = Buffer.from(encodedIv, 'base64');
  if (iv.length !== 12 || encrypted.length < 17) throw new Error('Stored Google Calendar credentials are invalid.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(encrypted.subarray(encrypted.length - 16));
  return Buffer.concat([decipher.update(encrypted.subarray(0, encrypted.length - 16)), decipher.final()]).toString('utf8');
}
