'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollFadeInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export default function ScrollFadeIn({ children, className = '', delay = 0 }: ScrollFadeInProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Fade in when scrolling into view
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                } else {
                    // Fade out when scrolling out of view
                    setIsVisible(false);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`scroll-fade-in ${isVisible ? 'visible' : ''} ${className}`}
        >
            {children}
        </div>
    );
}