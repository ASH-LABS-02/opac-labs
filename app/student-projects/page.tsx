import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ProjectExplorer, BuildJourney, SupportPicker } from '@/components/StudentProjectLab';
import styles from './student.module.css';

export const metadata: Metadata = {
    title: 'Student Projects — OPAC Labs',
    description: 'Explore hardware, software, robotics, and IoT project ideas. Plan a custom build with OPAC Labs, from your first brief to a documented demo.',
};

function Arrow() {
    return <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>;
}

export default function StudentProjectsLandingPage() {
    return (
        <main id="main-content" tabIndex={-1} className={styles.page}>
            <div className={styles.container}>
                <section className={styles.hero} aria-labelledby="student-title">
                    <div className={styles.heroCopy}>
                        <span className={styles.japanese} aria-hidden="true">学生</span>
                        <h1 id="student-title">Big ideas.<br />Real builds.</h1>
                        <p>Hardware, software, and everything in between. Build a project you can demo, understand, and make your own.</p>
                        <div className={styles.actions}>
                            <a href="#project-lab" className={styles.button}>Find my project <Arrow /></a>
                            <Link href="/request-project" className={styles.textLink}>I already have an idea</Link>
                        </div>
                    </div>
                    <Link href="/our-works" className={styles.heroArt} aria-label="Explore our work, including the robotic vacuum">
                        <div className={styles.imageFrame}>
                            <Image src="/projects/robotic-vacuum.webp" alt="OPAC's robotic vacuum and red dock, illustrated in a colourful manga courtyard" fill priority sizes="(max-width: 700px) 100vw, 45vw" />
                            <span className={styles.star} aria-hidden="true">✦</span>
                        </div>
                        <span className={styles.imageCaption}>Made at OPAC / Robotic vacuum <Arrow /></span>
                    </Link>
                </section>
                <div className={styles.disciplines} aria-label="Project services">Hardware <span>/</span> Software <span>/</span> IoT <span>/</span> Documentation</div>
                <section id="project-lab" className={styles.lab} aria-labelledby="lab-title">
                    <h2 id="lab-title">Find your next build.</h2>
                    <p className={styles.intro}>A starting point for your own project. Pick an idea to see what it could become.</p>
                    <ProjectExplorer />
                </section>
                <section className={styles.journey} aria-labelledby="journey-title">
                    <h2 id="journey-title">From what if<br />to it works.</h2>
                    <p className={styles.intro}>A clear path from your first sketch to a working demo.</p>
                    <BuildJourney />
                </section>
                <section className={styles.helpGrid} aria-label="Plan your support and find answers">
                    <SupportPicker />
                    <div className={styles.faq}>
                        <h2>Good questions.</h2>
                        <details open><summary>Can I bring my own idea?</summary><p>Yes. Share your idea, requirements, and what you already have. We will work out the next steps together.</p></details>
                        <details><summary>What will I receive?</summary><p>We agree on the deliverables in your brief. These can include a working prototype or application, source code, setup instructions, documentation, and a walkthrough of how it works.</p></details>
                        <details><summary>How are cost and timelines decided?</summary><p>They depend on your scope, hardware needs, current progress, and deadline. We confirm the estimate and schedule with you before work starts. Share your course requirements so the build fits your submission rules.</p></details>
                    </div>
                </section>
                <section className={styles.cta} aria-labelledby="student-cta">
                    <span aria-hidden="true" className={styles.ctaJapanese}>未来</span>
                    <h2 id="student-cta">Get started today</h2>
                    <p>See what we have made. Then let us build what is next.</p>
                    <div className={styles.actions}>
                        <Link href="/our-works" className={styles.button}>Explore our works <Arrow /></Link>
                        <Link href="/contact" className={styles.textLink}>Talk to the team</Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
