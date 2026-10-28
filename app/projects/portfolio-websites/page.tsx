import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Anton } from 'next/font/google';
import styles from './page.module.css';

const displayFont = Anton({ weight: '400', subsets: ['latin'], variable: '--font-portfolio-display', display: 'swap' });

const livePortfolio = 'https://ash-labs-02.github.io/ASH-LABS-02-Resume/';
const karthicPortfolio = 'https://www.karthic.dev/';
const inspiration = "I would like a personal portfolio website inspired by the Ashwin Raghavendran voxel portfolio. Please adapt the visual style and interactions to my own work, content, and identity.";
const karthicInspiration = "I would like a personal portfolio website inspired by the immersive 3D room at karthic.dev. Please adapt the experience to my own work, content, and identity.";
const ownDirection = "I would like a custom portfolio website for my work. I have my own ideas for the visual direction and would like to discuss them with OPAC Labs.";
const inspirationLink = `/request-project?projectType=software&idea=${encodeURIComponent(inspiration)}`;
const karthicInspirationLink = `/request-project?projectType=software&idea=${encodeURIComponent(karthicInspiration)}`;
const customLink = `/request-project?projectType=software&idea=${encodeURIComponent(ownDirection)}`;

export const metadata: Metadata = {
    title: 'Build your portfolio website | OPAC Labs',
    description: 'Explore real portfolio websites from OPAC Labs, use one as inspiration, or request a portfolio website designed around your own work and style.',
};

export default function PortfolioWebsitesPage() {
    return (
        <main id="main-content" className={`${styles.page} ${displayFont.variable}`}>
            <div className={styles.container}>
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link href="/projects">Our work</Link><span aria-hidden="true">/</span><span>Portfolio websites</span>
                </nav>

                <section className={styles.hero} aria-labelledby="portfolio-title">
                    <div className={styles.heroCopy}>
                        <h1 id="portfolio-title">Your work deserves<br /><span>its own world.</span></h1>
                        <p>We build portfolio websites that show what makes you different. Start with a site you like, or tell us what you want to create from scratch.</p>
                        <div className={styles.heroActions}>
                            <a className={styles.primaryButton} href="#featured-portfolio">Explore real builds <span aria-hidden="true">↘</span></a>
                            <Link className={styles.textLink} href={customLink}>Create my own <span aria-hidden="true">↗</span></Link>
                        </div>
                    </div>
                    <div className={styles.heroArt} aria-hidden="true">
                        <span className={styles.heroGlyph}>個性</span>
                        <span className={styles.burst} />
                        <span className={styles.heroNote}>A site that<br />looks like <em>you.</em></span>
                    </div>
                </section>

                <section id="featured-portfolio" className={styles.showcase} aria-labelledby="showcase-title">
                    <div className={styles.sectionHeader}>
                        <div>
                            <p className={styles.index}>Selected portfolio websites</p>
                            <h2 id="showcase-title">Made to stand out.</h2>
                        </div>
                        <p>Real builds you can explore, then use as a starting point for your own brief.</p>
                    </div>

                    <article className={styles.feature} aria-labelledby="ashwin-title">
                        <div className={styles.preview}>
                            <div className={styles.previewBar} aria-hidden="true"><span /><span /><span /><div>ash-labs-02.github.io / portfolio</div></div>
                            <Image
                                src="/portfolio-websites/ashwin-voxel-portfolio.webp"
                                alt="Screenshot of Ashwin Raghavendran’s portfolio: bold white lettering beside a voxel portrait on a dark background with cyan accents."
                                width={1440}
                                height={900}
                                sizes="(max-width: 700px) calc(100vw - 44px), (max-width: 1100px) 58vw, 800px"
                                className={styles.previewImage}
                            />
                        </div>
                        <div className={styles.featureCopy}>
                            <p className={styles.index}>01 <span>/</span> Personal portfolio</p>
                            <h3 id="ashwin-title">Ashwin<br />Raghavendran</h3>
                            <p>A voxel inspired portfolio for an AI and IoT developer, with a striking character portrait, project stories, and interactive moments.</p>
                            <ul className={styles.featureList}>
                                <li>Distinctive visual identity</li>
                                <li>Responsive project showcase</li>
                                <li>Motion and interactive details</li>
                            </ul>
                            <div className={styles.featureActions}>
                                <a className={styles.outlineButton} href={livePortfolio} target="_blank" rel="noopener noreferrer">Visit live site <span aria-hidden="true">↗</span></a>
                                <Link className={styles.primaryButton} href={inspirationLink}>Use this as inspiration <span aria-hidden="true">↗</span></Link>
                            </div>
                            <p className={styles.note}>We will tailor the design, content, and interactions to you.</p>
                        </div>
                    </article>

                    <article className={`${styles.feature} ${styles.featureReverse}`} aria-labelledby="karthic-title">
                        <div className={styles.featureCopy}>
                            <p className={styles.index}>02 <span>/</span> Immersive portfolio</p>
                            <h3 id="karthic-title">Karthic N</h3>
                            <p>A personal portfolio experienced as a 3D room. Visitors step inside, look around, and discover the developer’s work and story through the space.</p>
                            <ul className={styles.featureList}>
                                <li>Walkthrough style introduction</li>
                                <li>Interactive 3D environment</li>
                                <li>Projects woven into the room</li>
                            </ul>
                            <div className={styles.featureActions}>
                                <a className={styles.outlineButton} href={karthicPortfolio} target="_blank" rel="noopener noreferrer">Visit live site <span aria-hidden="true">↗</span></a>
                                <Link className={styles.primaryButton} href={karthicInspirationLink}>Use this as inspiration <span aria-hidden="true">↗</span></Link>
                            </div>
                            <p className={styles.note}>We will tailor the experience to your work and audience.</p>
                        </div>
                        <div className={styles.preview}>
                            <div className={styles.previewBar} aria-hidden="true"><span /><span /><span /><div>karthic.dev / portfolio</div></div>
                            <Image
                                src="/portfolio-websites/karthic-room-portfolio.webp"
                                alt="Screenshot inside Karthic N’s interactive 3D portfolio room, with a desk, project displays, and navigation around the space."
                                width={1440}
                                height={900}
                                sizes="(max-width: 700px) calc(100vw - 44px), (max-width: 1100px) 58vw, 800px"
                                className={styles.previewImage}
                            />
                        </div>
                    </article>
                </section>

                <section className={styles.custom} aria-labelledby="custom-title">
                    <span className={styles.customGlyph} aria-hidden="true">創る</span>
                    <div>
                        <p className={styles.index}>Your idea, your portfolio</p>
                        <h2 id="custom-title">Have something<br />different in mind?</h2>
                        <p>Show us references, describe a mood, or start with a blank page. We will shape a portfolio around the work you want people to remember.</p>
                    </div>
                    <Link className={styles.yellowButton} href={customLink}>Create my own portfolio <span aria-hidden="true">↗</span></Link>
                </section>
            </div>
        </main>
    );
}
