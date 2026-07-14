'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [displayChildren, setDisplayChildren] = useState(children);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        setDisplayChildren(children);
        
        const timer = setTimeout(() => {
            setIsAnimating(false);
        }, 50);

        return () => clearTimeout(timer);
    }, [pathname, children]);

    return (
        <div className={isAnimating ? 'page-transition-enter' : ''}>
            {displayChildren}
        </div>
    );
}
