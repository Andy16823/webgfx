"use client";

import { Renderer } from "@/core/Renderer";
import { useEffect, useRef } from 'react';
import { WebGFX } from '@/core/WebGFX';

import { defaultShader } from '@/app/shader/Shaders';

interface ViewportProps {
    renderer?: Renderer;
    width?: number;
    height?: number;
    fpsTarget?: number | null;
}

export default function Viewport({ renderer, width = 800, height = 600, fpsTarget = null }: ViewportProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let frameId = 0;
        let lastFrameTime = performance.now();

        const init = async () => {
            const gfx = await WebGFX.create(canvas);
            if (renderer) {
                renderer.initialize(gfx);
            }

            const loop = () => {
                const now = performance.now();

                // Frame rate limiting
                if (fpsTarget) {
                    const targetFrameTime = 1000 / fpsTarget;
                    if(now - lastFrameTime < targetFrameTime) {
                        frameId = requestAnimationFrame(loop);
                        return;
                    }
                }

                // Update
                const deltaTime = (now - lastFrameTime) / 1000;
                lastFrameTime = now;
                renderer?.update(gfx, deltaTime);

                // Render
                const { encoder, renderPass } = gfx.beginFrame();
                renderer?.render(gfx, renderPass);
                gfx.endFrame(encoder, renderPass);
                
                // Request the next frame
                frameId = requestAnimationFrame(loop);
            }
            loop();
        };

        init();

        return () => {
            cancelAnimationFrame(frameId);
        }
    }, []);

    return <canvas ref={canvasRef} width={width} height={height} />;
}
