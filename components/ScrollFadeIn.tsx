'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
interface Props { children: ReactNode; className?: string; delay?: number; }
export default function ScrollFadeIn({ children, className = '', delay = 0 }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const element = ref.current;
        if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
        }, { threshold: 0.05 });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    return <div ref={ref} className={`scroll-fade-in ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${Math.min(delay, 100)}ms` }}>{children}</div>;
}
