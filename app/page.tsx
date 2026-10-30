import Link from 'next/link';
import Image from 'next/image';
import { Anton } from 'next/font/google';
import CircuitSketch from '@/components/CircuitSketch';
import styles from './home.module.css';

const bannerFont = Anton({ weight: '400', subsets: ['latin'], variable: '--font-banner', display: 'swap', preload: false });
const portfolioRequest = `/request-project?projectType=software&idea=${encodeURIComponent('I would like a custom portfolio website for my work. I have my own ideas for the visual direction and would like to discuss them with OPAC Labs.')}`;

const capabilities = [
    ['Software & cloud', 'Next.js dashboards, mobile apps, APIs, and real-time data.'],
    ['Hardware & IoT', 'Microcontrollers, sensors, and connected systems.'],
    ['AI & automation', 'Intelligent tools that connect your software and hardware.'],
];

export default function Home() {
    return (
        <main id="main-content" tabIndex={-1} className={styles.home}>
            <section className={styles.hero} aria-labelledby="hero-title">
                <div className={styles.heroCopy}>
                    <h1 id="hero-title">Architect<br />the <span>future.</span></h1>
                    <p>Custom software, hardware, and connected projects.<br />We design and build around your idea.</p>
                    <div className={styles.actions}>
                        <Link href="/request-project" className={styles.button}>Start a project <span aria-hidden="true">↗</span></Link>
                        <Link href="/our-works/portfolio-websites" className={styles.textLink}>Explore portfolio websites <span aria-hidden="true">→</span></Link>
                    </div>
                </div>
                <CircuitSketch />
            </section>
            <div className={styles.disciplines} aria-label="Our disciplines">
                <span><b aria-hidden="true">{'</>'}</b> Software</span>
                <span><b aria-hidden="true">▦</b> Hardware</span>
                <span><b aria-hidden="true">◎</b> AIoT</span>
            </div>
            <section className={`${styles.portfolioSpotlight} ${bannerFont.variable}`} aria-labelledby="portfolio-spotlight-title">
                <div className={styles.portfolioCopy}>
                    <p className={styles.portfolioEyebrow}>PORTFOLIO WEBSITES</p>
                    <h2 id="portfolio-spotlight-title">A portfolio<br />with a <mark>pulse.</mark></h2>
                    <p className={styles.portfolioLead}>Two real builds. Endless ways to make yours.</p>
                    <p className={styles.portfolioDescription}>We design and build custom portfolio websites for developers, creators, and builders, shaped around your work and your story.</p>
                    <div className={styles.portfolioActions}>
                        <Link href="/our-works/portfolio-websites" className={styles.button}>Explore portfolio websites <span aria-hidden="true">↗</span></Link>
                        <Link href={portfolioRequest} className={styles.textLink}>Request your own <span aria-hidden="true">→</span></Link>
                    </div>
                </div>
                <div className={styles.portfolioStage}>
                    <span className={styles.portfolioScribbleTop} aria-hidden="true">From code to<br />personal brand.</span>
                    <Link href="/our-works/portfolio-websites#featured-portfolio" className={`${styles.portfolioWindow} ${styles.portfolioWindowPrimary}`} aria-label="Explore the OPAC sample portfolio website">
                        <span className={styles.portfolioWindowBar} aria-hidden="true"><i /><i /><i /></span>
                        <Image src="/portfolio-websites/opac-sample-portfolio.webp" alt="OPAC sample portfolio with generic name and role text, a voxel-inspired portrait, and cyan accents" width={1440} height={900} sizes="(max-width: 700px) 76vw, (max-width: 1100px) 46vw, 36vw" />
                    </Link>
                    <Link href="/our-works/portfolio-websites#featured-portfolio" className={`${styles.portfolioWindow} ${styles.portfolioWindowSecondary}`} aria-label="Explore OPAC Room Portfolio’s immersive portfolio website">
                        <span className={styles.portfolioWindowBar} aria-hidden="true"><i /><i /><i /></span>
                        <Image src="/portfolio-websites/opac-room-portfolio.webp" alt="OPAC Room Portfolio’s interactive portfolio presented as a 3D room" width={1440} height={900} sizes="(max-width: 700px) 76vw, (max-width: 1100px) 46vw, 35vw" />
                    </Link>
                    <span className={styles.portfolioScribbleBottom} aria-hidden="true">Immersive &amp;<br />interactive.</span>
                </div>
            </section>
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
            <section className={styles.businessBanner} aria-labelledby="business-title">
                <div>
                    <span className={styles.businessEyebrow}>BUSINESS SYSTEMS / BUILT AROUND YOU</span>
                    <h2 id="business-title">Your team. One clear system.</h2>
                    <p>Custom ERP and CRM tools for the way your business actually works. Connect operations, sales, and customer relationships in one place.</p>
                </div>
                <Link href="/services/erp-crm" className={styles.button}>Explore ERP &amp; CRM <span aria-hidden="true">↗</span></Link>
            </section>
            <section className={`${styles.section} ${styles.prototypes}`} aria-labelledby="prototypes-title">
                <div className={styles.sectionHeading}>
                    <h2 id="prototypes-title">Built at OPAC.</h2>
                    <Link href="/our-works" className={styles.textLink}>Explore our work <span aria-hidden="true">→</span></Link>
                </div>
                <article className={styles.featuredWork}>
                    <Link href="/our-works#robotic-vacuum" className={styles.featuredImageLink} aria-label="Explore the smart robotic vacuum project">
                        <Image src="/projects/robotic-vacuum.webp" alt="Our robotic vacuum, brought to life in a colorful comic-style scene." width={1672} height={941} sizes="(max-width: 850px) calc(100vw - 44px), (max-width: 1440px) 60vw, 820px" />
                    </Link>
                    <div className={styles.featuredCopy}>
                        <span>ROBOTICS + IOT</span>
                        <h3>Small robot.<br />Big clean.</h3>
                        <p>Meet our smart robotic vacuum. Sensors, autonomous navigation, and connected control—all in one real-world build.</p>
                        <Link href="/our-works#robotic-vacuum" className={styles.textLink}>Inside the build <span aria-hidden="true">↗</span></Link>
                    </div>
                </article>
                <article className={styles.featuredWork}>
                    <Link href="/our-works#sar-drone" className={styles.featuredImageLink} aria-label="Explore the SAR Drone project">
                        <Image src="/projects/sar-drone.webp" alt="Concept illustration of a camera drone connected to the SAR Drone mission dashboard." width={1440} height={810} sizes="(max-width: 850px) calc(100vw - 44px), (max-width: 1440px) 60vw, 820px" />
                    </Link>
                    <div className={styles.featuredCopy}>
                        <span>DRONES + MISSION SOFTWARE</span>
                        <h3>Eyes above.<br />Insight below.</h3>
                        <p>Meet SAR Drone: a search-and-rescue prototype connecting camera monitoring, mapping, and a mission dashboard.</p>
                        <Link href="/our-works#sar-drone" className={styles.textLink}>Explore SAR Drone <span aria-hidden="true">↗</span></Link>
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
