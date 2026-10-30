'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/student-projects/student.module.css';

const ideas = [
    { id: 'rover', title: 'Autonomous rover', category: 'Hardware', type: 'robotics', description: 'A mobile robot that senses obstacles and navigates a defined space.', tech: ['ESP32', 'Ultrasonic', 'Motor control'], deliverables: ['Obstacle sensing and navigation', 'Motor control and chassis integration', 'A guided demo and documented code'] },
    { id: 'campus', title: 'Campus companion', category: 'Software', type: 'software', description: 'A campus app that brings student updates, events, and useful resources into one place.', tech: ['Web app', 'Authentication', 'Database'], deliverables: ['Student accounts and a campus feed', 'An admin dashboard for managing content', 'Setup instructions and a code walkthrough'] },
    { id: 'greenhouse', title: 'Smart greenhouse', category: 'IoT', type: 'iot', description: 'Monitor growing conditions and control watering with a connected sensor system.', tech: ['ESP32', 'Sensors', 'Dashboard'], deliverables: ['Soil and environmental readings', 'Irrigation controls with manual override', 'A live dashboard and documented setup'] },
    { id: 'vision', title: 'Vision sorting system', category: 'Hardware', type: 'hybrid', description: 'Use a camera and a mechanical sorter to identify and separate a defined set of objects.', tech: ['Computer vision', 'Python', 'Actuators'], deliverables: ['A model for your agreed object categories', 'Camera and actuator integration', 'A demonstration with testing notes'] },
    { id: 'booking', title: 'Lab booking portal', category: 'Software', type: 'software', description: 'Help students find available lab equipment and request a booking with fewer back-and-forth messages.', tech: ['Web app', 'Role access', 'Scheduling'], deliverables: ['Equipment availability and booking requests', 'Approval tools for lab administrators', 'Source code and deployment instructions'] },
    { id: 'energy', title: 'Energy monitor', category: 'IoT', type: 'iot', description: 'Visualise energy usage from a sensor-based prototype and spot changes over time.', tech: ['Sensors', 'Telemetry', 'Charts'], deliverables: ['A sensor-to-dashboard data pipeline', 'Usage charts and configurable alerts', 'Documented calibration and demo guidance'] },
] as const;
const categories = ['All ideas', 'Hardware', 'Software', 'IoT'] as const;
type Category = typeof categories[number];

function Arrow() {
    return <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>;
}

export function ProjectExplorer() {
    const [category, setCategory] = useState<Category>('All ideas');
    const [selectedId, setSelectedId] = useState<string>(ideas[0].id);
    const filtered = category === 'All ideas' ? ideas : ideas.filter(idea => idea.category === category);
    const selected = filtered.find(idea => idea.id === selectedId) || filtered[0];
    const query = new URLSearchParams({ projectType: selected.type, idea: `I would like to explore this project: ${selected.title}.\n\nStarting scope:\n${selected.deliverables.map(item => `- ${item}`).join('\n')}\n\nMy requirements and deadline:\n` });
    return <>
        <div className={styles.filters} role="group" aria-label="Filter project ideas">
            {categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => {
                setCategory(item);
                setSelectedId((item === 'All ideas' ? ideas : ideas.filter(idea => idea.category === item))[0].id);
            }}>{item}</button>)}
        </div>
        <div className={styles.explorer}>
            <div className={styles.ideaList} role="group" aria-label="Choose a project idea">
                {filtered.map(idea => <button key={idea.id} id={`idea-${idea.id}`} type="button" aria-pressed={selected.id === idea.id} aria-controls="idea-detail" onClick={() => setSelectedId(idea.id)}>
                    <span className={styles.ideaNumber}>{String(ideas.indexOf(idea) + 1).padStart(2, '0')}</span><span>{idea.title}</span><Arrow />
                </button>)}
            </div>
            <div id="idea-detail" className={styles.ideaDetail} role="region" aria-labelledby={`idea-${selected.id}`} aria-live="polite" aria-atomic="true">
                <div key={selected.id} className={styles.detailContent}>
                    <h3>{selected.title}</h3><span className={styles.category}>{selected.category}</span>
                    <p>{selected.description}</p>
                    <ul className={styles.tech} aria-label="Possible technologies">{selected.tech.map(item => <li key={item}>{item}</li>)}</ul>
                    <h4>The build</h4>
                    <ul className={styles.deliverables}>{selected.deliverables.map(item => <li key={item}>{item}</li>)}</ul>
                    <Link href={`/request-project?${query}`} className={styles.button}>Build something like this <Arrow /></Link>
                    <p className={styles.scopeNote}>Ideas shown for inspiration. Scope and pricing are confirmed together.</p>
                </div>
            </div>
        </div>
    </>;
}

