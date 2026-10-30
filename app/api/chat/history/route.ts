import { randomBytes } from 'node:crypto';
import { getAuthenticatedUser } from '@/lib/auth';
import { getDatabase } from '@/lib/database';
import { RequestError, enforceRateLimit, readJsonRequest, requestErrorResponse } from '@/lib/serverSecurity';
import { expiresAt } from '@/lib/retention';
export const dynamic = 'force-dynamic';
const SESSION_ID = /^[A-Za-z0-9]{20}$/;
type ChatDocument = { _id: string; sessions: { id: string; title: string; messages: StoredMessage[]; createdAt: Date }[]; expiresAt: Date };
type StoredMessage = { role: 'user' | 'assistant'; content: string; suggestions?: { name: string; reason: string }[] };
function parseMessages(value: unknown): StoredMessage[] | null {
    if (!Array.isArray(value) || value.length < 1 || value.length > 10) return null;
    const clean: StoredMessage[] = [];
    for (const entry of value) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
        const { role, content, suggestions } = entry as Record<string, unknown>;
        if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' ||
            content.trim().length < 1 || content.length > 2000) return null;
        const message: StoredMessage = { role, content: content.trim() };
        if (suggestions !== undefined) {
            if (role !== 'assistant' || !Array.isArray(suggestions) || suggestions.length > 4) return null;
            const items: { name: string; reason: string }[] = [];
            for (const item of suggestions) {
                if (!item || typeof item !== 'object' || Array.isArray(item) ||
                    typeof item.name !== 'string' || typeof item.reason !== 'string' ||
                    item.name.length > 80 || item.reason.length > 240) return null;
                items.push({ name: item.name, reason: item.reason });
            }
            message.suggestions = items;
        }
        clean.push(message);
    }
    return clean.some(message => message.role === 'user') ? clean : null;
}

export async function GET(req: Request) {
 try {
  const user = await getAuthenticatedUser(req);
  if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });
  await enforceRateLimit('chat-history-read', user.uid, 60, 60000);
  const doc = await (await getDatabase()).collection<ChatDocument>('chatHistory').findOne({ _id: user.uid });
  return Response.json({ sessions: (doc?.sessions || []).slice().reverse() });
 } catch (error) { return requestErrorResponse(error, 'Could not load chat history.'); }
}
export async function POST(req: Request) {
 try {
  const user = await getAuthenticatedUser(req);
  if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });
  const body = await readJsonRequest<Record<string, unknown>>(req, 32768);
  const messages = parseMessages(body.messages), sessionId = body.sessionId;
  if (!messages || (sessionId !== undefined && (typeof sessionId !== 'string' || !SESSION_ID.test(sessionId)))) return Response.json({ error: 'Invalid chat session.' }, { status: 400 });
  await enforceRateLimit('chat-history-user', user.uid, 60, 60000);
  const title = messages.find(m => m.role === 'user')!.content.slice(0, 50);
  const collection = (await getDatabase()).collection<ChatDocument>('chatHistory');
  const expiry = expiresAt('CHAT_RETENTION_DAYS', 180);
  if (typeof sessionId === 'string') {
   const result = await collection.updateOne({ _id: user.uid, 'sessions.id': sessionId }, { $set: { 'sessions.$.title': title, 'sessions.$.messages': messages, expiresAt: expiry } });
   if (!result.matchedCount) return Response.json({ error: 'Session not found.' }, { status: 404 });
   return Response.json({ id: sessionId, title });
  }
  const id = randomBytes(10).toString('hex');
  await collection.updateOne({ _id: user.uid }, { $setOnInsert: { sessions: [], expiresAt: expiry } }, { upsert: true });
  const saved = await collection.updateOne({ _id: user.uid, 'sessions.49': { $exists: false } }, { $push: { sessions: { id, title, messages, createdAt: new Date() } }, $set: { expiresAt: expiry } });
  if (!saved.matchedCount) throw new RequestError(429, 'You have reached the 50-session limit. Delete an older session to save a new one.');
  return Response.json({ id, title }, { status: 201 });
 } catch (error) { return requestErrorResponse(error, 'Could not save chat history.'); }
}
export async function DELETE(req: Request) {
 try {
  const user = await getAuthenticatedUser(req);
  if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('sessionId');
  if (!id || !SESSION_ID.test(id)) return Response.json({ error: 'Valid sessionId required.' }, { status: 400 });
  await enforceRateLimit('chat-history-delete', user.uid, 60, 60000);
  await (await getDatabase()).collection<ChatDocument>('chatHistory').updateOne({ _id: user.uid }, { $pull: { sessions: { id } } });
  return Response.json({ success: true });
 } catch (error) { return requestErrorResponse(error, 'Could not delete chat history.'); }
}
