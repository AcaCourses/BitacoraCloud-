import { Redis } from '@upstash/redis';
import { SessionRecord } from '../types';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("Missing Upstash Redis environment variables");
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'example_token',
});

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function getSession(id: string): Promise<SessionRecord | null> {
  const session = await redis.get(`session:${id}`);
  return session as SessionRecord | null;
}

export async function saveSession(session: SessionRecord): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.set(`session:${session.id}`, session, { ex: SESSION_TTL_SECONDS });
  pipeline.set(`resume:${session.resumeCode}`, session.id, { ex: SESSION_TTL_SECONDS });
  await pipeline.exec();
}

export async function getSessionByCode(code: string): Promise<SessionRecord | null> {
  const sessionId = await redis.get(`resume:${code}`);
  if (!sessionId) return null;
  return getSession(sessionId as string);
}