const stages = [
    { name: 'The brief', heading: 'Start with your idea.', description: 'Share your problem, course requirements, deadline, and what you have tried. We will agree on a realistic scope before the build begins.', note: 'Your idea starts here!' },
    { name: 'The build', heading: 'Bring the pieces together.', description: 'We design and develop the agreed hardware, software, or both. Review progress with us and ask questions as your project takes shape.', note: 'Watch it take shape!' },
    { name: 'The handover', heading: 'Get to know your build.', description: 'Receive the agreed source code, setup notes, and documentation. Walk through the system with us so you understand how the parts work together.', note: 'Understand every part!' },
    { name: 'The demo', heading: 'Make it your own.', description: 'Run the project, test the main flows, and prepare your demonstration. We will help clarify the implementation and the limitations to explain in your presentation.', note: 'Ready for your demo!' },
] as const;

export function BuildJourney() {
    const [active, setActive] = useState(0);
    return <>
        <div className={styles.stages} role="group" aria-label="Explore the build journey">
            {stages.map((stage, index) => <button key={stage.name} id={`stage-${index}`} type="button" aria-pressed={active === index} aria-controls="stage-detail" onClick={() => setActive(index)}><span>{String(index + 1).padStart(2, '0')}</span>{stage.name}</button>)}
        </div>
        <div id="stage-detail" className={styles.stageDetail} role="region" aria-labelledby={`stage-${active}`} aria-live="polite" aria-atomic="true">
            <span className={styles.stageNumber} aria-hidden="true">{String(active + 1).padStart(2, '0')}</span>
            <div key={active} className={styles.stageCopy}><h3>{stages[active].heading}</h3><p>{stages[active].description}</p></div>
            <span className={styles.handwritten} aria-hidden="true">{stages[active].note}<span>✧</span></span>
        </div>
    </>;
}

const supportOptions = ['Hardware & prototyping', 'Software & integration', 'Documentation & walkthrough'];

export function SupportPicker() {
    const [selected, setSelected] = useState(supportOptions);
    const type = selected.includes(supportOptions[0]) ? selected.includes(supportOptions[1]) ? 'hybrid' : 'hardware' : selected.includes(supportOptions[1]) ? 'software' : 'custom';
    const query = new URLSearchParams({ projectType: type, idea: `I would like help with my student project.\n\nSupport I am interested in:\n${selected.map(item => `- ${item}`).join('\n')}\n\nMy idea, course requirements, and deadline:\n` });
    return <div className={styles.support}>
        <h2>Need a hand?</h2><p>Bring a fresh idea or a project that needs a little help.</p>
        <fieldset className={styles.checks}>
            <legend>Choose the support for your brief</legend>
            {supportOptions.map(option => <label key={option}><input type="checkbox" checked={selected.includes(option)} onChange={event => setSelected(previous => event.target.checked ? [...previous, option] : previous.filter(item => item !== option))} /><span>{option}</span></label>)}
        </fieldset>
        {selected.length ? <Link href={`/request-project?${query}`} className={styles.button}>Start my brief <Arrow /></Link> : <p role="status" className={styles.selectionHint}>Select the support you need to start your brief.</p>}
    </div>;
}
