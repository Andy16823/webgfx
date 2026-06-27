import Buffer from '@/core/Buffer';
import { WebGFX } from '@/core/WebGFX';

export default class GFXArrayBuffer implements Buffer {
    buffer: GPUBuffer;
    size: number;
    usage: GPUBufferUsageFlags;
    mappedAtCreation: boolean;

    constructor(data: Float32Array | Uint32Array | Uint16Array, usage: GPUBufferUsageFlags, gfx: WebGFX) {
        this.size = data.byteLength;
        this.usage = usage;
        this.mappedAtCreation = false;

        this.buffer = gfx.device.createBuffer({
            size: this.size,
            usage: this.usage,
            mappedAtCreation: this.mappedAtCreation
        });

        gfx.device.queue.writeBuffer(this.buffer, 0, data);
    }

    update(data: Float32Array | Uint32Array, gfx: WebGFX): void {
        gfx.device.queue.writeBuffer(this.buffer, 0, data);
    }

    destroy(): void {
        this.buffer.destroy();
    }
}
