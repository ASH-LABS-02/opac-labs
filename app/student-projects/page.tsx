

import Link from 'next/link';

export default function StudentProjectsLandingPage() {


    return (
        <main className="manga-theme-page student-page">
            <style dangerouslySetInnerHTML={{
                __html: `
                .manga-theme-page {
                    font-family: var(--font-space-mono), 'Space Mono', monospace;
                    background-color: var(--opac-paper);
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

                /* Rough paper texture using fast CSS grain tile */
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
                    background: var(--opac-paper);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border: 4px solid #111;
                    /* Slightly irregular borders to look hand-drawn */
                    border-radius: 2px 8px 3px 6px;
                    transition: transform 0.2s ease;
                }

                .panel:hover {
                    transform: scale(1.02);
                    z-index: 50;
                    box-shadow: 12px 12px 0px rgba(0,0,0,1);
                }

                /* Panel Sizes */
                .panel-hero { grid-column: span 12; min-height: 400px; padding: 40px; background-color: var(--opac-blue); }
                .panel-half-l { grid-column: span 7; min-height: 300px; padding: 30px; background-color: var(--opac-yellow); }
                .panel-half-r { grid-column: span 5; min-height: 300px; padding: 30px; background-color: var(--opac-pink); }
                .panel-third { grid-column: span 4; min-height: 250px; padding: 20px; }

                @media (max-width: 900px) {
                    .panel-half-l, .panel-half-r { grid-column: span 12; }
                    .panel-third { grid-column: span 12; }
                }

                /* Massive Typography */
                .massive-text {
                    font-size: clamp(4rem, 10vw, 8rem);
                    line-height: 0.85;
                    letter-spacing: -0.05em;
                    color: var(--opac-paper);
                    text-shadow:
                        4px 4px 0 #111,
                        -2px -2px 0 #111,
                        2px -2px 0 #111,
                        -2px  2px 0 #111,
                        2px  2px 0 #111,
                        8px 8px 0px var(--opac-accent); /* Pop art offset (Electric blue) */
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
                    background: var(--opac-accent);
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

                /* Ink Splatter Overlay */
                .ink-splat {
                    position: absolute;
                    background: #111;
                    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                    filter: url('#roughEdge');
                }
            ` }} />

            {/* SVG Filter for Rough Edges (Ink Bleed effect) */}
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
                        <div className="vert-text" style={{ fontSize: '6rem', letterSpacing: '-20px' }}>学生</div>

                        <div className="action-burst"></div>

                        <div className="speech-bubble comic-dialogue" style={{ maxWidth: '300px', zIndex: 10 }}>
                            <strong>STUDENT PROJECTS:</strong> Let us build your project!
                        </div>

                        <h1 className="massive-text" style={{ position: 'relative', zIndex: 2 }}>
                            NAIL YOUR<br/>FINAL YEAR
                        </h1>

                        <div style={{ marginTop: '40px', position: 'relative', zIndex: 10 }}>
                            <Link href="/request-project" className="manga-btn">
                                REQUEST A PROJECT 🚀
                            </Link>
                        </div>
                    </div>

                    {/* Competency Panel 1 */}
                    <div className="panel panel-half-l">
                        <div className="vert-text">ハードウェア</div>
                        <h2 className="offset-shadow-text" style={{ fontSize: '3rem', marginBottom: '20px' }}>HARDWARE & CIRCUITS</h2>
                        <p className="comic-dialogue">
                            Custom project design based on your idea! We set up the hardware components, physical circuit design, and prototype assembly.
                        </p>
                    </div>

                    {/* Competency Panel 2 */}
                    <div className="panel panel-half-r" style={{ backgroundColor: 'var(--opac-pink)' }}>
                        <div className="ink-splat" style={{ width: '100px', height: '100px', top: '-20px', right: '-20px' }}></div>
                        <div className="vert-text">ソフトウェア</div>
                        <h2 className="offset-shadow-text" style={{ fontSize: '2.5rem', marginBottom: '20px', position: 'relative', zIndex: 2 }}>CODE & REPORTS</h2>
                        <p className="comic-dialogue" style={{ position: 'relative', zIndex: 2 }}>
                            We provide full source code with explanations, plus guidance for your project documentation and reports!
                        </p>
                    </div>

                    {/* CTA Panel */}
                    <div className="panel panel-hero" style={{ backgroundColor: '#111', color: 'var(--opac-paper)', textAlign: 'center', padding: '80px 20px' }}>
                        <h2 className="manga-title" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', marginBottom: '30px', color: 'var(--opac-accent)' }}>GET STARTED TODAY</h2>
                        <Link href="/request-project" className="manga-btn" style={{ background: '#fff', color: '#111', boxShadow: '-8px 8px 0px var(--opac-yellow)' }}>
                            TELL US YOUR IDEA!
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}
