'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AIFloatingButton() {
    const [showTip, setShowTip] = useState(false);
    const [bannerVisible, setBannerVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== '/') return;

        const show = setTimeout(() => setShowTip(true), 1200);
        const hide = setTimeout(() => setShowTip(false), 6000);
        return () => { clearTimeout(show); clearTimeout(hide); };
    }, [pathname]);

    useEffect(() => {
        const banner = document.getElementById('start-project');
        if (!banner) return;
        const observer = new IntersectionObserver(([entry]) => setBannerVisible(entry.isIntersecting));
        observer.observe(banner);
        return () => observer.disconnect();
    }, [pathname]);

    if (pathname !== '/' || bannerVisible) return null;



    return (
        <>
            <div className="ai-fab-wrapper">
                {showTip && (
                    <div className="ai-fab-tip">
                        Explore a software or hardware project with OPAC AI
                        <span className="ai-fab-tip-arrow" />
                    </div>
                )}
                <Link
                    className="ai-fab"
                    href="/build-project"
                    onFocus={() => setShowTip(true)}
                    onBlur={() => setShowTip(false)}
                    aria-label="Open AI Project Assistant"
                    onMouseEnter={() => setShowTip(true)}
                    onMouseLeave={() => setShowTip(false)}
                >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h1a2 2 0 0 1 2 2v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1v-1a2 2 0 0 1 2-2h1V9.5C7.8 8.8 7 7.5 7 6a4 4 0 0 1 4-4z"/>
                        <circle cx="9.5" cy="14.5" r="0.5" fill="currentColor"/>
                        <circle cx="14.5" cy="14.5" r="0.5" fill="currentColor"/>
                    </svg>
                </Link>
            </div>
        </>
    );
}
