import { WebGFX } from '@/core/WebGFX';

export interface Scene {
    initialize(gfx: WebGFX): Promise<void>;
    update(gfx: WebGFX, deltaTime: number): void;
    render(gfx: WebGFX, pass: GPURenderPassEncoder): void;
    dispose(gfx: WebGFX): void;
}