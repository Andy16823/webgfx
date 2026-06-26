import { WebGFX } from '@/core/WebGFX';

export interface Renderer {
    initialize(gfx: WebGFX): Promise<void>;
    update(gfx: WebGFX, deltaTime: number): void;
    render(gfx: WebGFX, pass: GPURenderPassEncoder): void;
    dispose(gfx: WebGFX): void;
}