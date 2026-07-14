'use client';

import { useState, FormEvent } from 'react';

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 4000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <main>
            {/* Dark hero */}
            <div style={{ background: '#111', padding: '80px 24px 72px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '20px' }}>
                        Contact
                    </p>
                    <h1 style={{ fontSize: '48px', fontWeight: '500', color: '#ffffff', lineHeight: '1.15', maxWidth: '520px', marginBottom: '20px' }}>
                        Let&apos;s talk about your project
                    </h1>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.7', maxWidth: '440px' }}>
                        Whether it&apos;s a product question, a custom order, or a student project — we&apos;re happy to help.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 24px 120px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '80px', alignItems: 'start' }}>

                    {/* Left */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            {[
                                {
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                                        </svg>
                                    ),
                                    label: 'WhatsApp',
                                    value: '+91 78670 89886',
                                    href: 'https://wa.me/917867089886'
                                },
                                {
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                    ),
                                    label: 'Email',
                                    value: 'opac.labs@gmail.com',
                                    href: 'mailto:opac.labs@gmail.com'
                                },
                                {
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                            <circle cx="12" cy="10" r="3"/>
                                        </svg>
                                    ),
                                    label: 'Location',
                                    value: 'Tamil Nadu, India',
                                    href: null
                                }
                            ].map(({ icon, label, value, href }) => (
                                <div key={label} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '40px', height: '40px',
                                        background: '#f5f5f5',
                                        borderRadius: '10px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, color: '#333'
                                    }}>
                                        {icon}
                                    </div>
                                    <div style={{ paddingTop: '2px' }}>
                                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', fontWeight: '500' }}>{label}</div>
                                        {href ? (
                                            <a href={href} style={{ fontSize: '15px', color: '#111', fontWeight: '500', textDecoration: 'none', transition: 'color 0.15s' }}
                                                onMouseOver={e => (e.currentTarget.style.color = '#666')}
                                                onMouseOut={e => (e.currentTarget.style.color = '#111')}>
                                                {value}
                                            </a>
                                        ) : (
                                            <span style={{ fontSize: '15px', color: '#111', fontWeight: '500' }}>{value}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Hours */}
                        <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '36px' }}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '20px' }}>
                                Business Hours
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { day: 'Mon – Fri', time: '9:00 AM – 6:00 PM' },
                                    { day: 'Saturday', time: '10:00 AM – 4:00 PM' },
                                    { day: 'Sunday', time: 'Closed' },
                                ].map(({ day, time }) => (
                                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
                                        <span style={{ color: '#666' }}>{day}</span>
                                        <span style={{ color: time === 'Closed' ? '#bbb' : '#111', fontWeight: '500' }}>{time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right — form */}
                    <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', padding: '48px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '32px' }}>
                            Send a Message
                        </p>

                        {submitted ? (
                            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                <div style={{
                                    width: '56px', height: '56px',
                                    background: '#111', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 20px', color: '#fff'
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>Message sent</p>
                                <p style={{ fontSize: '14px', color: '#666' }}>We&apos;ll get back to you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label htmlFor="name">Name</label>
                                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label htmlFor="email">Email</label>
                                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label htmlFor="message">Message</label>
                                    <textarea id="message" name="message" rows={6} value={formData.message} onChange={handleChange} required placeholder="How can we help you?" />
                                </div>
                                <button type="submit" className="btn-primary">Send Message</button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
