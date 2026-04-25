import { useEffect, RefObject } from 'react';

/**
 * useBgCanvas
 * Draws the animated scrolling grid + radial pulse onto a canvas.
 * Used by both Dashboard and Projects.
 *
 * @param ref  - ref attached to the <canvas> element
 * @param opts - optional tweaks
 */
export function useBgCanvas(
    ref: RefObject<HTMLCanvasElement | null>,
    opts: {
        /** Center Y as a fraction of canvas height. Default 0.45 */
        cy?: number;
        /** Radial gradient base radius. Default 300 */
        radius?: number;
    } = {}
) {
    const { cy: cyFrac = 0.45, radius = 300 } = opts;

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        let frame = 0;
        let raf: number;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;

            // ── Moving grid ──────────────────────────────────────────────
            const gridSize = 48;
            const cols = Math.ceil(canvas.width / gridSize) + 1;
            const rows = Math.ceil(canvas.height / gridSize) + 1;
            const offset = (frame * 0.3) % gridSize;

            ctx.strokeStyle = 'rgba(42, 130, 220, 0.07)';
            ctx.lineWidth = 0.5;

            for (let x = 0; x <= cols; x++) {
                ctx.beginPath();
                ctx.moveTo(x * gridSize - offset, 0);
                ctx.lineTo(x * gridSize - offset, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y <= rows; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * gridSize - offset);
                ctx.lineTo(canvas.width, y * gridSize - offset);
                ctx.stroke();
            }

            // ── Radial pulse ─────────────────────────────────────────────
            const cx = canvas.width / 2;
            const cy = canvas.height * cyFrac;
            const pulse = Math.sin(frame * 0.02) * 0.5 + 0.5;
            const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius + pulse * 60);
            grd.addColorStop(0, `rgba(42, 130, 220, ${0.12 + pulse * 0.06})`);
            grd.addColorStop(1, 'rgba(42, 130, 220, 0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            raf = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, [ref, cyFrac, radius]);
}