"use client";

import { Scene } from "@/core/Scene";
import { useEffect, useRef } from 'react';
import { WebGFX } from '@/core/WebGFX';

/**
 * ViewportMode defines the rendering mode for the Viewport component.
 * Continuous: The renderer continuously updates and renders frames.
 * OnDemand: The renderer only updates and renders frames when the invalidateSignal changes.
 */
export enum ViewportMode {
    Continuous,
    OnDemand
}

/**
 * ViewportProps defines the properties for the Viewport component.
 * - renderer: The Renderer instance responsible for rendering the scene.
 * - invalidateSignal: An optional signal that triggers a re-render when it changes.
 * - width: The width of the canvas in pixels (default is 800).
 * - height: The height of the canvas in pixels (default is 600).
 * - mode: The rendering mode for the viewport (default is OnDemand).
 */
interface ViewportProps {
    scene: Scene;
    invalidateSignal?: number;
    width?: number;
    height?: number;
    mode?: ViewportMode;
    onKeyDown?: (event: KeyboardEvent) => void;
    onMouseMove?: (event: MouseEvent, relativeX: number, relativeY: number) => void;
    onMouseDown?: (event: MouseEvent, relativeX: number, relativeY: number) => void;
}

/**
 * Viewport is a React component that provides a canvas for rendering graphics using WebGFX and a specified Renderer.
 * @param param0 - The properties for the Viewport component, including the renderer, invalidateSignal, width, height, and mode.
 * @returns A canvas element that serves as the rendering surface for the specified Scene.
 */
export default function Viewport({ scene, invalidateSignal, width = 800, height = 600, mode = ViewportMode.OnDemand, onKeyDown, onMouseMove, onMouseDown }: ViewportProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gfxRef = useRef<WebGFX | null>(null);

    /**
     * Renders a single frame using the provided scene and WebGFX instance.
     * This function is called whenever the invalidateSignal changes, indicating that a re-render is needed.
     * It begins a new frame, calls the scene's render method, and ends the frame.
     */
    const renderFrame = () => {
        const gfx = gfxRef.current;
        if (!gfx) return;

        // const { encoder, renderPass } = gfx.beginFrame();
        scene.render(gfx);
        // gfx.endFrame(encoder, renderPass);
    }

    /**
     * Handles mouse movement events on the canvas and calculates the relative mouse position.
     * If an onMouseMove callback is provided, it is called with the event and the relative mouse coordinates.
     * @param event - The MouseEvent triggered by mouse movement.
     */
    const handleMouseMove = (event: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const relativeX = event.clientX - canvas.getBoundingClientRect().left;
        const relativeY = event.clientY - canvas.getBoundingClientRect().top;
        if (onMouseMove) {
            onMouseMove(event, relativeX, relativeY);
        }
    };

    /**
     * Handles mouse down events on the canvas and calculates the relative mouse position.
     * If an onMouseDown callback is provided, it is called with the event and the relative mouse coordinates.
     * @param event - The MouseEvent triggered by mouse button press.
     * @returns void
     */
    const handleMouseDown = (event: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const relativeX = event.clientX - canvas.getBoundingClientRect().left;
        const relativeY = event.clientY - canvas.getBoundingClientRect().top;
        if (onMouseDown) {
            onMouseDown(event, relativeX, relativeY);
        }
    };

    /**
     * Handles key down events and calls the provided onKeyDown callback if it exists.
     * @param event - The KeyboardEvent triggered by a key press.
     * @returns void
     */
    const handleKeyDown = (event: KeyboardEvent) => {
        if (onKeyDown) {
            onKeyDown(event);
        }
    };

    /**
     * Initializes the WebGFX instance and the scene when the component mounts.
     */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let frameId = 0;
        let disposed = false;
        let lastFrameTime = performance.now();

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);

        const init = async () => {
            console.log("INIT VIEWPORT");
            const gfx = await WebGFX.create(canvas);
            if (disposed) return;

            gfxRef.current = gfx;
            await scene.initialize(gfx, width, height);

            if (mode === ViewportMode.OnDemand) {
                renderFrame();
                return;
            }

            const loop = () => {
                if (disposed) return;

                const now = performance.now();
                const deltaTime = (now - lastFrameTime) / 1000;
                lastFrameTime = now;

                scene.update(gfx, deltaTime);
                renderFrame();

                frameId = requestAnimationFrame(loop);
            }
            loop();
        }
        init();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);

            disposed = true;
            cancelAnimationFrame(frameId);
            if (gfxRef.current) {
                scene.dispose(gfxRef.current);
            }
            else {
                console.warn("WebGFX instance not initialized; cannot dispose scene.");
            }
        }
    }, [scene, mode]);

    /**
     * Signal listener that triggers a re-render whenever the invalidateSignal changes.
     */
    useEffect(() => {
        if (invalidateSignal !== undefined && mode === ViewportMode.OnDemand) {
            renderFrame();
        }
    }, [invalidateSignal, mode]);

    /**
     * Handles window resize events and updates the scene's size accordingly.
     * This effect listens for changes in the width and height props and calls the scene's resize method with the updated dimensions.
     */
    useEffect(() => {
        const gfx = gfxRef.current;
        if (!gfx) return; // Ensure gfx is initialized before proceeding

        gfx.resize(width, height);
        scene.resize(gfx, width, height);
    }, [width, height]);

    return <canvas ref={canvasRef} width={width} height={height} />;
}
