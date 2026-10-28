import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Anton } from 'next/font/google';
import styles from './project.module.css';

const displayFont = Anton({ weight: '400', subsets: ['latin'], variable: '--font-work-display', display: 'swap' });

export const metadata: Metadata = {
    title: 'Explore our work | OPAC Labs',
    description: 'Explore OPAC Labs projects in robotics, connected hardware, and AI software. See the thinking and technology inside each build.',
};

const projects = [
    {
        id: 'ai-healthcare', number: '02', category: 'AI + healthcare', title: 'Dual-mode AI healthcare',
        description: 'Turning complex medical reports into clearer patient insights and clinician summaries.',
        stack: ['FastAPI / Python', 'React + Vite', 'OpenAI GPT-4 Vision', 'PDF & image OCR'],
        features: ['Patient and clinician output modes', 'English, Spanish, French, Chinese & Hindi', 'Hallucination guardrails', 'Red-flag escalation'],
        challenge: 'A multi-step verification pipeline designed to keep summaries grounded in the source report.',
        image: '/projects/ai-healthcare.webp',
        imageAlt: 'Comic illustration of a clinician and patient discussing a medical report that branches into a Patient Summary and a Clinician Summary.',
        tone: 'green',
    },
    {
        id: 'intelli-credit', number: '03', category: 'AI + finance', title: 'Intelli-Credit',
        description: 'Connecting financial data and AI research for corporate credit appraisal.',
        stack: ['Python / FastAPI', 'LangChain & OpenAI', 'FAISS vector search', 'Firebase Firestore & Storage'],
        features: ['Multi-agent research', 'Financial ratio analysis', 'Three-year projections', 'Automated credit appraisal PDF'],
        challenge: 'Bringing together web research and extracted financial data into explainable risk scores.',
        image: '/projects/intelli-credit.webp',
        imageAlt: 'Comic illustration of a laptop showing financial data, AI analysis, credit assessment, and risk insights in a bright city workspace.',
        tone: 'blue',
    },
];

function BuildDetails({ stack, features, challenge }: { stack: string[]; features: string[]; challenge: string }) {
    return (
        <div className={styles.detailGrid}>
            <div><h3>The technology</h3><ul>{stack.map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><h3>What it does</h3><ul>{features.map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><h3>The engineering challenge</h3><p>{challenge}</p></div>
        </div>
    );
}

export default function ProjectsLandingPage() {
    return (
        <main id="main-content" className={`${styles.portfolio} ${displayFont.variable}`}>
            <div className={styles.container}>
                <header className={styles.intro}>
                    <h1>Ideas,<br />made real.</h1>
                    <p>A selection of things we’ve built.<br />Hardware, software, and the intelligence in between.</p>
                </header>

                <section className={styles.portfolioLink} aria-labelledby="portfolio-link-title">
                    <div>
                        <p className={styles.index}>Websites <span>/</span> Personal portfolios</p>
                        <h2 id="portfolio-link-title">Build your portfolio website.</h2>
                        <p>Explore a real portfolio build. Choose a direction you love, or bring us an idea of your own.</p>
                    </div>
                    <Link className={styles.button} href="/projects/portfolio-websites">Explore portfolio websites <span aria-hidden="true">↗</span></Link>
                </section>

                <article id="robotic-vacuum" className={styles.featured} aria-labelledby="vacuum-title">
                    <p className={styles.index}>01 <span>/</span> Robotics + IoT</p>
                    <div className={styles.featureGrid}>
                        <Image className={styles.projectImage} src="/projects/robotic-vacuum.webp" alt="OPAC’s robotic vacuum with exposed electronics and ultrasonic sensors, illustrated in a vibrant outdoor comic scene." width={1672} height={941} priority sizes="(max-width: 850px) calc(100vw - 44px), (max-width: 1440px) 64vw, 860px" />
                        <div className={styles.featureCopy}>
                            <h2 id="vacuum-title"><span>Smart </span><span>robotic </span><span>vacuum</span></h2>
                            <p>An autonomous cleaning robot that brings sensors, motors, and connected control together.</p>
                            <span className={styles.stack}>Raspberry Pi / Python / IoT</span>
                            <Link className={styles.button} href="/request-project">Build something like this <span aria-hidden="true">↗</span></Link>
                        </div>
                    </div>
                    <details className={styles.details}>
                        <summary>Inside the build <span className={styles.toggle} aria-hidden="true" /></summary>
                        <BuildDetails
                            stack={['Raspberry Pi 4', 'L298N motor driver', 'HC-SR04 ultrasonic sensor', 'IR obstacle sensors', 'Vacuum motor & chassis', '12V battery pack']}
                            features={['Autonomous cleaning', 'Obstacle detection & avoidance', 'Python RPi.GPIO control', 'Flask web dashboard', 'MQTT / HTTP monitoring', 'Prepared for SLAM room mapping']}
                            challenge="Synchronizing ultrasonic and IR sensors with motor control for smooth obstacle avoidance while maintaining continuous vacuum cleaning."
                        />
                    </details>
                </article>

                <section className={styles.moreWork} aria-labelledby="more-work-title">
                    <h2 id="more-work-title">More from the lab.</h2>
                    {projects.map(project => (
                        <article className={styles.projectRow} id={project.id} key={project.id} aria-labelledby={`${project.id}-title`}>
                            <div className={styles.rowMain}>
                                <div className={styles.rowCopy}>
                                    <p className={styles.index}>{project.number} <span>/</span> {project.category}</p>
                                    <h2 id={`${project.id}-title`}>{project.title}</h2>
                                    <p>{project.description}</p>
                                    <span className={`${styles.category} ${styles[project.tone]}`}>{project.category}</span>
                                </div>
                                <Image className={styles.projectImage} src={project.image} alt={project.imageAlt} width={1440} height={810} sizes="(max-width: 600px) calc(100vw - 44px), (max-width: 850px) 46vw, (max-width: 1440px) 52vw, 720px" />
                            </div>
                            <details className={`${styles.details} ${styles.rowDetails}`}>
                                <summary>Explore the build <span className={styles.srOnly}>: {project.title}</span><span className={styles.toggle} aria-hidden="true" /></summary>
                                <BuildDetails stack={project.stack} features={project.features} challenge={project.challenge} />
                                <Link className={styles.detailLink} href="/request-project">Discuss a similar project <span aria-hidden="true">↗</span></Link>
                            </details>
                        </article>
                    ))}
                </section>

                <section className={styles.closing} aria-labelledby="closing-title">
                    <h2 id="closing-title">Have an idea of your own?</h2>
                    <Link className={styles.button} href="/request-project">Start a project <span aria-hidden="true">↗</span></Link>
                </section>
            </div>
        </main>
    );
}
