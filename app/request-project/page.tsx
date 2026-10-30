'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { clearProjectBriefDraft, readProjectBriefDraft, saveProjectBriefDraft, type ProjectBriefFields } from '@/lib/projectRequestDraft';

const steps = [
    { n: '01', title: 'Submit Your Idea', desc: 'Fill out the form with your project details, budget, and timeline.' },
    { n: '02', title: 'We Review & Plan', desc: 'Our engineers analyse your requirements and prepare a detailed proposal.' },
    { n: '03', title: 'Build & Deliver', desc: 'We build, test, and hand over your project with full documentation.' },
];

const features = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
        label: 'Built to Your Brief',
        desc: 'We scope the work around your goals and timeline.',
        color: 'var(--opac-blue)' // soft blue
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
        ),
        label: 'Software + Hardware',
        desc: 'One team for code, electronics, and integration.',
        color: 'var(--opac-green)' // soft green
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        label: 'Thoughtful Review',
        desc: 'We review each brief before suggesting next steps.',
        color: 'var(--opac-yellow)' // soft yellow
    },
];

export default function RequestProject() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState<ProjectBriefFields>({
        name: '', email: '', phone: '', projectType: '', description: '', budget: '', timeline: '', website: '',
    });
    const [draftReady, setDraftReady] = useState(false);
    const [draftRestored, setDraftRestored] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [whatsappUrl, setWhatsappUrl] = useState('');
    const [reference, setReference] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const saved = readProjectBriefDraft();
        let idea = params.get('idea');
        let plannerIdea: string | null = null;
        try {
            plannerIdea = sessionStorage.getItem('opac-project-draft');
            sessionStorage.removeItem('opac-project-draft');
            idea = idea || plannerIdea;
        } catch { /* Query-prefilled public examples still work without storage. */ }
        const projectType = params.get('projectType');
        const allowedTypes = ['software', 'erp', 'crm', 'hardware', 'hybrid', 'iot', 'robotics', 'automation', 'embedded', 'custom'];
        const newIdea = !!plannerIdea || saved?.source !== window.location.search;
        setFormData(previous => {
            const restored = { ...previous, ...saved?.fields };
            return {
                ...restored,
                description: idea && newIdea ? idea.slice(0, 3000) : restored.description || idea?.slice(0, 3000) || '',
                projectType: allowedTypes.includes(projectType || '') && newIdea ? projectType! : restored.projectType,
            };
        });
        setDraftRestored(!!saved);
        setDraftReady(true);
    }, []);

    useEffect(() => {
        if (draftReady && user) setFormData(previous => ({
            ...previous,
            name: previous.name || user.displayName || '',
            email: previous.email || user.email || '',
        }));
    }, [user, draftReady]);

    useEffect(() => {
        if (draftReady && !isSubmitted) saveProjectBriefDraft(formData);
    }, [formData, draftReady, isSubmitted]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function continueToSignIn() {
        if (!saveProjectBriefDraft(formData)) {
            setError('Your browser is blocking draft storage. Allow storage for this site before signing in so your brief can be kept.');
            return;
        }
        router.push('/login?next=/request-project');
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isSubmitting || authLoading || !draftReady) return;
        if (!user) { continueToSignIn(); return; }
        setIsSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/request-project', {
                method: 'POST', signal: AbortSignal.timeout(30_000),
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.status === 401 && data.code === 'SIGN_IN_REQUIRED') { continueToSignIn(); return; }
            if (!res.ok) throw new Error(data.error || 'Failed to submit');
            setWhatsappUrl(data.whatsappUrl || '');
            setReference(data.requestId || '');
            setIsSubmitted(true);
            clearProjectBriefDraft();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSubmitted) {
        return (
            <main id="main-content" tabIndex={-1} className="manga-theme-page">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .manga-theme-page {
                        font-family: var(--font-space-mono), 'Space Mono', monospace;
                        background-color: #f3e5f5;
                        color: #111;
                        min-height: 80vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .success-card {
                        background: #ffffff;
                        border: 6px solid #111;
                        box-sizing: border-box;
                        width: calc(100% - 32px);
                        padding: clamp(24px, 6vw, 48px);
                        max-width: 500px;
                        text-align: center;
                        box-shadow: 12px 12px 0px rgba(0,0,0,1);
                        border-radius: 4px;
                    }
                    .manga-btn {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #111;
                        color: #fff;
                        font-family: var(--font-archivo-black), 'Archivo Black', sans-serif;
                        text-transform: uppercase;
                        text-decoration: none;
                        border: 4px solid #111;
                        box-shadow: -6px 6px 0px #d500f9, -6px 6px 0px 4px #111;
                        cursor: pointer;
                    }
                    .success-actions { display: grid; gap: 20px; margin-top: 32px; }
                    .success-actions p { margin: 0; }
                    .success-actions .manga-btn {
                        box-sizing: border-box;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 58px;
                        width: 100%;
                    }
                    `
                }} />
                <div className="success-card">
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--opac-green)', border: '4px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '36px', fontWeight: 'bold' }}>✓</div>
                    <h1 style={{ fontFamily: "var(--font-archivo-black), 'Archivo Black'", fontSize: '28px', textTransform: 'uppercase', marginBottom: '12px' }}>Request Sent!</h1>
                    <p style={{ fontFamily: "var(--font-kalam), 'Kalam'", fontSize: '1.2rem', lineHeight: 1.4, marginBottom: '24px' }}>Your project brief is saved with our team. We will review the scope and contact you soon.</p>
                    {reference && <p style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: '0.9rem' }}>Reference: {reference.slice(0, 8).toUpperCase()}</p>}
                    <div className="success-actions">
                        <Link href="/my-projects" className="manga-btn">Track my request ↗</Link>
                        {whatsappUrl && <p><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="manga-btn">Continue on WhatsApp ↗</a></p>}
                        <button onClick={() => router.push('/our-works')} className="manga-btn">Explore our work ↗</button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main id="main-content" tabIndex={-1} className="manga-theme-page request-page">
            <style dangerouslySetInnerHTML={{
                __html: `
                .manga-theme-page {
                    font-family: var(--font-space-mono), 'Space Mono', monospace;
                    background-color: #f3e5f5;
                    color: #111;
                    min-height: 100vh;
                    overflow-x: hidden;
                    position: relative;
                }

                /* Halftone pattern overlay */
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

                /* Rough paper texture */
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
                    font-size: 1.2rem;
                    line-height: 1.4;
                }

                /* Container */
                .comic-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    position: relative;
                    z-index: 10;
                }

                /* Grid Layout for Panels */
                .comic-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    grid-auto-rows: minmax(150px, auto);
                    gap: 16px;
                    background: #111; /* Black gutters */
                    padding: 16px;
                    border: 8px solid #111;
                }

                .panel {
                    background: #f3e5f5;
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

                /* Panel Sizes */
                .panel-hero { grid-column: span 12; min-height: 350px; padding: 40px; background-color: var(--opac-pink); }
                .panel-half-l { grid-column: span 5; min-height: 300px; padding: 30px; background-color: var(--opac-yellow); }
                .panel-half-r { grid-column: span 7; min-height: 300px; padding: 30px; background-color: #ffffff; }
                .panel-third { grid-column: span 4; min-height: 150px; padding: 20px; }

                @media (max-width: 900px) {
                    .panel-half-l, .panel-half-r { grid-column: span 12; }
                    .panel-third { grid-column: span 12; }
                }

                /* Massive Typography */
                .massive-text {
                    font-size: clamp(3.5rem, 8vw, 6.5rem);
                    line-height: 0.85;
                    letter-spacing: -0.05em;
                    color: #f3e5f5;
                    text-shadow:
                        4px 4px 0 #111,
                        -2px -2px 0 #111,
                        2px -2px 0 #111,
                        -2px  2px 0 #111,
                        2px  2px 0 #111,
                        8px 8px 0px #d500f9; /* Pop art offset (Electric purple) */
                }

                .offset-shadow-text {
                    color: #111;
                    text-shadow: -4px 4px 0px #fff, -5px 5px 0px #111;
                }

                /* Action Burst Graphic */
                .action-burst {
                    position: absolute;
                    top: -50px; right: -50px;
                    width: 200px; height: 200px;
                    background: #d500f9;
                    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
                    animation: spinBurst 10s linear infinite;
                    z-index: 0;
                }

                @keyframes spinBurst {
                    100% { transform: rotate(360deg); }
                }

                /* Speech Bubble */
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
                    bottom: -20px;
                    left: 40px;
                    border-width: 20px 20px 0 0;
                    border-style: solid;
                    border-color: #111 transparent transparent transparent;
                }
                .speech-bubble::after {
                    content: '';
                    position: absolute;
                    bottom: -13px;
                    left: 43px;
                    border-width: 15px 15px 0 0;
                    border-style: solid;
                    border-color: #fff transparent transparent transparent;
                }

                /* Manga Buttons */
                .manga-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px 32px;
                    background: #111;
                    color: #fff;
                    font-family: var(--font-archivo-black), sans-serif;
                    font-size: 1.3rem;
                    text-transform: uppercase;
                    text-decoration: none;
                    border: 4px solid #111;
                    box-shadow: -8px 8px 0px #d500f9, -8px 8px 0px 4px #111;
                    cursor: pointer;
                    transition: all 0.1s steps(2);
                }

                .manga-btn:hover {
                    transform: translate(-4px, 4px) rotate(0deg);
                    box-shadow: -4px 4px 0px #d500f9, -4px 4px 0px 4px #111;
                    background: #fff;
                    color: #111;
                }

                .manga-btn:active {
                    transform: translate(-8px, 8px) rotate(1deg);
                    box-shadow: 0px 0px 0px #d500f9;
                }

                /* Japanese vertical text */
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

                /* Form fields with comic styling */
                .manga-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .manga-form-group label {
                    font-family: var(--font-archivo-black), sans-serif;
                    font-size: 0.95rem;
                    text-transform: uppercase;
                    color: #111;
                    margin-left: 2px;
                }

                .manga-form-group input,
                .manga-form-group select,
                .manga-form-group textarea {
                    font-family: var(--font-space-mono), monospace;
                    font-size: 0.95rem;
                    padding: 12px 16px;
                    background: #ffffff;
                    border: 3px solid #111;
                    border-radius: 4px;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .manga-form-group input:focus,
                .manga-form-group select:focus,
                .manga-form-group textarea:focus {
                    border-color: #d500f9;
                    box-shadow: 4px 4px 0px #111;
                    background: #faf6fc;
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

                    {/* Hero Panel */}
                    <div className="panel panel-hero" style={{ overflow: 'visible' }}>
                        <div aria-hidden="true" className="vert-text" style={{ fontSize: '5rem', letterSpacing: '-15px' }}>計画</div>
                        <div aria-hidden="true" className="action-burst"></div>

                        <div className="speech-bubble comic-dialogue" style={{ maxWidth: '300px', zIndex: 10 }}>
                            <strong>OPAC BUILDER:</strong> Let&apos;s plan your project!
                        </div>

                        <h1 className="massive-text" style={{ position: 'relative', zIndex: 2 }}>
                            YOUR IDEA.<br />BUILT TO WORK.
                        </h1>
                    </div>

                    {/* Features Row */}
                    {features.map(f => (
                        <div key={f.label} className="panel panel-third" style={{ backgroundColor: f.color, padding: '24px' }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ padding: '6px', borderRadius: '8px', background: '#ffffff', border: '2px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {f.icon}
                                </span>
                                <h3 className="manga-title" style={{ fontSize: '1.1rem', margin: 0 }}>{f.label}</h3>
                            </div>
                            <p className="comic-dialogue" style={{ fontSize: '0.95rem', margin: 0 }}>{f.desc}</p>
                        </div>
                    ))}

                    {/* Left Panel: How It Works */}
                    <div className="panel panel-half-l" style={{ justifyContent: 'flex-start' }}>
                        <div aria-hidden="true" className="vert-text">方法</div>
                        <h2 className="offset-shadow-text" style={{ fontSize: '2.4rem', marginBottom: '24px' }}>HOW IT WORKS</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 2 }}>
                            {steps.map((s, i) => (
                                <div key={s.n} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                                    {i < steps.length - 1 && (
                                        <div style={{ position: 'absolute', left: 19, top: 40, width: 3, height: 'calc(100% - 4px)', background: '#111' }} />
                                    )}
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: '#111', border: '3px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: '#fff', zIndex: 1 }}>
                                        {s.n}
                                    </div>
                                    <div style={{ paddingBottom: '16px' }}>
                                        <div className="manga-title" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{s.title}</div>
                                        <p className="comic-dialogue" style={{ fontSize: '1rem', margin: 0 }}>{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Testimonial card */}
                        <div style={{ marginTop: '24px', padding: '20px', background: '#ffffff', border: '4px solid #111', borderRadius: '4px', position: 'relative', zIndex: 2, boxShadow: '6px 6px 0px #111' }}>
                            <p className="comic-dialogue" style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '12px' }}>
                                Software, hardware, or both: tell us the outcome you need and we will plan the right build with you.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--opac-pink)', border: '2px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                                    R
                                </div>
                                <div>
                                    <div className="manga-title" style={{ fontSize: '0.9rem' }}>OPAC LABS</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>Project studio</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Request Form */}
                    <div className="panel panel-half-r" style={{ justifyContent: 'flex-start', padding: '40px' }}>
                        <h2 className="offset-shadow-text" style={{ fontSize: '2.4rem', marginBottom: '8px' }}>SUBMIT REQUEST</h2>
                        <p className="comic-dialogue" style={{ fontSize: '1.05rem', color: '#666', marginBottom: '32px' }}>
                            Tell us what you want to make. We will review your brief and get back to you.
                        </p>

                        <form method="post" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
                                    <label htmlFor="request-website">Website</label>
                                    <input id="request-website" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
                                </div>
                                {error && <p role="alert" style={{ color: '#a11d3a', fontWeight: 700 }}>{error}</p>}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    <div className="manga-form-group">
                                        <label htmlFor="request-name">Your Name</label>
                                        <input id="request-name" type="text" name="name" autoComplete="name" minLength={2} maxLength={120} value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                                    </div>
                                    <div className="manga-form-group">
                                        <label htmlFor="request-email">Email</label>
                                        <input id="request-email" type="email" name="email" autoComplete="email" maxLength={254} value={formData.email} onChange={handleChange} placeholder="you@email.com" required />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    <div className="manga-form-group">
                                        <label htmlFor="request-phone">Phone Number</label>
                                        <input id="request-phone" type="tel" name="phone" autoComplete="tel" minLength={7} maxLength={30} value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
                                    </div>
                                    <div className="manga-form-group">
                                        <label htmlFor="request-type">Project Type</label>
                                        <select id="request-type" name="projectType" value={formData.projectType} onChange={handleChange} required>
                                            <option value="">Select type</option>
                                            <option value="software">Software project</option>
                                            <option value="erp">ERP system</option>
                                            <option value="crm">CRM system</option>
                                            <option value="hardware">Hardware project</option>
                                            <option value="hybrid">Software + hardware</option>
                                            <option value="iot">IoT &amp; Smart Devices</option>
                                            <option value="robotics">Robotics</option>
                                            <option value="automation">Home Automation</option>
                                            <option value="embedded">Embedded Systems</option>
                                            <option value="custom">Custom Project</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="manga-form-group">
                                    <label htmlFor="request-description">Project Description</label>
                                    <textarea id="request-description" name="description" minLength={15} maxLength={3000} value={formData.description} onChange={handleChange} rows={4} placeholder="Describe what you want to build..." required style={{ resize: 'vertical' }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    <div className="manga-form-group">
                                        <label htmlFor="request-budget">Target Budget</label>
                                        <select id="request-budget" name="budget" value={formData.budget} onChange={handleChange} required>
                                            <option value="">Select range</option>
                                            <option value="not-sure">Not sure yet</option>
                                            <option value="under-5k">Under ₹5,000</option>
                                            <option value="5k-10k">₹5,000 – ₹10,000</option>
                                            <option value="10k-20k">₹10,000 – ₹20,000</option>
                                            <option value="20k-plus">₹20,000+</option>
                                        </select>
                                    </div>
                                    <div className="manga-form-group">
                                        <label htmlFor="request-timeline">Timeline</label>
                                        <select id="request-timeline" name="timeline" value={formData.timeline} onChange={handleChange} required>
                                            <option value="">Select timeline</option>
                                            <option value="1-week">1 Week</option>
                                            <option value="2-weeks">2 Weeks</option>
                                            <option value="1-month">1 Month</option>
                                            <option value="flexible">Flexible</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p role="status" className="comic-dialogue" style={{ fontSize: '0.95rem', margin: '0 0 8px' }}>
                                        {authLoading ? 'Checking your sign-in…' : !user ? 'Sign in before sending. Your filled-in brief will be kept while you sign in.' : draftRestored ? 'Your brief is restored. Review the details, then send it to our team.' : 'Your request will be linked to your account so you can track it in My projects.'}
                                    </p>
                                    <button
                                        type="submit"
                                        formNoValidate={!user}
                                        disabled={isSubmitting || authLoading || !draftReady}
                                        className="manga-btn"
                                        style={{ background: isSubmitting ? '#aaa' : '#111', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isSubmitting ? 'Submitting...' : authLoading ? 'Checking sign-in…' : user ? 'Send Project Brief 🚀' : 'Sign in to send brief ↗'}
                                    </button>
                                    <p className="comic-dialogue" style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center', margin: 0 }}>
                                        After you send, our team receives your brief. WhatsApp follow-up is optional.
                                    </p>
                                </div>
                            </form>
                    </div>

                </div>
            </div>
        </main>
    );
}
