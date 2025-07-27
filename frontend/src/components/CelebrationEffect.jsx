import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import useSound from "use-sound";

const CelebrationEffect = ({ show, usingIn }) => {
    const soundUrl = "/lastminute2.mp3";
    const [play, { stop }] = useSound(soundUrl, { volume: 0.9, interrupt: true });

    useEffect(() => {
        console.log("celebration invoked!")
        if (show) {
            const end = Date.now() + 4 * 1000;
            const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

            const frame = () => {
                if (Date.now() > end) {
                    stop();
                    return;
                }

                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    startVelocity: 60,
                    origin: { x: 0, y: 0.5 },
                    colors: colors,
                    shapes: ["square", "triangle"],
                });

                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    startVelocity: 60,
                    origin: { x: 1, y: 0.5 },
                    colors: colors,
                    shapes: ["square", "triangle"],
                });

                requestAnimationFrame(frame);
            };

            if(usingIn === "scalc") {
                play();
            }
            frame();
        }
    }, [show, play, stop]);

    return null;
};

export default CelebrationEffect;