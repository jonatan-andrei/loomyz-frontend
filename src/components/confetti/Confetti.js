import React, { useRef, useEffect } from "react";

export default function Confetti({ duration = 3000 }) {
    const canvasRef = useRef(null);
    const piecesRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let W = (canvas.width = window.innerWidth);
        let H = (canvas.height = window.innerHeight);
        const colors = ["#8B5CF6", "#A78BFA", "#7C3AED", "#FDE68A", "#FB923C", "#F472B6"];

        const random = (min, max) => Math.random() * (max - min) + min;

        const createPieces = () => {
            const count = Math.floor(Math.min(120, W / 10));
            const pieces = [];
            for (let i = 0; i < count; i++) {
                pieces.push({
                    x: random(0, W),
                    y: random(-H, 0),
                    w: random(6, 12),
                    h: random(8, 14),
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: random(0, Math.PI * 2),
                    speedX: random(-1.5, 1.5),
                    speedY: random(1, 3),
                    tilt: random(-0.2, 0.2),
                    angularVel: random(-0.1, 0.1),
                    life: random(60, 140)
                });
            }
            piecesRef.current = pieces;
        };

        const updateAndDraw = () => {
            ctx.clearRect(0, 0, W, H);
            const pieces = piecesRef.current;

            for (let i = pieces.length - 1; i >= 0; i--) {
                const p = pieces[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.rotation += p.angularVel;
                p.speedY += 0.01;
                p.speedX *= 0.995;
                p.life--;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();

                if (p.y > H + 50 || p.x < -50 || p.x > W + 50 || p.life <= 0) {
                    pieces.splice(i, 1);
                }
            }
        };

        function burstConfetti() {
            const start = performance.now();

            let frameCount = 0;
            function frame(now) {
                if (performance.now() - start < duration) {
                    if (frameCount % 2 === 0) {
                    for (let i = 0; i < 2; i++) {
                        piecesRef.current.push({
                            x: random(0, W),
                            y: random(-H, 0),
                            w: random(6, 12),
                            h: random(8, 14),
                            color: colors[Math.floor(Math.random() * colors.length)],
                            rotation: random(0, Math.PI * 2),
                            speedX: random(-1.5, 1.5),
                            speedY: random(1, 3),
                            tilt: random(-0.2, 0.2),
                            angularVel: random(-0.1, 0.1),
                            life: random(80, 160)
                        });
                    }
                }
                }
                frameCount++;
                updateAndDraw();

                if (piecesRef.current.length > 0) {
                    requestAnimationFrame(frame);
                }
            }

            requestAnimationFrame(frame);
        }

        // resize handler
        const handleResize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        // start animation
        burstConfetti();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [duration]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                zIndex: 40
            }}
        />
    );
}
