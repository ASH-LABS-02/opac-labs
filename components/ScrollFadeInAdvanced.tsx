'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollFadeInAdvancedProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export default function ScrollFadeInAdvanced({ children, className = '', delay = 0 }: ScrollFadeInAdvancedProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
    const ref = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                } else {
                    setIsVisible(false);
                }
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -80px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`scroll-fade-in-advanced ${isVisible ? 'visible' : ''} ${scrollDirection} ${className}`}
        >
            {children}
        </div>
    );
}