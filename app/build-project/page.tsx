'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';

interface Suggestion { name: string; reason: string; }
interface Message { role: 'user' | 'assistant'; content: string; suggestions?: Suggestion[]; }
interface Session { id: string; title: string; createdAt: Date; messages: Message[]; }

const PROMPTS = [
    'A dashboard for a small business', 'A mobile app for campus events',
    'Smart irrigation prototype', 'A robot that navigates a room',
    'Home automation system', 'A connected attendance system',
    'An API for my existing app', 'A sensor-based safety device',
];

function SuggestionCard({ s }: { s: Suggestion }) {
    return (
        <div
            style={{
                border: '3px solid #111',
                background: 'var(--opac-paper)',
                padding: '12px 14px',
                marginBottom: '8px',
                boxShadow: '-4px 4px 0px #111',
            }}
        >
            <div>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#111', marginBottom: '2px', fontFamily: 'var(--font-archivo-black), sans-serif', textTransform: 'uppercase' }}>
                    {s.name}
                </div>
                <div style={{ fontSize: '11px', color: '#333', marginBottom: '4px', lineHeight: 1.4, fontFamily: 'var(--font-space-mono), monospace' }}>
                    {s.reason}
                </div>
            </div>
        </div>
    );
}

function ChatMessage({ msg }: { msg: Message }) {
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
            {msg.suggestions && msg.suggestions.some(s => !('id' in s)) && (
                <div style={{ width: '100%', maxWidth: '78%', marginTop: '8px' }}>
                    <span style={{
                        fontSize: '10px', fontWeight: '900', color: '#fff',
                        textTransform: 'uppercase', letterSpacing: '1.2px',
                        fontFamily: 'var(--font-archivo-black), sans-serif',
                        background: 'var(--opac-accent)', padding: '4px 10px',
                        display: 'inline-block', marginBottom: '8px',
                        boxShadow: '-3px 3px 0px #111',
                    }}>
                        PROJECT PLAN
                    </span>
                    {msg.suggestions.filter(s => !('id' in s)).map(s => (
                        <SuggestionCard key={s.name} s={s} />
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
    flex: 1;
    min-width: 0;
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
.session-row { display: flex; border-bottom: 2px solid rgba(17,17,17,0.1); }
.session-row .session-btn { border-bottom: 0; }
.session-delete { width: 38px; flex-shrink: 0; border: 0; border-left: 1px solid rgba(17,17,17,0.15); background: transparent; cursor: pointer; font-size: 18px; }
.session-delete:hover, .session-delete:focus-visible { background: #ffe3e8; color: #a3152d; }

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
    const { user } = useAuth();
    return <ProjectPlanner key={user?.uid || 'guest'} />;
}

function ProjectPlanner() {
    const router = useRouter();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [chatError, setChatError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!messages.length) return;
        const container = bottomRef.current?.parentElement;
        if (container) container.scrollTo({ top: container.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }, [messages, loading]);

    const loadSessions = useCallback(async () => {
        if (!user) return;
        setLoadingSessions(true);
        setHistoryError('');
        try {
            const response = await fetch('/api/chat/history', { signal: AbortSignal.timeout(15_000) });
            if (!response.ok) throw new Error('Could not load chat history');
            const data = await response.json();
            setSessions((data.sessions || []).map((session: { id: string; title: string; createdAt: string | null; messages: Message[] }) => ({
                id: session.id,
                title: session.title,
                createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
                messages: session.messages,
            })));
        } catch (err) { setHistoryError(err instanceof Error ? err.message : 'Could not load chat history.'); }
        finally { setLoadingSessions(false); }
    }, [user]);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    const startNewSession = () => { if (loading) return; setActiveSessionId(null); setMessages([]); setInput(''); setChatError(''); inputRef.current?.focus(); };
    const loadSession = (s: Session) => { if (loading) return; setActiveSessionId(s.id); setMessages(s.messages.slice(-10)); setChatError(''); };

    const persistSession = async (updatedMessages: Message[]) => {
        if (!user) return;
        const title = updatedMessages.find(m => m.role === 'user')?.content.slice(0, 50) || 'New chat';
        const response = await fetch('/api/chat/history', {
            method: 'POST', signal: AbortSignal.timeout(30_000),
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: activeSessionId || undefined, messages: updatedMessages }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.error || 'Could not save chat history.');
        }
        const saved = await response.json();
        setHistoryError('');
        if (activeSessionId) {
            setSessions(prev => prev.map(s =>
                s.id === activeSessionId ? { ...s, messages: updatedMessages, title } : s
            ));
        } else {
            setActiveSessionId(saved.id);
            setSessions(prev => [{ id: saved.id, title, createdAt: new Date(), messages: updatedMessages }, ...prev]);
        }
    };

    const deleteSession = async (sessionId: string) => {
        if (!user || deletingSessionId || loading) return;
        setDeletingSessionId(sessionId);
        setHistoryError('');
        try {
            const response = await fetch(`/api/chat/history?sessionId=${encodeURIComponent(sessionId)}`, {
                method: 'DELETE', signal: AbortSignal.timeout(15_000),
            });
            if (!response.ok) throw new Error('Could not delete this session.');
            setSessions(previous => previous.filter(session => session.id !== sessionId));
            if (activeSessionId === sessionId) { setActiveSessionId(null); setMessages([]); setInput(''); }
        } catch (error) {
            setHistoryError(error instanceof Error ? error.message : 'Could not delete this session.');
        } finally {
            setDeletingSessionId(null);
        }
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || text.length > 1500 || loading) return;
        const userMsg: Message = { role: 'user', content: text };
        setChatError('');
        const updated = [...messages.slice(-8), userMsg];
        setMessages(updated); setInput(''); setLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST', signal: AbortSignal.timeout(30_000),
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not plan your project. Please try again.');
            const aiMsg: Message = {
                role: 'assistant',
                content: data.message || 'Sorry, I could not process that.',
                suggestions: data.suggestions || [],
            };
            const final = [...updated, aiMsg];
            setMessages(final);
            if (user) await persistSession(final).catch(error => setHistoryError(error instanceof Error ? error.message : 'Could not save chat history.'));
        } catch (error) {
            setInput(text);
            setMessages(messages);
            setChatError(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The request took too long. Your message is ready to retry.');
        } finally { setLoading(false); }
    };

    const handleStartBrief = () => {
        const idea = [...messages].reverse().find(m => m.role === 'user')?.content || '';
        try {
            sessionStorage.setItem('opac-project-draft', idea.slice(0, 3000));
            router.push('/request-project');
        } catch {
            setHistoryError('Your browser could not transfer the brief. Copy your idea and open Request a project.');
        }
    };

    return (
        <main id="main-content" tabIndex={-1} className="bp-manga-page">
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
                        <div aria-hidden="true" className="vert-text" style={{ fontSize: '5rem', letterSpacing: '-18px' }}>構築</div>
                        <div aria-hidden="true" className="action-burst"></div>
                        <div className="speech-bubble comic-dialogue" style={{ maxWidth: '280px', zIndex: 10 }}>
                            <strong>PROJECT PLANNER:</strong> Tell me your idea!
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
                                    Explore the scope of your software or hardware idea
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {messages.length > 0 && (
                                    <button
                                        onClick={handleStartBrief}
                                        className="manga-btn-primary"
                                        style={{ padding: '6px 12px', fontSize: '10px', boxShadow: '-2px 2px 0px #111' }}
                                    >
                                        SEND A PROJECT BRIEF
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
                                            Describe your idea and I will outline an approach before you send a brief to our team.
                                        </p>
                                        <div style={{ position: 'absolute', bottom: '-20px', left: '40px', borderWidth: '20px 20px 0 0', borderStyle: 'solid', borderColor: '#111 transparent transparent transparent' }} />
                                        <div style={{ position: 'absolute', bottom: '-13px', left: '43px', borderWidth: '15px 15px 0 0', borderStyle: 'solid', borderColor: '#fff transparent transparent transparent' }} />
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <ChatMessage key={i} msg={msg} />
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
                                ref={inputRef} aria-label="Your project idea"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                maxLength={1500}
                                onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && sendMessage()}
                                placeholder="Describe your project idea..."
                                disabled={loading}
                                className="chat-input"
                            />
                            <button onClick={sendMessage} disabled={loading || !input.trim()} className="send-btn">
                                SEND
                            </button>
                        </div>
                        {chatError && <p className="chat-error" role="alert">{chatError}</p>}
                        <p style={{ margin: '6px 16px 12px', fontSize: '10px', color: '#555', lineHeight: 1.5 }}>
                            Signed-in chats may be processed by an AI provider when enabled. Avoid sharing passwords or confidential data.
                        </p>
                    </div>

                    {/* SIDEBAR PANEL */}
                    <div className="panel panel-sidebar" style={{ justifyContent: 'flex-start' }}>
                        <div className="sidebar-header">Chat History</div>
                        <div style={{ flex: 1, overflowY: 'auto', borderBottom: '3px solid #111', minHeight: 0 }}>
                            {historyError && <p role="alert" style={{ fontSize: '11px', color: '#a3152d', padding: '10px 14px', margin: 0 }}>{historyError}</p>}
                            {!user && (
                                <p style={{ fontSize: '11px', color: '#555', padding: '12px 14px', lineHeight: 1.6, fontFamily: 'var(--font-space-mono), monospace', fontStyle: 'italic' }}>
                                    <Link href="/login?next=/build-project">Sign in to save sessions.</Link>
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
                                <div className="session-row" key={s.id}>
                                    <button onClick={() => loadSession(s)} className={`session-btn${activeSessionId === s.id ? ' active' : ''}`}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#111', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {s.title}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#888' }}>
                                            {s.createdAt.toLocaleDateString()}
                                        </div>
                                    </button>
                                    <button className="session-delete" type="button" aria-label={`Delete chat ${s.title}`} title="Delete chat" disabled={deletingSessionId === s.id} onClick={() => deleteSession(s.id)}>×</button>
                                </div>
                            ))}
                        </div>

                        <div className="sidebar-header" style={{ background: 'var(--opac-yellow)' }}>Quick Ideas</div>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {PROMPTS.map(prompt => (
                                <button key={prompt} onClick={() => { setInput(prompt); inputRef.current?.focus(); }} className="prompt-btn">
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* INFO PANELS */}
                    <div className="panel panel-half" style={{ backgroundColor: 'var(--opac-yellow)' }}>
                        <div aria-hidden="true" className="vert-text">技術</div>
                        <h2 className="offset-shadow-text" style={{ fontSize: '2rem', marginBottom: '14px' }}>HOW IT WORKS</h2>
                        <p className="comic-dialogue">
                            Describe a software, hardware, or connected project. We will sketch the scope and the steps to bring it to life.
                        </p>
                    </div>

                    <div className="panel panel-half" style={{ backgroundColor: 'var(--opac-pink)' }}>
                        <div aria-hidden="true" className="ink-splat" style={{ width: '80px', height: '80px', top: '-15px', right: '-15px' }}></div>
                        <div aria-hidden="true" className="vert-text">目標</div>
                        <h2 className="offset-shadow-text" style={{ fontSize: '2rem', marginBottom: '14px', position: 'relative', zIndex: 2 }}>POWERED BY AI</h2>
                        <p className="comic-dialogue" style={{ position: 'relative', zIndex: 2 }}>
                            Get a first-pass project plan, then send your brief to our team for a real review and proposal.
                        </p>
                    </div>

                    {/* CTA PANEL */}
                    <div className="panel panel-cta">
                        <h2 className="manga-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', marginBottom: '28px', color: 'var(--opac-accent)' }}>
                            START BUILDING TODAY
                        </h2>
                        <button onClick={handleStartBrief} className="manga-btn" style={{ background: '#fff', color: '#111', boxShadow: '-8px 8px 0px var(--opac-yellow)' }}>
                            SEND YOUR PROJECT BRIEF
                        </button>
                    </div>

                </div>
            </div>
        </main>
    );
}
