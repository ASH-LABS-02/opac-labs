'use client';

import { useState, FormEvent } from 'react';
import { appCheckHeaders } from '@/lib/firebase';

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '', website: '' });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);
        setFormError('');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST', headers: { 'Content-Type': 'application/json', ...(await appCheckHeaders()) },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not send message');
            setSubmitted(true);
            setFormData({ name: '', email: '', message: '', website: '' });
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Could not send message');
        } finally {
            setSending(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <main className="manga-theme-page contact-page">
            <style dangerouslySetInnerHTML={{ __html: `
                .manga-theme-page {
                    font-family: var(--font-space-mono), 'Space Mono', monospace;
                    background-color: var(--opac-paper);
                    color: #111;
                    min-height: 100vh;
                    overflow-x: hidden;
                    position: relative;
                }

                .manga-theme-page::before {
                    content: '';
                    position: fixed;
                    top: 0; left: 0; width: 100vw; height: 100vh;
                    pointer-events: none;
                    opacity: 0.12;
                    z-index: 100;
                    background-image: radial-gradient(#111 1px, transparent 1px);
                    background-size: 6px 6px;
                }

                .manga-theme-page::after {
                    content: '';
                    position: fixed;
                    top: 0; left: 0; width: 100vw; height: 100vh;
                    pointer-events: none;
                    opacity: 0.25;
                    z-index: 99;
                    background-image: radial-gradient(rgba(0,0,0,0.15) 1px, transparent 0), radial-gradient(rgba(0,0,0,0.08) 1px, transparent 0);
                    background-size: 4px 4px, 7px 7px;
                    background-position: 0 0, 2px 2px;
                }

                .manga-theme-page h1, .manga-theme-page h2, .manga-theme-page h3, .manga-theme-page .manga-title {
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
                    transform: scale(1.02);
                    z-index: 50;
                    box-shadow: 12px 12px 0px rgba(0,0,0,1);
                }

                .panel-hero { grid-column: span 12; min-height: 400px; padding: 40px; background-color: var(--opac-blue); }
                .panel-form { grid-column: span 7; min-height: 400px; padding: 0; background-color: #fff; display: flex; flex-direction: column; }
                .panel-info { grid-column: span 5; min-height: 400px; padding: 0; background-color: var(--opac-yellow); display: flex; flex-direction: column; }
                .panel-third { grid-column: span 4; min-height: 250px; padding: 24px; }
                .panel-cta { grid-column: span 12; min-height: 240px; padding: 60px 20px; background-color: #111; color: var(--opac-paper); text-align: center; }

                @media (max-width: 900px) {
                    .panel-form { grid-column: span 12; }
                    .panel-info { grid-column: span 12; }
                    .panel-third { grid-column: span 12; }
                }

                .massive-text {
                    font-size: clamp(4rem, 10vw, 8rem);
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
                    animation: spinBurst 10s linear infinite;
                    z-index: 0;
                }

                @keyframes spinBurst {
                    100% { transform: rotate(360deg); }
                }

                .speech-bubble {
                    position: relative;
                    background: #fff;
                    border: 4px solid #111;
                    border-radius: 50% / 30%;
                    padding: 20px 30px;
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
                    padding: 16px 32px;
                    background: #111;
                    color: #fff;
                    font-family: var(--font-archivo-black), sans-serif;
                    font-size: 1.5rem;
                    text-transform: uppercase;
                    text-decoration: none;
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

                /* Form panel styles */
                .form-panel-header {
                    border-bottom: 3px solid #111;
                    padding: 16px 24px;
                    background: var(--opac-blue);
                    flex-shrink: 0;
                }

                .form-panel-body {
                    flex: 1;
                    padding: 28px 28px;
                    overflow-y: auto;
                }

                .manga-label {
                    font-family: var(--font-archivo-black), sans-serif;
                    font-size: 0.6rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: #111;
                    margin-bottom: 8px;
                    display: block;
                }

                .manga-input {
                    width: 100%;
                    padding: 10px 14px;
                    border: 3px solid #111;
                    background: #fff;
                    font-size: 13px;
                    font-family: var(--font-space-mono), monospace;
                    outline: none;
                    color: #111;
                    box-shadow: -3px 3px 0px #111;
                    transition: all 0.1s steps(2);
                    box-sizing: border-box;
                }
                .manga-input:focus {
                    box-shadow: -5px 5px 0px var(--opac-accent);
                    border-color: var(--opac-accent);
                }
                .manga-input::placeholder { color: #aaa; font-style: italic; }

                .manga-textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border: 3px solid #111;
                    background: #fff;
                    font-size: 13px;
                    font-family: var(--font-space-mono), monospace;
                    outline: none;
                    color: #111;
                    box-shadow: -3px 3px 0px #111;
                    transition: all 0.1s steps(2);
                    resize: vertical;
                    min-height: 120px;
                    box-sizing: border-box;
                }
                .manga-textarea:focus {
                    box-shadow: -5px 5px 0px var(--opac-accent);
                    border-color: var(--opac-accent);
                }
                .manga-textarea::placeholder { color: #aaa; font-style: italic; }

                .send-form-btn {
                    padding: 14px 28px;
                    background: var(--opac-accent);
                    border: 3px solid #111;
                    color: #fff;
                    font-family: var(--font-archivo-black), sans-serif;
                    font-size: 1rem;
                    text-transform: uppercase;
                    cursor: pointer;
                    box-shadow: -6px 6px 0px #111;
                    transition: all 0.1s steps(2);
                    transform: rotate(-0.5deg);
                    width: 100%;
                }
                .send-form-btn:hover {
                    transform: translate(-3px, 3px) rotate(0deg);
                    box-shadow: -3px 3px 0px #111;
                    background: #8c2040;
                }

                /* Info panel */
                .info-header {
                    border-bottom: 3px solid #111;
                    padding: 16px 18px;
                    background: var(--opac-yellow);
                    font-family: var(--font-archivo-black), sans-serif;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    flex-shrink: 0;
                }

                .info-item {
                    padding: 14px 18px;
                    border-bottom: 2px solid rgba(17,17,17,0.1);
                    display: flex;
                    gap: 14px;
                    align-items: flex-start;
                    transition: background 0.1s;
                }
                .info-item:hover { background: rgba(41,121,255,0.06); }

                .info-icon {
                    width: 36px; height: 36px;
                    background: #111;
                    border: 2px solid #111;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    color: #fff;
                    box-shadow: -3px 3px 0px var(--opac-accent);
                }

                .hours-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 18px;
                    border-bottom: 2px solid rgba(17,17,17,0.08);
                    font-size: 12px;
                }
            ` }} />

            {/* SVG Filter for Rough Edges */}
            <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                <filter id="roughEdge">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </svg>

            <div className="comic-container">
                <div className="comic-grid">

                    {/* ── HERO PANEL ── */}
                    <div className="panel panel-hero" style={{ overflow: 'visible' }}>
                        <div aria-hidden="true" className="vert-text" style={{ fontSize: '6rem', letterSpacing: '-20px' }}>連絡</div>
                        <div aria-hidden="true" className="action-burst"></div>

                        <div className="speech-bubble comic-dialogue" style={{ maxWidth: '300px', zIndex: 10 }}>
                            <strong>HEY!</strong> Got a question? A project idea? We are just a message away!
                        </div>

                        <h1 className="massive-text" style={{ position: 'relative', zIndex: 2 }}>
                            GET IN<br />TOUCH
                        </h1>

                        <p style={{ marginTop: '20px', fontSize: '14px', color: '#333', maxWidth: '420px', lineHeight: 1.7, position: 'relative', zIndex: 2, fontFamily: 'var(--font-kalam), cursive' }}>
                            Have a software idea, hardware challenge, or student project? Tell us what you want to build.
                        </p>
                    </div>

                    {/* ── FORM PANEL ── */}
                    <div className="panel panel-form" style={{ justifyContent: 'flex-start' }}>
                        <div className="form-panel-header">
                            <h2 style={{ fontFamily: 'var(--font-archivo-black), sans-serif', fontSize: '1rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                ★ SEND A MESSAGE
                            </h2>
                            <p style={{ fontSize: '10px', color: '#555', margin: '4px 0 0', fontFamily: 'var(--font-space-mono), monospace' }}>
                                Fill the form below and we will get back to you
                            </p>
                        </div>

                        <div className="form-panel-body">
                            {submitted ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', textAlign: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: 70, height: 70,
                                        background: 'var(--opac-accent)',
                                        border: '4px solid #111',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '-6px 6px 0px #111',
                                        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                                        color: '#fff',
                                    }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <div style={{ position: 'relative', background: '#fff', border: '4px solid #111', borderRadius: '50% / 30%', padding: '16px 24px', boxShadow: '6px 6px 0px #111', transform: 'rotate(-1deg)' }}>
                                        <p style={{ fontSize: '16px', fontWeight: '900', color: '#111', margin: '0 0 4px', fontFamily: 'var(--font-archivo-black), sans-serif', textTransform: 'uppercase' }}>
                                            MESSAGE SENT!
                                        </p>
                                        <p className="comic-dialogue" style={{ fontSize: '13px', color: '#333', margin: 0 }}>
                                            We&apos;ll get back to you soon!
                                        </p>
                                        <div style={{ position: 'absolute', bottom: '-20px', left: '40px', borderWidth: '20px 20px 0 0', borderStyle: 'solid', borderColor: '#111 transparent transparent transparent' }} />
                                        <div style={{ position: 'absolute', bottom: '-13px', left: '43px', borderWidth: '15px 15px 0 0', borderStyle: 'solid', borderColor: '#fff transparent transparent transparent' }} />
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
                                        <label htmlFor="contact-website">Website</label>
                                        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
                                    </div>
                                    <div className="contact-fields-row">
                                        <div>
                                            <label className="manga-label">Your Name</label>
                                            <input
                                                type="text" name="name"
                                                value={formData.name} onChange={handleChange}
                                                required placeholder="Enter your name"
                                                className="manga-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="manga-label">Email</label>
                                            <input
                                                type="email" name="email"
                                                value={formData.email} onChange={handleChange}
                                                required placeholder="your@email.com"
                                                className="manga-input"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="manga-label">Message</label>
                                        <textarea
                                            name="message" rows={5}
                                            value={formData.message} onChange={handleChange}
                                            required placeholder="How can we help you?"
                                            className="manga-textarea"
                                        />
                                    </div>
                                    {formError && <p role="alert" style={{ color: '#a11d3a', margin: 0 }}>{formError}</p>}
                                    <button type="submit" className="send-form-btn" disabled={sending}>
                                        {sending ? 'SENDING...' : 'SEND MESSAGE ⚡'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* ── INFO SIDEBAR PANEL ── */}
                    <div className="panel panel-info" style={{ justifyContent: 'flex-start' }}>
                        <div className="info-header">◆ CONTACT INFO</div>

                        <div>
                            <div className="info-item">
                                <div className="info-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#111', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'var(--font-archivo-black), sans-serif', marginBottom: '4px' }}>WhatsApp</div>
                                    <a href="https://wa.me/917867089886" style={{ fontSize: '13px', color: 'var(--opac-accent)', fontWeight: '700', textDecoration: 'none', fontFamily: 'var(--font-space-mono), monospace' }}>
                                        +91 78670 89886
                                    </a>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#111', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'var(--font-archivo-black), sans-serif', marginBottom: '4px' }}>Email</div>
                                    <a href="mailto:opac.labs@gmail.com" style={{ fontSize: '13px', color: 'var(--opac-accent)', fontWeight: '700', textDecoration: 'none', fontFamily: 'var(--font-space-mono), monospace' }}>
                                        opac.labs@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#111', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'var(--font-archivo-black), sans-serif', marginBottom: '4px' }}>Location</div>
                                    <span style={{ fontSize: '13px', color: '#333', fontWeight: '700', fontFamily: 'var(--font-space-mono), monospace' }}>
                                        Tamil Nadu, India
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="info-header" style={{ background: 'var(--opac-yellow)', marginTop: 'auto' }}>★ BUSINESS HOURS</div>
                        <div>
                            {[
                                { day: 'Mon – Fri', time: '9:00 AM – 6:00 PM', active: true },
                                { day: 'Saturday', time: '10:00 AM – 4:00 PM', active: true },
                                { day: 'Sunday', time: 'Closed', active: false },
                            ].map(({ day, time, active }) => (
                                <div key={day} className="hours-row">
                                    <span style={{ color: '#555', fontFamily: 'var(--font-space-mono), monospace' }}>{day}</span>
                                    <span style={{
                                        color: active ? '#111' : '#aaa',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-archivo-black), sans-serif',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                    }}>{time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── INFO PANELS (bottom row) ── */}
                    <div className="panel panel-third" style={{ backgroundColor: 'var(--opac-yellow)' }}>
                        <div aria-hidden="true" className="vert-text">速い</div>
                        <h2 className="offset-shadow-text" style={{ fontSize: '1.8rem', marginBottom: '14px' }}>FAST RESPONSE</h2>
                        <p className="comic-dialogue">
                            We will review your message and get back to you. For a direct conversation, message us on WhatsApp.
                        </p>
                    </div>

                    <div className="panel panel-third" style={{ backgroundColor: 'var(--opac-pink)' }}>
                        <div aria-hidden="true" className="ink-splat" style={{ width: '80px', height: '80px', top: '-15px', right: '-15px' }}></div>
                        <div aria-hidden="true" className="vert-text">支援</div>
                        <h2 className="offset-shadow-text" style={{ fontSize: '1.8rem', marginBottom: '14px', position: 'relative', zIndex: 2 }}>CUSTOM PROJECTS</h2>
                        <p className="comic-dialogue" style={{ position: 'relative', zIndex: 2 }}>
                            Need a web app, connected device, automation workflow, or complete prototype? Share your brief.
                        </p>
                    </div>

                    <div className="panel panel-third" style={{ backgroundColor: 'var(--opac-green)' }}>
                        <div aria-hidden="true" className="vert-text">学生</div>
                        <h2 className="offset-shadow-text" style={{ fontSize: '1.8rem', marginBottom: '14px' }}>STUDENT HELP</h2>
                        <p className="comic-dialogue">
                            Working on a final year project? We can help with software, hardware, integration, and documentation.
                        </p>
                    </div>

                    {/* ── CTA PANEL ── */}
                    <div className="panel panel-cta">
                        <h2 className="manga-title" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', marginBottom: '30px', color: 'var(--opac-accent)' }}>
                            LET&apos;S BUILD TOGETHER
                        </h2>
                        <a href="https://wa.me/917867089886" className="manga-btn" style={{ background: '#fff', color: '#111', boxShadow: '-8px 8px 0px var(--opac-yellow)', textDecoration: 'none' }}>
                            WHATSAPP US NOW!
                        </a>
                    </div>

                </div>
            </div>
        </main>
    );
}
