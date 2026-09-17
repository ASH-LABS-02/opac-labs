'use client';

import { useEffect, useRef } from 'react';

interface AsciiArtProps {
    className?: string;
}

export function AsciiArt({ className = '' }: AsciiArtProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isOver: false });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Configuration matching container dimensions
        const cols = 90;
        const rows = 40;
        const chars = ' .:-=+*#%@'; // ASCII density scale
        const numChars = chars.length;

        let animationFrameId: number;
        let time = 0;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
            mouseRef.current.targetY = (e.clientY - rect.top) / rect.height;
            mouseRef.current.isOver = true;
        };

        const handleMouseLeave = () => {
            mouseRef.current.isOver = false;
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        const render = () => {
            time += 0.04;

            // Interpolate mouse coordinates smoothly
            mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
            mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

            let result = '';

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const nx = (x / cols) * 2 - 1;
                    const ny = (y / rows) * 2 - 1;

                    // Generate flowing wave function
                    let wave = Math.sin(nx * 3 + time) * Math.cos(ny * 3 + time * 0.5);
                    wave += Math.sin(nx * 6 - time * 1.2) * Math.cos(ny * 6 + time * 0.8) * 0.3;

                    // Render ripple from mouse coordinate
                    if (mouseRef.current.isOver) {
                        const dx = nx - (mouseRef.current.x * 2 - 1);
                        const dy = ny - (mouseRef.current.y * 2 - 1);
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 0.4) {
                            const force = (1 - dist / 0.4) * 0.8;
                            wave += Math.sin(dist * 10 - time * 4) * force;
                        }
                    }

                    let brightness = (wave + 1.3) / 2.6;
                    brightness = Math.max(0, Math.min(1, brightness));

                    const charIdx = Math.floor(brightness * (numChars - 1));
                    result += chars[charIdx];
                }
                result += '\n';
            }

            container.textContent = result;
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`font-mono select-none overflow-hidden flex items-center justify-center bg-black text-white ${className}`}
            style={{
                fontSize: '9px',
                lineHeight: '8px',
                whiteSpace: 'pre',
                letterSpacing: '2px',
            }}
        />
    );
}
