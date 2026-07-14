'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AIFloatingButton() {
    const [showTip, setShowTip] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== '/') return;
        setLeaving(false);
        const show = setTimeout(() => setShowTip(true), 1200);
        const hide = setTimeout(() => setShowTip(false), 6000);
        return () => { clearTimeout(show); clearTimeout(hide); };
    }, [pathname]);

    if (pathname !== '/') return null;

    const handleClick = () => {
        setShowTip(false);
        setLeaving(true);
        setTimeout(() => router.push('/build-project'), 500);
    };

    return (
        <>
            {leaving && <div className="ai-page-fade" />}
            <div className="ai-fab-wrapper">
                {showTip && (
                    <div className="ai-fab-tip">
                        Let OPAC AI help you pick the right components for your project
                        <span className="ai-fab-tip-arrow" />
                    </div>
                )}
                <button
                    className="ai-fab"
                    onClick={handleClick}
                    aria-label="Open AI Project Assistant"
                    onMouseEnter={() => setShowTip(true)}
                    onMouseLeave={() => setShowTip(false)}
                >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h1a2 2 0 0 1 2 2v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1v-1a2 2 0 0 1 2-2h1V9.5C7.8 8.8 7 7.5 7 6a4 4 0 0 1 4-4z"/>
                        <circle cx="9.5" cy="14.5" r="0.5" fill="currentColor"/>
                        <circle cx="14.5" cy="14.5" r="0.5" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </>
    );
}
