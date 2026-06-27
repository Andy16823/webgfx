import { WebGFX } from '@/core/WebGFX';

/**
 * Interface representing a GPU buffer.
 */
export default interface Buffer {
    buffer: GPUBuffer;
    size: number;
    usage: GPUBufferUsageFlags;
    mappedAtCreation: boolean;
    update(data: Float32Array | Uint32Array, gfx: WebGFX): void;
    destroy(): void;
}