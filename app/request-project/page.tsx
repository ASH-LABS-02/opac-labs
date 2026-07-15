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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
        ),
        label: 'Fast Turnaround',
        desc: 'Most projects delivered in 1–4 weeks.'
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
        ),
        label: 'Expert Engineers',
        desc: 'Experienced in IoT & embedded systems.'
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        ),
        label: '24h Response',
        desc: 'We reply to requests within 1 day.'
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
                body: JSON.stringify(formData),
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
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                <div style={{ textAlign: 'center', maxWidth: '480px' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '36px' }}>✓</div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>Request Sent!</h1>
                    <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.7, marginBottom: '32px' }}>Your project details have been sent to our team via WhatsApp. We will get back to you within 24 hours.</p>
                    <button onClick={() => router.push('/student-projects')} className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>Back to Projects</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes float-slow {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes float-reverse {
                    0% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(-30px, 30px) scale(1.05); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .hero-grid-bg {
                    background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0);
                    background-size: 24px 24px;
                }
                .glow-blob-1 {
                    animation: float-slow 16s ease-in-out infinite;
                }
                .glow-blob-2 {
                    animation: float-reverse 20s ease-in-out infinite;
                }
                .feature-card {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .feature-card:hover {
                    transform: translateY(-5px);
                    border-color: #1a1a1a !important;
                    box-shadow: 0 16px 36px rgba(0,0,0,0.06);
                }
            `}</style>

            <div style={{ background: '#ffffff', padding: '80px 24px 64px', textAlign: 'center', position: 'relative', borderBottom: '1px solid #e5e5e5' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: '20px', background: '#f5f5f5', border: '1px solid #e5e5e5', color: '#1a1a1a', fontSize: '11px', fontWeight: '700', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '24px' }}>Custom Project Service</div>
                    <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#1a1a1a', marginBottom: '18px', letterSpacing: '-1px', lineHeight: 1.15 }}>Build Your Dream Project</h1>
                    <p style={{ fontSize: '16px', color: '#666666', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8, fontWeight: '400' }}>From IoT devices to robotics — tell us what you need and our engineers will make it happen.</p>
                </div>
            </div>

            <div style={{ background: '#fafafa', padding: '56px 24px 100px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '56px' }}>
                        {features.map(f => (
                            <div key={f.label} className="feature-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)' }}>
                                <span style={{ flexShrink: 0, padding: '10px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>{f.icon}</span>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>{f.label}</div>
                                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.5fr)', gap: '48px', alignItems: 'start' }}>
                        <div>
                            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>How It Works</h2>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '32px', lineHeight: 1.7 }}>Getting your custom project built is simple. Just follow these three steps.</p>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {steps.map((s, i) => (
                                    <div key={s.n} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                                        {i < steps.length - 1 && <div style={{ position: 'absolute', left: 19, top: 44, width: 2, height: 'calc(100% - 8px)', background: 'linear-gradient(to bottom, #d4af37, transparent)' }} />}
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: '#0f172a', border: '2px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#d4af37', zIndex: 1 }}>{s.n}</div>
                                        <div style={{ paddingBottom: '32px' }}>
                                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' }}>{s.title}</div>
                                            <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '24px', background: '#0f172a', borderRadius: '12px', borderLeft: '4px solid #d4af37' }}>
                                <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '16px', fontStyle: 'italic' }}>&quot;OPAC Labs built our smart irrigation system in under 3 weeks. The quality and support were outstanding.&quot;</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>R</div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Rahul M.</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Engineering Student, VIT</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' }}>Submit Your Request</h2>
                            <p style={{ fontSize: '13px', color: '#888', marginBottom: '28px' }}>All fields are required. We will respond within 24 hours via WhatsApp.</p>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>Checking authentication...</div>
                            ) : !user ? (
                                <div style={{ textAlign: 'center', padding: '32px 0', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Authentication Required</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Please sign in to your account to submit a project request.</p>
                                    <button onClick={() => { localStorage.setItem('redirectAfterLogin', '/request-project'); router.push('/login'); }} style={{ padding: '12px 32px', background: '#0f172a', color: '#ffffff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none' }}>
                                        Sign In to Continue
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Your Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" required />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Phone Number</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
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
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Project Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe what you want to build..." required style={{ resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Budget Range</label>
                                        <select name="budget" value={formData.budget} onChange={handleChange} required>
                                            <option value="">Select range</option>
                                            <option value="under-5k">Under ₹5,000</option>
                                            <option value="5k-10k">₹5,000 – ₹10,000</option>
                                            <option value="10k-20k">₹10,000 – ₹20,000</option>
                                            <option value="20k-plus">₹20,000+</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
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
                                <button type="submit" disabled={isSubmitting} style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 32px', borderRadius: '8px', background: isSubmitting ? '#aaa' : '#25d366', border: 'none', color: '#ffffff', fontSize: '15px', fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                                    {isSubmitting ? 'Submitting...' : 'Send via WhatsApp'}
                                </button>
                                <p style={{ fontSize: '12px', color: '#aaa', textAlign: 'center' }}>This will open WhatsApp with your project details pre-filled.</p>
                            </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
