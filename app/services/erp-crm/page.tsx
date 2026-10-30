import type { Metadata } from 'next';
import Link from 'next/link';
import { Anton } from 'next/font/google';
import styles from './page.module.css';

const displayFont = Anton({ weight: '400', subsets: ['latin'], variable: '--font-business-display', display: 'swap' });

const erpIdea = 'We need a custom ERP system for our business. We would like to discuss our current operations, the teams involved, and the workflows we want to bring together.';
const crmIdea = 'We need a custom CRM system for our business. We would like to discuss our sales process, customer information, follow-ups, and the tools we already use.';
const erpLink = `/request-project?projectType=erp&idea=${encodeURIComponent(erpIdea)}`;
const crmLink = `/request-project?projectType=crm&idea=${encodeURIComponent(crmIdea)}`;

export const metadata: Metadata = {
    title: 'Custom ERP & CRM Development | OPAC Labs',
    description: 'OPAC Labs builds custom ERP and CRM software around your business workflows, from operations and reporting to leads and customer relationships.',
};

const erpModules = ['Inventory & operations', 'Orders & approvals', 'Team workflows', 'Reports & dashboards'];
const crmModules = ['Lead pipeline', 'Customer records', 'Follow-ups & tasks', 'Sales visibility'];

export default function ErpCrmPage() {
    return (
        <main id="main-content" tabIndex={-1} className={`${styles.page} ${displayFont.variable}`}>
            <div className={styles.container}>
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link href="/">Home</Link><span aria-hidden="true">/</span><span>ERP &amp; CRM</span>
                </nav>

                <section className={styles.hero} aria-labelledby="business-hero-title">
                    <div className={styles.heroCopy}>
                        <span className={styles.eyebrow}>CUSTOM BUSINESS SOFTWARE / OPAC LABS</span>
                        <h1 id="business-hero-title">Less busywork.<br /><em>More momentum.</em></h1>
                        <p>We build ERP and CRM systems around the way your team works. Bring scattered information, repetitive steps, and customer conversations into one clear flow.</p>
                        <div className={styles.actions}>
                            <a className={styles.darkButton} href="#choose-your-system">Find your fit <span aria-hidden="true">↘</span></a>
                            <Link className={styles.textLink} href="/request-project">Tell us what you need <span aria-hidden="true">↗</span></Link>
                        </div>
                    </div>
                    <div className={styles.visual} role="img" aria-label="Concept illustration of a business workflow from a lead through delivery">
                        <span className={styles.visualStamp}>ONE FLOW<br />FOR YOUR TEAM</span>
                        <div className={styles.window} aria-hidden="true">
                            <div className={styles.windowBar}><span /><span /><span /><b>OPAC / WORKSPACE CONCEPT</b></div>
                            <div className={styles.windowBody}>
                                <div className={styles.windowSide}><strong>O.</strong><i /><i /><i /><i /></div>
                                <div className={styles.windowContent}>
                                    <div className={styles.windowHeading}><span>YOUR WORKFLOW</span><b>● LIVE VIEW</b></div>
                                    <div className={styles.flow}>
                                        <div><small>01 / CRM</small><strong>New lead</strong><span>Capture</span></div>
                                        <b>→</b>
                                        <div><small>02 / SALES</small><strong>Proposal</strong><span>Track</span></div>
                                        <b>→</b>
                                        <div><small>03 / ERP</small><strong>Delivery</strong><span>Coordinate</span></div>
                                    </div>
                                    <div className={styles.windowBottom}><span><i /> Tasks &amp; approvals</span><span><i /> Shared records</span></div>
                                </div>
                            </div>
                        </div>
                        <span className={styles.visualCaption}>Illustrative workflow / designed to show what a connected system can do</span>
                    </div>
                </section>

                <section id="choose-your-system" className={styles.choose} aria-labelledby="choose-title">
                    <div className={styles.sectionIntro}>
                        <span className={styles.eyebrow}>01 / THE RIGHT TOOL FOR THE JOB</span>
                        <h2 id="choose-title">Two systems.<br />One connected business.</h2>
                        <p>Start with the part of your business that needs the most clarity. We can connect the pieces as your needs grow.</p>
                    </div>
                    <div className={styles.cards}>
                        <article className={`${styles.card} ${styles.erpCard}`}>
                            <span className={styles.cardTag}>OPERATIONS / ERP</span>
                            <div className={styles.cardSymbol} aria-hidden="true">▦</div>
                            <h3>Run the work.</h3>
                            <p>ERP brings the day-to-day side of your business together: processes, people, orders, and information in one place.</p>
                            <ul>{erpModules.map(item => <li key={item}>{item}</li>)}</ul>
                            <Link href={erpLink}>Discuss an ERP system <span aria-hidden="true">↗</span></Link>
                        </article>
                        <article className={`${styles.card} ${styles.crmCard}`}>
                            <span className={styles.cardTag}>RELATIONSHIPS / CRM</span>
                            <div className={styles.cardSymbol} aria-hidden="true">◎</div>
                            <h3>Know your customers.</h3>
                            <p>CRM gives your team a clearer view of leads, conversations, next steps, and the relationships behind every opportunity.</p>
                            <ul>{crmModules.map(item => <li key={item}>{item}</li>)}</ul>
                            <Link href={crmLink}>Discuss a CRM system <span aria-hidden="true">↗</span></Link>
                        </article>
                    </div>
                </section>

                <section className={styles.approach} aria-labelledby="approach-title">
                    <div className={styles.approachTitle}>
                        <span className={styles.eyebrow}>02 / HOW WE BUILD</span>
                        <h2 id="approach-title">Your process<br />comes first.</h2>
                    </div>
                    <ol>
                        <li><span>01</span><div><h3>Map the workflow</h3><p>We learn how your team works today and identify the steps that cause friction.</p></div></li>
                        <li><span>02</span><div><h3>Shape the system</h3><p>We plan the right features, access levels, and connections to your existing tools.</p></div></li>
                        <li><span>03</span><div><h3>Build and improve</h3><p>We develop, test, and refine the software with your real use cases in mind.</p></div></li>
                    </ol>
                </section>

                <section className={styles.closing} aria-labelledby="closing-title">
                    <span className={styles.closingGlyph} aria-hidden="true">未来</span>
                    <div>
                        <span className={styles.eyebrow}>START WITH A CONVERSATION</span>
                        <h2 id="closing-title">Let&apos;s build<br />your better way.</h2>
                        <p>Tell us what your team is trying to manage. We&apos;ll help turn that into a clear project brief.</p>
                    </div>
                    <Link href="/request-project" className={styles.yellowButton}>Tell us about your business <span aria-hidden="true">↗</span></Link>
                </section>
            </div>
        </main>
    );
}
