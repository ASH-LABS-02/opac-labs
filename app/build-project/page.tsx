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
        <div
            style={{
                border: '3px solid #111',
                background: 'var(--opac-paper)',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
                boxShadow: '-4px 4px 0px #111',
                transition: 'all 0.1s steps(2)',
            }}
            onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translate(-2px, 2px)';
                el.style.boxShadow = '-2px 2px 0px #111';
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translate(0,0)';
                el.style.boxShadow = '-4px 4px 0px #111';
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#111', marginBottom: '2px', fontFamily: 'var(--font-archivo-black), sans-serif', textTransform: 'uppercase' }}>
                    {product.name}
                </div>
                <div style={{ fontSize: '11px', color: '#333', marginBottom: '4px', lineHeight: 1.4, fontFamily: 'var(--font-space-mono), monospace' }}>
                    {s.reason}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--opac-accent)', fontFamily: 'var(--font-archivo-black), sans-serif' }}>
                    Rs. {product.price}
                </div>
            </div>
            <button
                onClick={() => onNavigate(s.id)}
                style={{
                    padding: '6px 14px', fontSize: '11px', fontWeight: '900',
                    background: '#111', border: '2px solid #111', color: '#fff',
                    cursor: 'pointer', fontFamily: 'var(--font-archivo-black), sans-serif',
                    textTransform: 'uppercase', transition: 'all 0.1s steps(2)',
                    whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '-3px 3px 0px var(--opac-accent)',
                }}
                onMouseEnter={e => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = 'var(--opac-accent)';
                    b.style.boxShadow = 'none';
                }}
                onMouseLeave={e => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = '#111';
                    b.style.boxShadow = '-3px 3px 0px var(--opac-accent)';
                }}
            >
                VIEW!
            </button>
        </div>
    );
}

function ChatMessage({ msg, onNavigate }: {
    msg: Message; onNavigate: (id: number) => void;
}) {
    const isUser = msg.role === 'user';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: '4px', marginBottom: '18px' }}>
            <span style={{ fontSize: '10px', fontWeight: '900', color: isUser ? 'var(--opac-accent)' : '#111', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'var(--font-archivo-black), sans-serif' }}>
                {isUser ? '★ YOU' : '◆ OPAC AI'}
            </span>
            <div style={{
                maxWidth: '78%', padding: '12px 16px',
                background: isUser ? '#111' : '#fff',
                border: '3px solid #111',
                color: isUser ? 'var(--opac-paper)' : '#111',
                fontSize: '13px', lineHeight: 1.7,
                fontFamily: 'var(--font-space-mono), monospace',
                boxShadow: isUser ? '-4px 4px 0px var(--opac-accent)' : '-4px 4px 0px #111',
                borderRadius: isUser ? '8px 2px 8px 8px' : '2px 8px 8px 8px',
                transform: isUser ? 'rotate(0.3deg)' : 'rotate(-0.3deg)',
            }}>
                {msg.content}
            </div>
            {msg.suggestions && msg.suggestions.length > 0 && (
                <div style={{ width: '100%', maxWidth: '78%', marginTop: '8px' }}>
                    <span style={{
                        fontSize: '10px', fontWeight: '900', color: '#fff',
                        textTransform: 'uppercase', letterSpacing: '1.2px',
                        fontFamily: 'var(--font-archivo-black), sans-serif',
                        background: 'var(--opac-accent)', padding: '4px 10px',
                        display: 'inline-block', marginBottom: '8px',
                        boxShadow: '-3px 3px 0px #111',
                    }}>
                        SUGGESTED COMPONENTS
                    </span>
                    {msg.suggestions.map(s => (
                        <SuggestionCard key={s.id} s={s} onNavigate={onNavigate} />
                    ))}
                </div>
            )}
        </div>
    );
}

