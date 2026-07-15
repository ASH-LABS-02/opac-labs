'use client';

import { useRouter } from 'next/navigation';
import { WorldMap } from '@/components/WorldMap';
import { useEffect, useState } from 'react';

export default function AnimatedLandingPage() {
    const router = useRouter();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const featuredProjects = [
        {
            title: 'IoT Smart Agriculture Platform',
            scope: 'Hardware + Next.js + Firebase',
            description: 'Automated irrigation and soil analytics. Senses microclimate metrics and controls solenoid valves, logging all telemetry to a live web portal.',
            tech: ['ESP32', 'Firebase', 'Next.js', 'DHT11 Sensor', 'Solenoid Valves'],
            color: '#00f0ff'
        },
        {
            title: 'Autonomous Rover & Controller App',
            scope: 'Hardware + Mobile Dashboard',
            description: 'Self-navigating robotic rover with 180° active ultrasonic scanning, paired with a custom mobile dashboard for manual override and path tracking.',
            tech: ['Arduino UNO', 'Bluetooth', 'HC-SR04', 'L298N', 'React Native'],
            color: '#7000ff'
        },
    ];

    const competencies = [
        { icon: '💻', title: 'Software & Cloud', desc: 'Next.js web dashboards, custom mobile control apps, REST APIs, and seamless real-time database synchronization.' },
        { icon: '🔌', title: 'Hardware & PCBs', desc: 'Schematics, component selection, physical circuit design, and prototype assembly tailored to custom specs.' },
        { icon: '🧠', title: 'AIoT & Intelligence', desc: 'Edge AI inference, sensor fusion algorithms, and advanced cloud analytics pipelines for predictive modeling.' },
        { icon: '⚙️', title: 'Optimized Firmware', desc: 'Low-level C/C++ scripts for microcontrollers including Arduino, ESP32, STM32, and Raspberry Pi Pico.' },
    ];

    const pastProjectsList = [
        { name: 'RFID Cloud Attendance System', tech: 'ESP8266 + Next.js + MySQL', type: 'Full-Stack IoT', status: 'Deployed' },
        { name: 'Edge AI Object-Detecting Rover', tech: 'Raspberry Pi + OpenCV + Python', type: 'Computer Vision', status: 'Prototype' },
        { name: 'Smart Home Control Panel', tech: 'STM32 + Bluetooth App + Relays', type: 'Embedded Automation', status: 'Active' },
        { name: 'Solar Grid Charger & Dashboard', tech: 'Arduino + ThingSpeak Cloud + LDR', type: 'Green Tech IoT', status: 'Testing' }
    ];

    return (
        <main 
            style={{ 
                minHeight: '100vh', 
                background: '#030305', 
                color: '#e2e8f0', 
                paddingBottom: '80px', 
                position: 'relative', 
                overflow: 'hidden',
                fontFamily: "'Inter', sans-serif"
            }} 
            className="dark-theme-page"
        >
            {/* Interactive Spotlight following Mouse */}
            <div 
                className="spotlight"
                style={{
                    background: `radial-gradient(circle 600px at ${mousePos.x}px ${mousePos.y}px, rgba(112, 0, 255, 0.15), transparent 80%)`
                }}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&family=Inter:wght@400;500;600&display=swap');
                
                .dark-theme-page {
                    font-family: 'Inter', sans-serif;
                }
                
                h1, h2, h3, h4, .brand-font {
                    font-family: 'Outfit', sans-serif;
                }

                ::selection {
                    background: rgba(0, 240, 255, 0.3);
                    color: #fff;
                }

                .spotlight {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    pointer-events: none;
                    z-index: 0;
                    transition: background 0.15s ease;
                }

                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(40px); filter: blur(10px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }

                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); border-color: rgba(0, 240, 255, 0.3); }
                    50% { box-shadow: 0 0 30px rgba(0, 240, 255, 0.5); border-color: rgba(0, 240, 255, 0.6); }
                    100% { box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); border-color: rgba(0, 240, 255, 0.3); }
                }
                
                @keyframes gridMotion {
                    0% { background-position: 0 0; }
                    100% { background-position: 40px 40px; }
                }

                .bg-grid-cyber {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    animation: gridMotion 20s linear infinite;
                    pointer-events: none;
                    z-index: 0;
                    mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
                    -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
                }

                .stagger-1 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
                .stagger-2 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
                .stagger-3 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
                .stagger-4 { animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }

                /* Glassmorphism Classes */
                .glass-card {
                    background: rgba(20, 20, 25, 0.6);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    overflow: hidden;
                }

                .glass-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }

                .glass-card:hover {
                    transform: translateY(-8px) scale(1.01);
                    border-color: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(112, 0, 255, 0.1);
                }
                
                .glass-card:hover::before {
                    opacity: 1;
                }

                /* Modern Buttons */
                .btn-neon {
                    position: relative;
                    padding: 14px 32px;
                    background: transparent;
                    color: #fff;
                    font-family: 'Outfit', sans-serif;
                    font-weight: 600;
                    font-size: 14px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    border: 1px solid rgba(0, 240, 255, 0.5);
                    border-radius: 8px;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
                }

                .btn-neon::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.2), transparent);
                    transition: all 0.4s ease;
                }

                .btn-neon:hover {
                    animation: pulseGlow 2s infinite;
                    background: rgba(0, 240, 255, 0.05);
                    transform: translateY(-2px);
                }

                .btn-neon:hover::before {
                    left: 100%;
                }

                .btn-glass {
                    padding: 14px 32px;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    color: #e2e8f0;
                    font-family: 'Outfit', sans-serif;
                    font-weight: 600;
                    font-size: 14px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-glass:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                    color: #fff;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #ffffff 0%, #a0a5b0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .gradient-text-accent {
                    background: linear-gradient(135deg, #00f0ff 0%, #7000ff 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .bento-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                }

                .tech-badge {
                    font-size: 11px;
                    font-weight: 600;
                    padding: 6px 12px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                    transition: all 0.3s ease;
                    font-family: 'Outfit', sans-serif;
                    letter-spacing: 0.5px;
                }

                .tech-badge:hover {
                    background: rgba(0, 240, 255, 0.1);
                    border-color: rgba(0, 240, 255, 0.3);
                    color: #00f0ff;
                }

                .table-row-glass {
                    transition: all 0.2s ease;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .table-row-glass:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
            ` }} />

            <div className="bg-grid-cyber"></div>

            <div style={{ position: 'relative', zIndex: 10 }}>
                {/* Hero Section */}
                <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '120px 24px 60px' }}>
                    
                    {/* World Map Background layer */}
                    <div style={{ position: 'absolute', top: '10%', left: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.3, pointerEvents: 'none', filter: 'hue-rotate(180deg) brightness(1.5)' }}>
                        <WorldMap dots={[
                            { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: 34.0522, lng: -118.2437 } },
                            { start: { lat: 34.0522, lng: -118.2437 }, end: { lat: -15.7975, lng: -47.8919 } },
                            { start: { lat: -15.7975, lng: -47.8919 }, end: { lat: 38.7223, lng: -9.1393 } },
                            { start: { lat: 38.7223, lng: -9.1393 }, end: { lat: 51.5074, lng: -0.1278 } },
                            { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 28.6139, lng: 77.2090 } },
                            { start: { lat: 28.6139, lng: 77.2090 }, end: { lat: 43.1598, lng: 12.6921 } },
                        ]} />
                    </div>

                    <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
                        <div className="stagger-1" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 16px',
                            borderRadius: '30px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            marginBottom: '32px'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }}></div>
                            <span className="brand-font" style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#e2e8f0' }}>
                                OPAC Labs System Intelligence
                            </span>
                        </div>

                        <h1 className="stagger-2" style={{
                            fontSize: 'clamp(40px, 6vw, 72px)',
                            fontWeight: '900',
                            lineHeight: '1.05',
                            letterSpacing: '-2px',
                            marginBottom: '24px'
                        }}>
                            <span className="gradient-text">Hardware, Software & AIoT.</span><br />
                            <span className="gradient-text-accent">Architecting the Future.</span>
                        </h1>
                        
                        <p className="stagger-3" style={{
                            fontSize: '18px',
                            lineHeight: '1.7',
                            color: '#94a3b8',
                            maxWidth: '640px',
                            margin: '0 auto 48px',
                            fontWeight: '400'
                        }}>
                            We bridge the physical-digital divide. From custom silicon layouts and embedded firmware to real-time cloud dashboards and edge AI analytics.
                        </p>
                        
                        <div className="stagger-4" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => router.push('/request-project')} className="btn-neon">
                                Initiate Project
                            </button>
                            <button onClick={() => router.push('/build-project')} className="btn-glass">
                                AI Architecture Planner
                            </button>
                        </div>
                    </div>
                </section>

                {/* Competency Bento Grid */}
                <section style={{ padding: '80px 24px', position: 'relative' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '56px', textAlign: 'center' }}>
                            <h2 className="gradient-text" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px' }}>Full-Stack Competency</h2>
                            <p style={{ fontSize: '16px', color: '#94a3b8' }}>Mastery across every layer—from silicon to screen.</p>
                        </div>
                        
                        <div className="bento-grid">
                            {competencies.map((comp, idx) => (
                                <div key={idx} className="glass-card" style={{ padding: '36px' }}>
                                    <div style={{ 
                                        width: '56px', height: '56px', borderRadius: '12px', 
                                        background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '28px', marginBottom: '24px'
                                    }}>
                                        {comp.icon}
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#f8fafc' }}>{comp.title}</h3>
                                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.7' }}>{comp.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Showcases */}
                <section style={{ padding: '80px 24px', position: 'relative' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '56px' }}>
                            <h2 className="gradient-text" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px' }}>System Prototypes</h2>
                            <p style={{ fontSize: '16px', color: '#94a3b8' }}>End-to-end architectures engineered by OPAC Labs.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                            {featuredProjects.map((proj, idx) => (
                                <div key={idx} className="glass-card" style={{ padding: '40px' }}>
                                    <div style={{ 
                                        display: 'inline-block', fontSize: '10px', fontWeight: '800', 
                                        color: proj.color, textTransform: 'uppercase', letterSpacing: '1px', 
                                        marginBottom: '16px', borderBottom: \`1px solid \${proj.color}40\`, paddingBottom: '4px'
                                    }}>
                                        {proj.scope}
                                    </div>
                                    <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: '#f8fafc', lineHeight: '1.2' }}>
                                        {proj.title}
                                    </h3>
                                    <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '32px' }}>
                                        {proj.description}
                                    </p>
                                    
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {proj.tech.map((t, tIdx) => (
                                            <span key={tIdx} className="tech-badge">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Technical Index Table */}
                <section style={{ padding: '80px 24px', position: 'relative' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '40px' }}>
                            <h2 className="gradient-text" style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', margin: 0 }}>Archive & Logs</h2>
                        </div>

                        <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '20px 24px', fontWeight: '600', color: '#e2e8f0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Outfit', sans-serif" }}>Nomenclature</th>
                                        <th style={{ padding: '20px 24px', fontWeight: '600', color: '#e2e8f0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Outfit', sans-serif" }}>Tech Stack</th>
                                        <th style={{ padding: '20px 24px', fontWeight: '600', color: '#e2e8f0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Outfit', sans-serif" }}>Domain</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastProjectsList.map((p, idx) => (
                                        <tr key={idx} className="table-row-glass">
                                            <td style={{ padding: '20px 24px', fontWeight: '600', color: '#f8fafc', fontSize: '15px' }}>{p.name}</td>
                                            <td style={{ padding: '20px 24px', color: '#00f0ff', fontFamily: 'monospace', fontSize: '13px' }}>{p.tech}</td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{ 
                                                    fontSize: '11px', fontWeight: '600', padding: '4px 10px', 
                                                    borderRadius: '4px', background: 'rgba(255,255,255,0.05)', 
                                                    color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
                                                    textTransform: 'uppercase', letterSpacing: '0.5px'
                                                }}>
                                                    {p.type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Footer CTA */}
                <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative' }}>
                    <div style={{ 
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(112, 0, 255, 0.2) 0%, transparent 70%)',
                        filter: 'blur(40px)', zIndex: -1, pointerEvents: 'none'
                    }}></div>
                    
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 className="gradient-text" style={{ fontSize: '40px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1px' }}>
                            Deploy Your Vision
                        </h2>
                        <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '40px' }}>
                            Engage our engineering lab to draft specifications, source hardware, architect firmware, and deploy your complete system logic.
                        </p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => router.push('/request-project')} className="btn-neon" style={{ padding: '16px 40px', fontSize: '15px' }}>
                                Request Build
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
