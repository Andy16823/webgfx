import { WebGFX } from '@/core/WebGFX';

/**
 * Scene interface represents a 3D scene in the WebGFX framework.
 * It defines methods for initializing, updating, rendering, and disposing of the scene.
 * Implementing classes should provide concrete implementations for these methods to manage the scene's lifecycle.
 */
export interface Scene {
    initialize(gfx: WebGFX): Promise<void>;
    update(gfx: WebGFX, deltaTime: number): void;
    render(gfx: WebGFX): void;
    dispose(gfx: WebGFX): void;
}