'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { products } from '@/lib/data';
import {
    collection, addDoc, updateDoc, doc, getDocs,
    orderBy, query, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Suggestion { id: number; name: string; reason: string; }
interface Message { role: 'user' | 'assistant'; content: string; suggestions?: Suggestion[]; }
interface Session { id: string; title: string; createdAt: Date; messages: Message[]; }

const PROMPTS = [
    'Smart irrigation system', 'Obstacle avoiding robot',
    'Home automation with ESP32', 'Weather monitoring station',
    'Gas leakage detector', 'Line following robot',
    'Smart parking system', 'Face recognition attendance',
];

function SuggestionCard({ s, onNavigate }: {
    s: Suggestion; onNavigate: (id: number) => void;
}) {
    const product = products.find(p => p.id === s.id);
    if (!product) return null;
    return (
        <div style={{ border: '1px solid #e5e5e5', background: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>{product.name}</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px', lineHeight: 1.4 }}>{s.reason}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Rs. {product.price}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => onNavigate(s.id)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#fff', border: '1px solid #1a1a1a', color: '#1a1a1a', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}>
                    View
                </button>

            </div>
        </div>
    );
}

function ChatMessage({ msg, onNavigate }: {
    msg: Message; onNavigate: (id: number) => void;
}) {
    const isUser = msg.role === 'user';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: '6px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {isUser ? 'You' : 'OPAC AI'}
            </span>
            <div style={{ maxWidth: '78%', padding: '12px 16px', background: isUser ? '#1a1a1a' : '#f5f5f5', border: isUser ? 'none' : '1px solid #e5e5e5', color: isUser ? '#fff' : '#1a1a1a', fontSize: '14px', lineHeight: 1.7 }}>
                {msg.content}
            </div>
            {msg.suggestions && msg.suggestions.length > 0 && (
                <div style={{ width: '100%', maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Suggested Components</span>
                    {msg.suggestions.map(s => <SuggestionCard key={s.id} s={s} onNavigate={onNavigate} />)}
                </div>
            )}
        </div>
    );
}

export default function BuildProject() {
    const router = useRouter();

    const { user } = useFirebaseAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

    const loadSessions = useCallback(async () => {
        if (!user) return;
        setLoadingSessions(true);
        try {
            const q = query(collection(db, 'chatHistory', user.uid, 'sessions'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setSessions(snap.docs.map(d => {
                const data = d.data();
                return { id: d.id, title: data.title || 'Untitled', createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(), messages: data.messages || [] };
            }));
        } catch (err) { console.error(err); } finally { setLoadingSessions(false); }
    }, [user]);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    const startNewSession = () => { setActiveSessionId(null); setMessages([]); };
    const loadSession = (s: Session) => { setActiveSessionId(s.id); setMessages(s.messages); };

    const persistSession = async (updatedMessages: Message[]) => {
        if (!user) return;
        const title = updatedMessages.find(m => m.role === 'user')?.content.slice(0, 50) || 'New chat';
        if (activeSessionId) {
            await updateDoc(doc(db, 'chatHistory', user.uid, 'sessions', activeSessionId), { messages: updatedMessages, title, updatedAt: serverTimestamp() });
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedMessages, title } : s));
        } else {
            const ref = await addDoc(collection(db, 'chatHistory', user.uid, 'sessions'), { messages: updatedMessages, title, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
            setActiveSessionId(ref.id);
            setSessions(prev => [{ id: ref.id, title, createdAt: new Date(), messages: updatedMessages }, ...prev]);
        }
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;
        const userMsg: Message = { role: 'user', content: text };
        const updated = [...messages, userMsg];
        setMessages(updated); setInput(''); setLoading(true);
        try {
            const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }) });
            const data = await res.json();
            const aiMsg: Message = { role: 'assistant', content: data.message || 'Sorry, I could not process that.', suggestions: data.suggestions || [] };
            const final = [...updated, aiMsg];
            setMessages(final);
            if (user) await persistSession(final);
        } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]); }
        finally { setLoading(false); }
    };

    const handleNavigate = (id: number) => router.push(`/product/${id}`);


    return (
        <main style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Page header */}
            <div style={{ borderBottom: '1px solid #e5e5e5', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: 0, letterSpacing: '-0.2px' }}>AI Project Assistant</h1>
                    <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 0' }}>Describe your project — get component suggestions from our catalog</p>
                </div>
                <button onClick={startNewSession} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#1a1a1a', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#333'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'; }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Chat
                </button>
            </div>

            {/* 3-col layout */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr 260px', overflow: 'hidden', minHeight: 0 }}>

                {/* Left — History */}
                <div style={{ borderRight: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fafafa' }}>
                    <div style={{ padding: '18px 16px 10px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Chat History</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {!user && <p style={{ fontSize: '12px', color: '#bbb', padding: '8px 16px', lineHeight: 1.5 }}>Sign in to save your chat history.</p>}
                        {loadingSessions && <p style={{ fontSize: '12px', color: '#bbb', padding: '8px 16px' }}>Loading...</p>}
                        {sessions.length === 0 && !loadingSessions && user && <p style={{ fontSize: '12px', color: '#bbb', padding: '8px 16px', lineHeight: 1.5 }}>No previous chats yet.</p>}
                        {sessions.map(s => (
                            <button key={s.id} onClick={() => loadSession(s)} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: activeSessionId === s.id ? '#fff' : 'transparent', border: 'none', borderLeft: activeSessionId === s.id ? '2px solid #1a1a1a' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                                onMouseEnter={e => { if (activeSessionId !== s.id) (e.currentTarget as HTMLButtonElement).style.background = '#f0f0f0'; }}
                                onMouseLeave={e => { if (activeSessionId !== s.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                                <div style={{ fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                                <div style={{ fontSize: '11px', color: '#bbb' }}>{s.createdAt.toLocaleDateString()}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center — Chat */}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                        {messages.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                                <div style={{ width: 56, height: 56, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                </div>
                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>What are you building?</p>
                                <p style={{ fontSize: '13px', color: '#999', maxWidth: '320px', lineHeight: 1.6 }}>Describe your project idea and I will suggest the exact components you need from our catalog.</p>
                            </div>
                        )}
                        {messages.map((msg, i) => <ChatMessage key={i} msg={msg} onNavigate={handleNavigate} />)}
                        {loading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '4px', padding: '10px 14px', background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
                                    {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#999', animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                                </div>
                                <span style={{ fontSize: '12px', color: '#bbb' }}>OPAC AI is thinking...</span>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{ borderTop: '1px solid #e5e5e5', padding: '16px 24px', background: '#fff', flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Describe your project idea..." disabled={loading}
                                style={{ flex: 1, padding: '11px 14px', border: '1px solid #e5e5e5', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: loading ? '#fafafa' : '#fff', color: '#111', transition: 'border-color 0.15s' }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#1a1a1a'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; }} />
                            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: '11px 22px', background: input.trim() && !loading ? '#1a1a1a' : '#e5e5e5', border: 'none', color: input.trim() && !loading ? '#fff' : '#bbb', fontSize: '13px', fontWeight: '600', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.15s', flexShrink: 0 }}>
                                Send
                            </button>
                        </div>
                        <p style={{ fontSize: '11px', color: '#ddd', marginTop: '8px', textAlign: 'center' }}>Powered by GPT-4o-mini · OPAC Labs catalog</p>
                    </div>
                </div>

                {/* Right — Prompts */}
                <div style={{ borderLeft: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fafafa' }}>
                    <div style={{ padding: '18px 20px 10px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Try These Ideas</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px' }}>
                        {PROMPTS.map(prompt => (
                            <button key={prompt} onClick={() => setInput(prompt)} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: '#fff', border: '1px solid #e5e5e5', marginBottom: '8px', fontSize: '13px', color: '#555', cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1.4 }}
                                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#1a1a1a'; b.style.color = '#111'; }}
                                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#e5e5e5'; b.style.color = '#555'; }}>
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes dot { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
            `}</style>
        </main>
    );
}
