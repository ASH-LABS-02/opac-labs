'use client';

import { useEffect, useRef } from 'react';

export default function Auth3DBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Create neural network nodes with organic distribution
        const nodeCount = 100;
        const points: Array<{
            x: number;
            y: number;
            z: number;
            originalX: number;
            originalY: number;
            originalZ: number;
            vx: number;
            vy: number;
            vz: number;
            energy: number;
        }> = [];

        // Create nodes in 3D space - wider spread
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = 400 + Math.random() * 400; // Wider spread
            const height = (Math.random() - 0.5) * 600; // Taller spread
            
            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 200;
            const y = height + (Math.random() - 0.5) * 200;
            const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 200;

            points.push({
                x,
                y,
                z,
                originalX: x,
                originalY: y,
                originalZ: z,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                vz: (Math.random() - 0.5) * 0.2,
                energy: Math.random(),
            });
        }

        let angleY = 0;
        let animationId: number;
        let pulsePhase = 0;

        function rotateY(point: { x: number; y: number; z: number }, angle: number) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return {
                x: point.x * cos + point.z * sin,
                y: point.y,
                z: -point.x * sin + point.z * cos,
            };
        }

        function project(point: { x: number; y: number; z: number }) {
            const perspective = 1000;
            const scale = perspective / (perspective + point.z);
            return {
                x: point.x * scale + centerX,
                y: point.y * scale + centerY,
                scale: scale,
            };
        }

        function animate() {
            if (!ctx || !canvas) return;

            // Clear completely - no fade trails
            ctx.fillStyle = 'rgba(250, 250, 250, 1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update rotation and pulse
            angleY += 0.002;
            pulsePhase += 0.015;

            // Update node positions with organic movement
            points.forEach((point) => {
                point.x += point.vx;
                point.y += point.vy;
                point.z += point.vz;

                // Gentle pull back to original position
                point.x += (point.originalX - point.x) * 0.01;
                point.y += (point.originalY - point.y) * 0.01;
                point.z += (point.originalZ - point.z) * 0.01;

                // Update energy
                point.energy = (Math.sin(pulsePhase + point.originalX * 0.01) + 1) / 2;
            });

            // Transform and project points
            const projectedPoints = points.map((point, index) => {
                const rotated = rotateY(point, angleY);
                const projected = project(rotated);
                
                return {
                    ...projected,
                    z: rotated.z,
                    index,
                    energy: point.energy,
                };
            });

            // Draw neural network connections with thinner lines
            projectedPoints.forEach((point, i) => {
                projectedPoints.forEach((otherPoint, j) => {
                    if (i >= j) return;

                    const dx = points[i].x - points[j].x;
                    const dy = points[i].y - points[j].y;
                    const dz = points[i].z - points[j].z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    // Connect nodes within range (neural network style)
                    if (distance < 300) {
                        const opacity = (1 - distance / 300) * 0.3 * ((point.scale + otherPoint.scale) / 2);
                        const lineWidth = (1 - distance / 300) * 0.8; // Thinner lines
                        
                        ctx.strokeStyle = `rgba(26, 26, 26, ${opacity})`;
                        ctx.lineWidth = lineWidth;
                        ctx.beginPath();
                        ctx.moveTo(point.x, point.y);
                        ctx.lineTo(otherPoint.x, otherPoint.y);
                        ctx.stroke();
                    }
                });
            });

            // Draw nodes - smaller
            projectedPoints.forEach((point) => {
                const nodeSize = point.scale * 2 * (0.5 + point.energy * 0.5);
                const glowSize = nodeSize * 2;
                
                // Outer glow
                const gradient = ctx.createRadialGradient(
                    point.x, point.y, 0,
                    point.x, point.y, glowSize
                );
                gradient.addColorStop(0, `rgba(26, 26, 26, ${point.scale * 0.5})`);
                gradient.addColorStop(1, 'rgba(26, 26, 26, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(point.x, point.y, glowSize, 0, Math.PI * 2);
                ctx.fill();

                // Core node
                ctx.fillStyle = `rgba(26, 26, 26, ${point.scale * 0.8})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, nodeSize, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="auth-3d-background" />;
}
