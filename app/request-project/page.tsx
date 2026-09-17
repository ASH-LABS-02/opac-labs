'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

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
        label: 'Fast Turnaround',
        desc: 'Most projects delivered in 1–4 weeks.',
        color: 'var(--opac-blue)' // soft blue
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
        ),
        label: 'Expert Engineers',
        desc: 'Experienced in IoT & embedded systems.',
        color: 'var(--opac-green)' // soft green
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        label: '24h Response',
        desc: 'We reply to requests within 1 day.',
        color: 'var(--opac-yellow)' // soft yellow
    },
];

type FormFields = {
    name: string; email: string; phone: string;
    projectType: string; description: string; budget: string; timeline: string;
};

export default function RequestProject() {
    const router = useRouter();
    const { user, loading } = useFirebaseAuth();
    const [formData, setFormData] = useState<FormFields>({
        name: '', email: '', phone: '', projectType: '', description: '', budget: '', timeline: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/request-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, userId: user?.uid }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit');
            window.open(data.whatsappUrl, '_blank');
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            alert('Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSubmitted) {
        return (
            <main className="manga-theme-page">
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
                        padding: 48px;
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
                    `
                }} />
                <div className="success-card">
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--opac-green)', border: '4px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '36px', fontWeight: 'bold' }}>✓</div>
                    <h1 style={{ fontFamily: "var(--font-archivo-black), 'Archivo Black'", fontSize: '28px', textTransform: 'uppercase', marginBottom: '12px' }}>Request Sent!</h1>
                    <p style={{ fontFamily: "var(--font-kalam), 'Kalam'", fontSize: '1.2rem', lineHeight: 1.4, marginBottom: '32px' }}>Your project details have been sent to our team via WhatsApp. We will get back to you within 24 hours.</p>
                    <button onClick={() => router.push('/student-projects')} className="manga-btn">
                        Back to Projects 🚀
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="manga-theme-page request-page">
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
                        <div className="vert-text" style={{ fontSize: '5rem', letterSpacing: '-15px' }}>計画</div>
                        <div className="action-burst"></div>

                        <div className="speech-bubble comic-dialogue" style={{ maxWidth: '300px', zIndex: 10 }}>
                            <strong>OPAC BUILDER:</strong> Let&apos;s build your custom device!
                        </div>

                        <h1 className="massive-text" style={{ position: 'relative', zIndex: 2 }}>
                            BUILD YOUR<br />DREAM PROJECT
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
                        <div className="vert-text">方法</div>
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
                            <p className="comic-dialogue" style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '12px', fontStyle: 'italic' }}>
                                &quot;OPAC Labs built our smart irrigation system in under 3 weeks. The quality and support were outstanding.&quot;
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--opac-pink)', border: '2px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                                    R
                                </div>
                                <div>
                                    <div className="manga-title" style={{ fontSize: '0.9rem' }}>Rahul M.</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>Engineering Student, VIT</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Request Form */}
                    <div className="panel panel-half-r" style={{ justifyContent: 'flex-start', padding: '40px' }}>
                        <h2 className="offset-shadow-text" style={{ fontSize: '2.4rem', marginBottom: '8px' }}>SUBMIT REQUEST</h2>
                        <p className="comic-dialogue" style={{ fontSize: '1.05rem', color: '#666', marginBottom: '32px' }}>
                            All fields are required. We will respond within 24 hours via WhatsApp.
                        </p>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font-space-mono), monospace', fontWeight: 'bold' }}>
                                Checking authentication...
                            </div>
                        ) : !user ? (
                            <div style={{ textAlign: 'center', padding: '32px 24px', background: '#fce4ec', border: '4px solid #111', borderRadius: '4px', boxShadow: '6px 6px 0px #111' }}>
                                <h3 className="manga-title" style={{ fontSize: '1.4rem', color: '#111', marginBottom: '8px' }}>
                                    AUTHENTICATION REQUIRED
                                </h3>
                                <p className="comic-dialogue" style={{ fontSize: '1.1rem', color: '#333', marginBottom: '24px' }}>
                                    Please sign in to submit a custom project request form.
                                </p>
                                <button
                                    onClick={() => { localStorage.setItem('redirectAfterLogin', '/request-project'); router.push('/login'); }}
                                    className="manga-btn"
                                >
                                    Sign In to Continue 🚀
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    <div className="manga-form-group">
                                        <label>Your Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                                    </div>
                                    <div className="manga-form-group">
                                        <label>Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" required />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    <div className="manga-form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
                                    </div>
                                    <div className="manga-form-group">
                                        <label>Project Type</label>
                                        <select name="projectType" value={formData.projectType} onChange={handleChange} required>
                                            <option value="">Select type</option>
                                            <option value="iot">IoT &amp; Smart Devices</option>
                                            <option value="robotics">Robotics</option>
                                            <option value="automation">Home Automation</option>
                                            <option value="embedded">Embedded Systems</option>
                                            <option value="custom">Custom Project</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="manga-form-group">
                                    <label>Project Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe what you want to build..." required style={{ resize: 'vertical' }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    <div className="manga-form-group">
                                        <label>Budget Range</label>
                                        <select name="budget" value={formData.budget} onChange={handleChange} required>
                                            <option value="">Select range</option>
                                            <option value="under-5k">Under ₹5,000</option>
                                            <option value="5k-10k">₹5,000 – ₹10,000</option>
                                            <option value="10k-20k">₹10,000 – ₹20,000</option>
                                            <option value="20k-plus">₹20,000+</option>
                                        </select>
                                    </div>
                                    <div className="manga-form-group">
                                        <label>Timeline</label>
                                        <select name="timeline" value={formData.timeline} onChange={handleChange} required>
                                            <option value="">Select timeline</option>
                                            <option value="1-week">1 Week</option>
                                            <option value="2-weeks">2 Weeks</option>
                                            <option value="1-month">1 Month</option>
                                            <option value="flexible">Flexible</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="manga-btn"
                                        style={{ background: isSubmitting ? '#aaa' : '#111', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Send via WhatsApp 🚀'}
                                    </button>
                                    <p className="comic-dialogue" style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center', margin: 0 }}>
                                        This will open WhatsApp with your project details pre-filled.
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
