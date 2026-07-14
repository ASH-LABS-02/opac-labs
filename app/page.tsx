'use client';

import { useRouter } from 'next/navigation';

export default function AnimatedLandingPage() {
    const router = useRouter();

    const featuredProjects = [
        {
            title: 'IoT Smart Agriculture Platform',
            scope: 'Hardware + Next.js Web Dashboard + Firebase Database',
            description: 'Automated irrigation and soil analytics. Senses microclimate metrics and controls solenoid valves, logging all telemetry to a live web portal.',
            tech: ['ESP32', 'Firebase', 'Next.js', 'DHT11 Sensor', 'Solenoid Valves'],
        },
        {
            title: 'Autonomous Rover & Controller App',
            scope: 'Hardware + Android/iOS Bluetooth Controller Interface',
            description: 'Self-navigating robotic rover with 180° active ultrasonic scanning, paired with a custom mobile dashboard for manual override and path tracking.',
            tech: ['Arduino UNO', 'Bluetooth Module', 'HC-SR04 Sensor', 'L298N Driver', 'React Native App'],
        },
    ];

    const competencies = [
        { icon: '💻', title: 'Software & Apps', desc: 'Next.js web dashboards, custom mobile control apps, REST APIs, and database sync.' },
        { icon: '🔌', title: 'Hardware & PCBs', desc: 'Schematics, component selection, physical circuit design, and prototype assembly.' },
        { icon: '🧠', title: 'AIoT & Intelligence', desc: 'Edge AI inference, sensor fusion algorithms, and cloud analytics pipelines.' },
        { icon: '⚙️', title: 'Optimized Firmware', desc: 'Low-level C/C++ scripts for Arduino, ESP32, STM32, and Raspberry Pi Pico.' },
    ];

    const pastProjectsList = [
        { name: 'RFID Cloud Attendance System', tech: 'ESP8266 + Next.js + MySQL', type: 'Full-Stack IoT' },
        { name: 'Edge AI Object-Detecting Rover', tech: 'Raspberry Pi + OpenCV + Python', type: 'Computer Vision' },
        { name: 'Smart Home Control Panel', tech: 'STM32 + Bluetooth App + Relays', type: 'Embedded Automation' },
        { name: 'Solar Grid Charger & Dashboard', tech: 'Arduino + ThingSpeak Cloud + LDR', type: 'Green Tech IoT' }
    ];

    return (
        <main style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', paddingBottom: '80px', position: 'relative', overflow: 'hidden' }} className="animate-page">
            {/* Inline CSS for Animations & Hover states */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slideUpFade {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes gridMotion {
                    0% { background-position: 0 0; }
                    100% { background-position: 28px 56px; }
                }
                @keyframes wanderGlow {
                    0% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(120px, 60px) scale(1.1); }
                    100% { transform: translate(-60px, 120px) scale(0.9); }
                }
                .animate-page {
                    animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .bg-grid-animated {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px);
                    background-size: 28px 28px;
                    animation: gridMotion 35s linear infinite;
                    pointer-events: none;
                    z-index: 0;
                }
                .ambient-glow-animated {
                    position: absolute;
                    top: 80px;
                    left: 15%;
                    width: 550px;
                    height: 550px;
                    background: radial-gradient(circle, rgba(235, 235, 235, 0.5) 0%, rgba(255, 255, 255, 0) 70%);
                    border-radius: 50%;
                    filter: blur(60px);
                    pointer-events: none;
                    animation: wanderGlow 22s ease-in-out infinite alternate;
                    z-index: 0;
                }
                .hover-card {
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-card:hover {
                    transform: translateY(-6px);
                    border-color: #111111 !important;
                    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.06);
                }
                .hover-btn {
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-btn:hover {
                    background: #333333 !important;
                    border-color: #333333 !important;
                    transform: translateY(-1px) scale(1.01);
                }
                .hover-btn-outline {
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-btn-outline:hover {
                    border-color: #111111 !important;
                    background: #fdfdfd !important;
                    transform: translateY(-1px) scale(1.01);
                }
                .hover-row {
                    transition: background 0.2s ease;
                }
                .hover-row:hover {
                    background: #fafafa !important;
                }
                .content-overlay {
                    position: relative;
                    z-index: 1;
                }
            ` }} />

            {/* Animated Background Layers */}
            <div className="bg-grid-animated"></div>
            <div className="ambient-glow-animated"></div>

            <div className="content-overlay">
                {/* Hero Section */}
                <section style={{ padding: '96px 24px 72px', borderBottom: '1px solid #e5e5e5', textAlign: 'center' }}>
                    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ 
                            display: 'inline-block', 
                            padding: '5px 12px', 
                            border: '1px solid #1a1a1a', 
                            fontSize: '10px', 
                            fontWeight: '700', 
                            textTransform: 'uppercase', 
                            letterSpacing: '2px', 
                            marginBottom: '24px',
                            background: '#ffffff'
                        }}>
                            OPAC LABS
                        </div>
                        <h1 style={{ 
                            fontSize: '48px', 
                            fontWeight: '800', 
                            lineHeight: '1.1', 
                            letterSpacing: '-1.5px', 
                            color: '#111111', 
                            marginBottom: '16px' 
                        }}>
                            Hardware, Software & AIoT.<br />Complete Integrated Systems.
                        </h1>
                        <p style={{ 
                            fontSize: '15px', 
                            lineHeight: '1.6', 
                            color: '#666666', 
                            maxWidth: '540px', 
                            margin: '0 auto 36px' 
                        }}>
                            We bridge the hardware-software gap. From initial circuit layouts to cloud dashboards, mobile controllers, and AI edge analytics.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button 
                                onClick={() => router.push('/request-project')}
                                className="hover-btn"
                                style={{ 
                                    padding: '11px 24px', 
                                    background: '#111111', 
                                    color: '#ffffff', 
                                    border: '1px solid #111111', 
                                    fontSize: '13px', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                }}
                            >
                                Request a Project
                            </button>
                            <button 
                                onClick={() => router.push('/build-project')}
                                className="hover-btn-outline"
                                style={{ 
                                    padding: '11px 24px', 
                                    background: '#ffffff', 
                                    color: '#1a1a1a', 
                                    border: '1px solid #e5e5e5', 
                                    fontSize: '13px', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                }}
                            >
                                AI Project Planner
                            </button>
                        </div>
                    </div>
                </section>

                {/* Core Description Grid */}
                <section style={{ padding: '64px 24px', background: 'rgba(250, 250, 250, 0.85)', backdropFilter: 'blur(2px)', borderBottom: '1px solid #e5e5e5' }}>
                    <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.8px', margin: 0 }}>Full-Stack Competency</h2>
                            <p style={{ fontSize: '13px', color: '#666666', marginTop: '6px' }}>Every layer of the project handled, from silicon to screen.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            {competencies.map((comp, idx) => (
                                <div key={idx} className="hover-card" style={{ background: '#ffffff', padding: '24px', border: '1px solid #e5e5e5' }}>
                                    <div style={{ fontSize: '20px', marginBottom: '12px' }}>{comp.icon}</div>
                                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{comp.title}</h3>
                                    <p style={{ fontSize: '12px', color: '#666666', lineHeight: '1.5' }}>{comp.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Showcase */}
                <section style={{ padding: '64px 24px', borderBottom: '1px solid #e5e5e5' }}>
                    <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.8px', margin: 0 }}>Previous Showcases</h2>
                            <p style={{ fontSize: '13px', color: '#666666', marginTop: '6px' }}>Highlights of end-to-end projects built by OPAC Labs.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
                            {featuredProjects.map((proj, idx) => (
                                <div key={idx} className="hover-card" style={{ border: '1px solid #e5e5e5', padding: '28px', background: '#ffffff' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                            {proj.scope}
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#111111' }}>
                                            {proj.title}
                                        </h3>
                                        <p style={{ fontSize: '13px', color: '#555555', lineHeight: '1.6', marginBottom: '20px' }}>
                                            {proj.description}
                                        </p>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {proj.tech.map((t, tIdx) => (
                                                <span key={tIdx} style={{ fontSize: '10px', background: '#f2f2f2', color: '#333333', padding: '3px 8px', borderRadius: '2px', fontWeight: '500' }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Other Builds Table */}
                <section style={{ padding: '64px 24px', background: 'rgba(250, 250, 250, 0.85)', backdropFilter: 'blur(2px)', borderBottom: '1px solid #e5e5e5' }}>
                    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.6px', margin: 0 }}>Completed Prototypes</h2>
                            <p style={{ fontSize: '13px', color: '#666666', marginTop: '4px' }}>Proven records of integrated builds for engineering systems.</p>
                        </div>

                        <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', background: '#ffffff' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #e5e5e5' }}>
                                        <th style={{ padding: '12px 16px', fontWeight: '700', color: '#111111' }}>Project Name</th>
                                        <th style={{ padding: '12px 16px', fontWeight: '700', color: '#111111' }}>Core Stack</th>
                                        <th style={{ padding: '12px 16px', fontWeight: '700', color: '#111111' }}>Project Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastProjectsList.map((p, idx) => (
                                        <tr key={idx} className="hover-row" style={{ borderBottom: idx === pastProjectsList.length - 1 ? 'none' : '1px solid #e5e5e5', background: '#ffffff' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111111' }}>{p.name}</td>
                                            <td style={{ padding: '12px 16px', color: '#666666', fontFamily: 'monospace' }}>{p.tech}</td>
                                            <td style={{ padding: '12px 16px', color: '#555555' }}>
                                                <span style={{ fontSize: '10px', border: '1px solid #e5e5e5', padding: '2px 6px', borderRadius: '2px', background: '#fafafa' }}>
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

                {/* CTA */}
                <section style={{ padding: '64px 24px', textAlign: 'center' }}>
                    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.8px' }}>
                            Let&apos;s Build Your Full-Stack System
                        </h2>
                        <p style={{ fontSize: '13px', color: '#666666', lineHeight: '1.6', marginBottom: '24px' }}>
                            Connect with our engineering lab to draft details, source modules, code components, and build your complete IoT prototype.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button 
                                onClick={() => router.push('/request-project')}
                                className="hover-btn"
                                style={{ 
                                    padding: '12px 28px', 
                                    background: '#111111', 
                                    color: '#ffffff', 
                                    border: 'none', 
                                    fontSize: '13px', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                }}
                            >
                                Request Custom Build
                            </button>
                            <button 
                                onClick={() => router.push('/student-projects')}
                                className="hover-btn-outline"
                                style={{ 
                                    padding: '12px 28px', 
                                    background: '#ffffff', 
                                    color: '#1a1a1a', 
                                    border: '1px solid #111111', 
                                    fontSize: '13px', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                }}
                            >
                                Browse Ideas
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
