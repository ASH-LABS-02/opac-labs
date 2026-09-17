'use client';

import { useEffect, useRef } from 'react';
import styles from './Auth3DBackground.module.css';

// Lightweight animated workshop sketches shared by sign-in and registration.
export default function Auth3DBackground() {
    const backgroundRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const syncVisibility = () => {
            if (backgroundRef.current) backgroundRef.current.dataset.paused = String(document.hidden);
        };
        syncVisibility();
        document.addEventListener('visibilitychange', syncVisibility);
        return () => document.removeEventListener('visibilitychange', syncVisibility);
    }, []);

    return (
        <div ref={backgroundRef} className={styles.background} aria-hidden="true">
            <svg className={styles.left} viewBox="0 0 320 760" fill="none" focusable="false">
                <g className={styles.traces}>
                    <path d="M-20 70H70L115 115V220H235L290 275V380H340M-20 690H75L125 640V525H215V420H340" />
                    <path d="M-20 100H52L85 133V252H217L260 295V350H340M-20 720H90L155 655V553H245V451H340" />
                    <circle cx="115" cy="115" r="5" /><circle cx="125" cy="640" r="5" />
                </g>
                <path className={styles.signal} d="M-20 70H70L115 115V220H235L290 275V380H340" />
                <path className={`${styles.signal} ${styles.delayed}`} d="M340 451H245V553H155V655L90 720H-20" />
                <g className={styles.float}>
                    <g transform="translate(58 175) rotate(-8 85 85)">
                        <rect x="7" y="8" width="174" height="168" fill="#171714" />
                        <rect width="174" height="168" fill="#ffe87a" stroke="#171714" strokeWidth="2.5" />
                        <g stroke="#171714" strokeWidth="3" strokeLinecap="square">
                            <path d="M51 38V23M75 38V23M99 38V23M123 38V23M51 112V127M75 112V127M99 112V127M123 112V127M43 49H28M43 73H28M43 97H28M131 49H146M131 73H146M131 97H146" />
                            <rect x="43" y="38" width="88" height="74" fill="#f4ece4" />
                            <path d="M71 59L60 74L71 89M103 59L114 74L103 89M92 57L82 91" />
                        </g>
                        <text x="87" y="153" textAnchor="middle" className={styles.label}>MAKE IT WORK.</text>
                    </g>
                </g>
                <g className={`${styles.float} ${styles.slow}`}>
                    <g transform="translate(78 532) rotate(7 76 58)">
                        <rect x="5" y="6" width="156" height="112" fill="#171714" />
                        <rect width="156" height="112" fill="#d5e7ee" stroke="#171714" strokeWidth="2.5" />
                        <path d="M52 29L29 48L52 67M103 29L126 48L103 67M86 23L69 74" stroke="#171714" strokeWidth="4" />
                        <text x="78" y="97" textAnchor="middle" className={styles.label}>A LITTLE CODE.</text>
                    </g>
                </g>
                <path className={styles.spark} d="M253 110L243 140L261 136L248 163L281 127L261 131L273 106Z" fill="#ef7196" stroke="#171714" strokeWidth="2" />
            </svg>

            <svg className={styles.right} viewBox="0 0 320 760" fill="none" focusable="false">
                <g className={styles.traces}>
                    <path d="M340 105H244L208 141V272H91L35 328V425H-20M340 706H221L177 662V547H82V457H-20" />
                    <path d="M340 136H260L239 157V303H108L66 345V395H-20M340 736H206L147 677V577H52V487H-20" />
                    <circle cx="208" cy="141" r="5" /><circle cx="177" cy="662" r="5" />
                </g>
                <path className={`${styles.signal} ${styles.delayed}`} d="M340 105H244L208 141V272H91L35 328V425H-20" />
                <path className={styles.signal} d="M-20 487H52V577H147V677L206 736H340" />
                <g className={`${styles.float} ${styles.slow}`}>
                    <g transform="translate(97 146) rotate(8 65 65)">
                        <rect x="5" y="6" width="142" height="140" fill="#171714" />
                        <rect width="142" height="140" fill="#f3bfd0" stroke="#171714" strokeWidth="2.5" />
                        <g className={styles.wifi} stroke="#171714" strokeWidth="4" strokeLinecap="round">
                            <path d="M31 54Q71 17 111 54" /><path d="M45 69Q71 45 97 69" /><path d="M59 83Q71 72 83 83" />
                        </g>
                        <circle cx="71" cy="97" r="5" fill="#171714" />
                        <text x="71" y="126" textAnchor="middle" className={styles.label}>ALL CONNECTED.</text>
                    </g>
                </g>
                <g className={styles.float}>
                    <g transform="translate(74 505) rotate(-6 86 85)">
                        <rect x="6" y="7" width="173" height="167" fill="#171714" />
                        <rect width="173" height="167" fill="#dfe9d9" stroke="#171714" strokeWidth="2.5" />
                        <g stroke="#171714" strokeWidth="3">
                            <path d="M86 44V29" /><circle cx="86" cy="24" r="5" fill="#ef7196" />
                            <rect x="37" y="45" width="99" height="72" rx="10" fill="#f4ece4" />
                            <path d="M37 69H26V93H37M136 69H147V93H136M71 100H102" />
                        </g>
                        <g className={styles.eyes} fill="#171714"><circle cx="66" cy="75" r="7" /><circle cx="108" cy="75" r="7" /></g>
                        <text x="86" y="150" textAnchor="middle" className={styles.label}>A BIG IDEA.</text>
                    </g>
                </g>
                <path className={styles.spark} d="M51 380L57 397L75 403L57 409L51 427L45 409L27 403L45 397Z" fill="#ffe87a" stroke="#171714" strokeWidth="2" />
            </svg>
        </div>
    );
}
