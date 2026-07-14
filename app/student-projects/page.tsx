'use client';

import { useRouter } from 'next/navigation';

export default function StudentProjects() {
    const router = useRouter();

    return (
        <main>
            <section className="container">
                <h1 className="page-title">Student Projects</h1>
                <h2 className="project-main-question">Let us build your project</h2>
                <div style={{ maxWidth: '560px', margin: '0 auto 80px' }}>
                    <div className="project-option-card">
                        <div className="project-option-icon">
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="2" y="2" width="20" height="8" rx="2"/>
                                <rect x="2" y="14" width="20" height="8" rx="2"/>
                                <line x1="6" y1="6" x2="6.01" y2="6"/>
                                <line x1="6" y1="18" x2="6.01" y2="18"/>
                            </svg>
                        </div>
                        <h2 className="project-option-title">Let OPAC Labs Build Your Project</h2>
                        <p className="project-option-description">Tell us your project idea and requirements. Our team will help design and build a working electronics or IoT project.</p>
                        <div className="project-includes-label">Includes:</div>
                        <ul className="project-option-features">
                            <li>Custom project design based on your idea</li>
                            <li>Hardware components and circuit setup</li>
                            <li>Source code and explanation</li>
                            <li>Project documentation and report guidance</li>
                        </ul>
                        <button className="project-option-btn" onClick={() => router.push('/request-project')}>
                            Request a Project
                        </button>
                        <p className="project-option-note">Perfect for final year and semester projects.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
