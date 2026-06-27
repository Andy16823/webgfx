import Buffer from '@/core/Buffer';
import { WebGFX } from '@/core/WebGFX';

/**
 * Class representing a GPU array buffer.
 * It implements the Buffer interface and provides methods to create, update, and destroy GPU buffers.
 */
export default class GFXArrayBuffer implements Buffer {
    buffer: GPUBuffer;
    size: number;
    usage: GPUBufferUsageFlags;
    mappedAtCreation: boolean;

    /**
     * Creates an instance of GFXArrayBuffer.
     * @param data - The initial data to populate the buffer with. It can be a Float32Array, Uint32Array, or Uint16Array.
     * @param usage - The usage flags for the GPU buffer, indicating how the buffer will be used (e.g., vertex buffer, index buffer).
     * @param gfx - The WebGFX instance used to create the GPU buffer.
     */
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

    /**
     * Updates the contents of the GPU buffer with new data.
     * @param data - The new data to write into the buffer. It can be a Float32Array or Uint32Array.
     * @param gfx - The WebGFX instance used to access the GPU device and queue for writing the buffer.
     */
    update(data: Float32Array | Uint32Array, gfx: WebGFX): void {
        gfx.device.queue.writeBuffer(this.buffer, 0, data);
    }

    /**
     * Destroys the GPU buffer, releasing its resources.
     * This method should be called when the buffer is no longer needed to free up GPU memory.
     */
    destroy(): void {
        this.buffer.destroy();
    }
}
