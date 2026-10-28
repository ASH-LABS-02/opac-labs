import Link from 'next/link';
import Image from 'next/image';
import { Anton } from 'next/font/google';
import CircuitSketch from '@/components/CircuitSketch';
import styles from './home.module.css';

const bannerFont = Anton({ weight: '400', subsets: ['latin'], variable: '--font-banner', display: 'swap', preload: false });

const capabilities = [
    ['Software & cloud', 'Next.js dashboards, mobile apps, APIs, and real-time data.'],
    ['Hardware & IoT', 'Microcontrollers, sensors, and connected systems.'],
    ['AI & automation', 'Intelligent tools that connect your software and hardware.'],
];

export default function Home() {
    return (
        <main id="main-content" className={styles.home}>
            <section className={styles.hero} aria-labelledby="hero-title">
                <div className={styles.heroCopy}>
                    <h1 id="hero-title">Architect<br />the <span>future.</span></h1>
                    <p>Custom software, hardware, and connected projects.<br />We design and build around your idea.</p>
                    <div className={styles.actions}>
                        <Link href="/request-project" className={styles.button}>Start a project <span aria-hidden="true">↗</span></Link>
                        <Link href="/projects" className={styles.textLink}>Explore our work <span aria-hidden="true">→</span></Link>
                    </div>
                </div>
                <CircuitSketch />
            </section>
            <div className={styles.disciplines} aria-label="Our disciplines">
                <span><b aria-hidden="true">{'</>'}</b> Software</span>
                <span><b aria-hidden="true">▦</b> Hardware</span>
                <span><b aria-hidden="true">◎</b> AIoT</span>
            </div>
            <section className={styles.section} aria-labelledby="capabilities-title">
                <h2 id="capabilities-title">From idea to<br />real-world impact.</h2>
                <div className={styles.capabilities}>
                    {capabilities.map(([title, description], index) => (
                        <div key={title}>
                            <span className={styles.number}>0{index + 1}</span>
                            <h3>{title}</h3><p>{description}</p>
                        </div>
                    ))}
                </div>
            </section>
            <section className={`${styles.section} ${styles.prototypes}`} aria-labelledby="prototypes-title">
                <div className={styles.sectionHeading}>
                    <h2 id="prototypes-title">Built at OPAC.</h2>
                    <Link href="/projects" className={styles.textLink}>Explore our work <span aria-hidden="true">→</span></Link>
                </div>
                <article className={styles.featuredWork}>
                    <Link href="/projects#robotic-vacuum" className={styles.featuredImageLink} aria-label="Explore the smart robotic vacuum project">
                        <Image src="/projects/robotic-vacuum.webp" alt="Our robotic vacuum, brought to life in a colorful comic-style scene." width={1672} height={941} sizes="(max-width: 850px) calc(100vw - 44px), (max-width: 1440px) 60vw, 820px" />
                    </Link>
                    <div className={styles.featuredCopy}>
                        <span>ROBOTICS + IOT</span>
                        <h3>Small robot.<br />Big clean.</h3>
                        <p>Meet our smart robotic vacuum. Sensors, autonomous navigation, and connected control—all in one real-world build.</p>
                        <Link href="/projects#robotic-vacuum" className={styles.textLink}>Inside the build <span aria-hidden="true">↗</span></Link>
                    </div>
                </article>
            </section>
            <section id="start-project" className={`${styles.cta} ${bannerFont.variable}`} aria-labelledby="cta-title">
                <h2 id="cta-title">Your next project<br />starts here.</h2>
                <div className={styles.ctaActions}>
                    <Link href="/build-project" className={styles.button}>Plan with OPAC AI <span aria-hidden="true">→</span></Link>
                    <Link href="/request-project" className={styles.textLink}>Have a brief? Request a project</Link>
                </div>
                <div className={styles.ctaArt}>
                    <Image src="/manga-cta.webp" alt="A smiling manga character says: Ideas today, a brighter tomorrow!" fill sizes="(max-width: 700px) 100vw, 29vw" />
                </div>
            </section>
        </main>
    );
}