const PAGE_CSS = `
.bp-manga-page {
    font-family: var(--font-space-mono), 'Space Mono', monospace;
    background-color: var(--opac-paper);
    color: #111;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
}

.bp-manga-page::before {
    content: '';
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    pointer-events: none;
    opacity: 0.12;
    z-index: 100;
    background-image: radial-gradient(#111 1px, transparent 1px);
    background-size: 6px 6px;
}

h1, h2, h3, .manga-title {
    font-family: var(--font-archivo-black), 'Archivo Black', sans-serif;
    text-transform: uppercase;
}

.comic-dialogue {
    font-family: var(--font-kalam), 'Kalam', cursive;
    font-size: 1.1rem;
    line-height: 1.4;
}

.comic-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px;
    position: relative;
    z-index: 10;
}

.comic-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: minmax(150px, auto);
    gap: 16px;
    background: #111;
    padding: 16px;
    border: 8px solid #111;
}

.panel {
    background: var(--opac-paper);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 4px solid #111;
    border-radius: 2px 8px 3px 6px;
    transition: transform 0.2s ease;
}

.panel:hover {
    transform: scale(1.01);
    z-index: 50;
    box-shadow: 12px 12px 0px rgba(0,0,0,1);
}

.panel-hero { grid-column: span 12; min-height: 360px; padding: 40px; background-color: var(--opac-blue); }
.panel-chat { grid-column: span 8; min-height: 520px; padding: 0; background-color: #fff; display: flex; flex-direction: column; }
.panel-sidebar { grid-column: span 4; min-height: 520px; padding: 0; background-color: var(--opac-yellow); display: flex; flex-direction: column; }
.panel-half { grid-column: span 6; min-height: 220px; padding: 24px; }
.panel-cta { grid-column: span 12; min-height: 240px; padding: 60px 20px; background-color: #111; color: var(--opac-paper); text-align: center; }

@media (max-width: 900px) {
    .panel-chat { grid-column: span 12; }
    .panel-sidebar { grid-column: span 12; min-height: 300px; }
    .panel-half { grid-column: span 12; }
}

.massive-text {
    font-size: clamp(3.5rem, 8vw, 7rem);
    line-height: 0.85;
    letter-spacing: -0.05em;
    color: var(--opac-paper);
    text-shadow:
        4px 4px 0 #111,
        -2px -2px 0 #111,
        2px -2px 0 #111,
        -2px 2px 0 #111,
        2px 2px 0 #111,
        8px 8px 0px var(--opac-accent);
}

.offset-shadow-text {
    color: #111;
    text-shadow: -4px 4px 0px #fff, -5px 5px 0px #111;
}

.action-burst {
    position: absolute;
    top: -50px; right: -50px;
    width: 200px; height: 200px;
    background: var(--opac-accent);
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation: bpSpinBurst 10s linear infinite;
    z-index: 0;
}

@keyframes bpSpinBurst {
    100% { transform: rotate(360deg); }
}

.speech-bubble {
    position: relative;
    background: #fff;
    border: 4px solid #111;
    border-radius: 50% / 30%;
    padding: 16px 24px;
    margin-bottom: 20px;
    align-self: flex-start;
    box-shadow: 6px 6px 0px #111;
    transform: rotate(-2deg);
}
.speech-bubble::before {
    content: '';
    position: absolute;
    bottom: -20px; left: 40px;
    border-width: 20px 20px 0 0;
    border-style: solid;
    border-color: #111 transparent transparent transparent;
}
.speech-bubble::after {
    content: '';
    position: absolute;
    bottom: -13px; left: 43px;
    border-width: 15px 15px 0 0;
    border-style: solid;
    border-color: #fff transparent transparent transparent;
}

.manga-btn {
    display: inline-block;
    padding: 14px 28px;
    background: #111;
    color: #fff;
    font-family: var(--font-archivo-black), sans-serif;
    font-size: 1.2rem;
    text-transform: uppercase;
    border: 4px solid #111;
    box-shadow: -8px 8px 0px var(--opac-accent), -8px 8px 0px 4px #111;
    transform: rotate(-1deg);
    cursor: pointer;
    transition: all 0.1s steps(2);
}
.manga-btn:hover {
    transform: translate(-4px, 4px) rotate(0deg);
    box-shadow: -4px 4px 0px var(--opac-accent), -4px 4px 0px 4px #111;
    background: #fff;
    color: #111;
}
.manga-btn:active {
    transform: translate(-8px, 8px) rotate(1deg);
    box-shadow: 0px 0px 0px var(--opac-accent);
}

.vert-text {
    writing-mode: vertical-rl;
    text-orientation: upright;
    font-family: sans-serif;
    font-weight: 900;
    font-size: 3rem;
    position: absolute;
    left: 10px; top: 10px;
    color: rgba(17,17,17,0.08);
}

.ink-splat {
    position: absolute;
    background: #111;
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    filter: url('#roughEdge');
}

.chat-header {
    border-bottom: 3px solid #111;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--opac-blue);
    flex-shrink: 0;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #fafafa;
    scrollbar-width: thin;
    scrollbar-color: #111 var(--opac-paper);
}
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: var(--opac-paper); }
.chat-messages::-webkit-scrollbar-thumb { background: #111; }

.chat-input-bar {
    border-top: 3px solid #111;
    padding: 12px 16px;
    background: var(--opac-paper);
    flex-shrink: 0;
    display: flex;
    gap: 8px;
}

.chat-input {
    flex: 1;
    padding: 10px 14px;
    border: 3px solid #111;
    background: #fff;
    font-size: 13px;
    font-family: var(--font-space-mono), monospace;
    outline: none;
    color: #111;
    box-shadow: -3px 3px 0px #111;
    transition: all 0.1s steps(2);
}
.chat-input:focus { box-shadow: -5px 5px 0px var(--opac-accent); border-color: var(--opac-accent); }

.send-btn {
    padding: 10px 20px;
    background: var(--opac-accent);
    border: 3px solid #111;
    color: #fff;
    font-family: var(--font-archivo-black), sans-serif;
    font-size: 0.75rem;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: -4px 4px 0px #111;
    transition: all 0.1s steps(2);
    flex-shrink: 0;
}
.send-btn:hover:not(:disabled) {
    transform: translate(-2px, 2px);
    box-shadow: -2px 2px 0px #111;
    background: #8c2040;
}
.send-btn:disabled { background: #ccc; border-color: #999; color: #666; cursor: not-allowed; box-shadow: none; }

.sidebar-header {
    border-bottom: 3px solid #111;
    padding: 14px 16px;
    background: var(--opac-yellow);
    font-family: var(--font-archivo-black), sans-serif;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.session-btn {
    width: 100%;
    text-align: left;
    padding: 10px 14px;
    background: transparent;
    border: none;
    border-left: 4px solid transparent;
    border-bottom: 2px solid rgba(17,17,17,0.1);
    cursor: pointer;
    transition: all 0.1s steps(2);
    font-family: var(--font-space-mono), monospace;
}
.session-btn:hover { background: rgba(41,121,255,0.1); border-left-color: var(--opac-accent); }
.session-btn.active { background: rgba(41,121,255,0.15); border-left-color: #111; }

.prompt-btn {
    width: 100%;
    text-align: left;
    padding: 9px 14px;
    background: transparent;
    border: none;
    border-bottom: 2px solid rgba(17,17,17,0.1);
    font-size: 11px;
    color: #333;
    cursor: pointer;
    transition: all 0.1s steps(2);
    font-family: var(--font-space-mono), monospace;
}
.prompt-btn:hover { background: rgba(41,121,255,0.1); color: #111; padding-left: 20px; }

@keyframes bpDot {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.7); }
    40% { opacity: 1; transform: scale(1); }
}

@keyframes bpFloatIcon {
    0%, 100% { transform: translateY(0) rotate(-3deg); }
    50% { transform: translateY(-8px) rotate(3deg); }
}
`;

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

    useEffect(() => {
        if (!messages.length) return;
        const container = bottomRef.current?.parentElement;
        if (container) container.scrollTo({ top: container.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }, [messages, loading]);

    const loadSessions = useCallback(async () => {
        if (!user) return;
        setLoadingSessions(true);
        try {
            const q = query(
                collection(db, 'chatHistory', user.uid, 'sessions'),
                orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            setSessions(snap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    title: data.title || 'Untitled',
                    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                    messages: data.messages || [],
                };
            }));
        } catch (err) { console.error(err); }
        finally { setLoadingSessions(false); }
    }, [user]);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    const startNewSession = () => { if (loading) return; setActiveSessionId(null); setMessages([]); setInput(''); };
    const loadSession = (s: Session) => { setActiveSessionId(s.id); setMessages(s.messages); };

    const persistSession = async (updatedMessages: Message[]) => {
        if (!user) return;
        const title = updatedMessages.find(m => m.role === 'user')?.content.slice(0, 50) || 'New chat';
        if (activeSessionId) {
            await updateDoc(
                doc(db, 'chatHistory', user.uid, 'sessions', activeSessionId),
                { messages: updatedMessages, title, updatedAt: serverTimestamp() }
            );
            setSessions(prev => prev.map(s =>
                s.id === activeSessionId ? { ...s, messages: updatedMessages, title } : s
            ));
        } else {
            const ref = await addDoc(
                collection(db, 'chatHistory', user.uid, 'sessions'),
                { messages: updatedMessages, title, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
            );
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
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }),
            });
            if (!res.ok) throw new Error('Chat request failed');
            const data = await res.json();
            const aiMsg: Message = {
                role: 'assistant',
                content: data.message || 'Sorry, I could not process that.',
                suggestions: data.suggestions || [],
            };
            const final = [...updated, aiMsg];
            setMessages(final);
            if (user) await persistSession(final).catch(error => console.error('Could not save chat history:', error));
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
        } finally { setLoading(false); }
    };

    const handleNavigate = (id: number) => router.push('/product/' + String(id));

    const handleWhatsAppBuild = async () => {
        if (messages.length === 0) return;
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || 'Custom Project Idea';

        let msg = `*Build Project Request — OPAC Labs*\n\n`;
        msg += `Name: ${user?.displayName || 'Customer'}\n`;
        msg += `Email: ${user?.email || 'N/A'}\n\n`;
        msg += `Project Idea:\n${lastUserMsg}\n`;

        // Save order to Firestore orders collection
        if (user) {
            try {
                await addDoc(collection(db, 'orders'), {
                    userId: user.uid,
                    userName: user.displayName || 'Customer',
                    userEmail: user.email || '',
                    items: [
                        {
                            id: 'build-' + Date.now(),
                            name: `AI Build: ${lastUserMsg.slice(0, 45)}`,
                            price: 5000,
                            quantity: 1
                        }
                    ],
                    total: 5000,
                    status: 'Processing',
                    createdAt: serverTimestamp()
                });
            } catch (err) {
                console.error('Error saving build order:', err);
            }
        }

        window.open(`https://wa.me/917867089886?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <main className="bp-manga-page">
            <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

            <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                <filter id="roughEdge">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </svg>

            <div className="comic-container">
                <div className="comic-grid">

                    {/* HERO PANEL */}
                    <div className="panel panel-hero" style={{ overflow: 'visible' }}>
                        <div className="vert-text" style={{ fontSize: '5rem', letterSpacing: '-18px' }}>構築</div>
                        <div className="action-burst"></div>
                        <div className="speech-bubble comic-dialogue" style={{ maxWidth: '280px', zIndex: 10 }}>
                            <strong>AI PROJECT BUILDER:</strong> Tell me your idea!
                        </div>
                        <h1 className="massive-text" style={{ position: 'relative', zIndex: 2 }}>
                            BUILD YOUR<br />PROJECT
                        </h1>
                        <div style={{ marginTop: '30px', position: 'relative', zIndex: 10 }}>
                            <button onClick={startNewSession} className="manga-btn">
                                NEW CHAT SESSION
                            </button>
                        </div>
                    </div>

                    {/* CHAT PANEL */}
                    <div className="panel panel-chat" style={{ justifyContent: 'flex-start' }}>
                        <div className="chat-header">
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-archivo-black), sans-serif', fontSize: '1rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    AI Chat
                                </h2>
                                <p style={{ fontSize: '10px', color: '#555', margin: '2px 0 0', fontFamily: 'var(--font-space-mono), monospace' }}>
                                    Describe your project and get matched components
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {messages.length > 0 && (
                                    <button
                                        onClick={handleWhatsAppBuild}
                                        className="manga-btn-primary"
                                        style={{ padding: '6px 12px', fontSize: '10px', boxShadow: '-2px 2px 0px #111' }}
                                    >
                                        ORDER VIA WHATSAPP
                                    </button>
                                )}
                                <div style={{ fontSize: '10px', color: 'var(--opac-accent)', fontFamily: 'var(--font-archivo-black), sans-serif', textTransform: 'uppercase', letterSpacing: '1px', border: '2px solid var(--opac-accent)', padding: '3px 8px' }}>
                                    LIVE
                                </div>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center', gap: '20px' }}>
                                    <div style={{ position: 'relative', background: '#fff', border: '4px solid #111', borderRadius: '50% / 30%', padding: '18px 28px', boxShadow: '6px 6px 0px #111', transform: 'rotate(-1deg)', maxWidth: '280px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '900', color: '#111', margin: '0 0 6px', fontFamily: 'var(--font-archivo-black), sans-serif', textTransform: 'uppercase' }}>
                                            WHAT ARE YOU BUILDING?!
                                        </p>
                                        <p className="comic-dialogue" style={{ fontSize: '12px', color: '#333', margin: 0 }}>
                                            Describe your idea and I will suggest exact components from our catalog!
                                        </p>
                                        <div style={{ position: 'absolute', bottom: '-20px', left: '40px', borderWidth: '20px 20px 0 0', borderStyle: 'solid', borderColor: '#111 transparent transparent transparent' }} />
                                        <div style={{ position: 'absolute', bottom: '-13px', left: '43px', borderWidth: '15px 15px 0 0', borderStyle: 'solid', borderColor: '#fff transparent transparent transparent' }} />
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <ChatMessage key={i} msg={msg} onNavigate={handleNavigate} />
                            ))}

                            {loading && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '18px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#111', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'var(--font-archivo-black), sans-serif' }}>
                                        OPAC AI
                                    </span>
                                    <div style={{ padding: '12px 16px', background: '#fff', border: '3px solid #111', boxShadow: '-4px 4px 0px #111', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--opac-accent)', animation: `bpDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="chat-input-bar">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Describe your project idea..."
                                disabled={loading}
                                className="chat-input"
                            />
                            <button onClick={sendMessage} disabled={loading || !input.trim()} className="send-btn">
                                SEND
                            </button>
                        </div>
                    </div>

                    {/* SIDEBAR PANEL */}
                    <div className="panel panel-sidebar" style={{ justifyContent: 'flex-start' }}>
                        <div className="sidebar-header">Chat History</div>
                        <div style={{ flex: 1, overflowY: 'auto', borderBottom: '3px solid #111', minHeight: 0 }}>
                            {!user && (
                                <p style={{ fontSize: '11px', color: '#555', padding: '12px 14px', lineHeight: 1.6, fontFamily: 'var(--font-space-mono), monospace', fontStyle: 'italic' }}>
                                    Sign in to save sessions.
                                </p>
                            )}
                            {loadingSessions && (
                                <p style={{ fontSize: '11px', color: '#555', padding: '12px 14px', fontFamily: 'var(--font-space-mono), monospace' }}>
                                    Loading...
                                </p>
                            )}
                            {sessions.length === 0 && !loadingSessions && user && (
                                <p style={{ fontSize: '11px', color: '#555', padding: '12px 14px', lineHeight: 1.6, fontFamily: 'var(--font-space-mono), monospace', fontStyle: 'italic' }}>
                                    No sessions yet. Start building!
                                </p>
                            )}
                            {sessions.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => loadSession(s)}
                                    className={`session-btn${activeSessionId === s.id ? ' active' : ''}`}
                                >
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#111', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.title}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#888' }}>
                                        {s.createdAt.toLocaleDateString()}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="sidebar-header" style={{ background: 'var(--opac-yellow)' }}>Quick Ideas</div>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {PROMPTS.map(prompt => (
                                <button key={prompt} onClick={() => setInput(prompt)} className="prompt-btn">
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* INFO PANELS */}
                    <div className="panel panel-half" style={{ backgroundColor: 'var(--opac-yellow)' }}>
                        <div className="vert-text">技術</div>
                        <h2 className="offset-shadow-text" style={{ fontSize: '2rem', marginBottom: '14px' }}>HOW IT WORKS</h2>
                        <p className="comic-dialogue">
                            Describe any electronics project. Our AI matches you with exact components from the OPAC Labs catalog!
                        </p>
                    </div>

                    <div className="panel panel-half" style={{ backgroundColor: 'var(--opac-pink)' }}>
                        <div className="ink-splat" style={{ width: '80px', height: '80px', top: '-15px', right: '-15px' }}></div>
                        <div className="vert-text">目標</div>
                        <h2 className="offset-shadow-text" style={{ fontSize: '2rem', marginBottom: '14px', position: 'relative', zIndex: 2 }}>POWERED BY AI</h2>
                        <p className="comic-dialogue" style={{ position: 'relative', zIndex: 2 }}>
                            GPT-4o-mini analyses your idea and picks components with clear explanations. Click any suggestion to view it!
                        </p>
                    </div>

                    {/* CTA PANEL */}
                    <div className="panel panel-cta">
                        <h2 className="manga-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', marginBottom: '28px', color: 'var(--opac-accent)' }}>
                            START BUILDING TODAY
                        </h2>
                        <button onClick={() => router.push('/project')} className="manga-btn" style={{ background: '#fff', color: '#111', boxShadow: '-8px 8px 0px var(--opac-yellow)' }}>
                            VIEW STUDENT PROJECTS
                        </button>
                    </div>

                </div>
            </div>
        </main>
    );
}
