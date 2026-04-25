import { useEffect, useRef, RefObject } from 'react';

type Pixel = {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    alpha: number;
};

/**
 * usePixelCanvas
 * Draws floating pixel squares + occasional glitch bursts.
 * Used by Dashboard. Can be added to any canvas.
 *
 * @param ref        - ref attached to the <canvas> element
 * @param pixelCount - number of floating squares. Default 30
 */
export function usePixelCanvas(
    ref: RefObject<HTMLCanvasElement | null>,
    pixelCount = 30
) {
    // Keep the RAF id in a ref so cleanup always has the latest value
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let pixels: Pixel[] = [];
        let width = canvas.width;
        let height = canvas.height;

        const initPixels = () => {
            pixels = [];
            for (let i = 0; i < pixelCount; i++) {
                pixels.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.floor(Math.random() * 4) + 2,
                    speedX: (Math.random() - 0.5) * 0.6,
                    speedY: (Math.random() - 0.5) * 0.6 + 0.2,
                    color: `hsl(${Math.random() * 60 + 190}, 80%, 65%)`,
                    alpha: Math.random() * 0.5 + 0.2,
                });
            }
        };

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            width = canvas.width;
            height = canvas.height;
            initPixels();
        };
        resize();
        window.addEventListener('resize', resize);

        let frame = 0;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            frame++;

            for (const p of pixels) {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10;
                if (p.y > height + 10) p.y = -10;

                const pulseAlpha = p.alpha + Math.sin(frame * 0.02 + p.x * 0.01) * 0.1;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.min(0.7, Math.max(0.15, pulseAlpha));
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }

            // Occasional glitch burst
            if (Math.random() < 0.02) {
                ctx.fillStyle = '#60c4ff';
                ctx.globalAlpha = 0.4;
                for (let i = 0; i < 15; i++) {
                    ctx.fillRect(Math.random() * width, Math.random() * height, 3, 3);
                }
            }

            ctx.globalAlpha = 1.0;
            rafRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
        };
    }, [ref, pixelCount]);
}