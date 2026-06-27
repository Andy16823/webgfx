import { WebGFX } from "@/core/WebGFX";

/**
 * Class representing a GPU texture in the WebGFX framework.
 */
export default class Texture {
    private texture: GPUTexture;
    private textureView: GPUTextureView;
    private sampler: GPUSampler;

    /**
     * Creates an instance of Texture.
     * @param gfx - The WebGFX instance used to create the GPU texture.
     * @param imageBitmap - The HTMLImageElement or ImageBitmap used to populate the texture.
     */
    constructor(texture: GPUTexture, textureView: GPUTextureView, sampler: GPUSampler) {
        this.texture = texture;
        this.textureView = textureView;
        this.sampler = sampler;
    }
    
    static fromImage(gfx: WebGFX, image: ImageBitmap | HTMLImageElement): Texture {
        const gpuTexture = gfx.device.createTexture({
            size: [image.width, image.height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });

        gfx.device.queue.copyExternalImageToTexture(
            { source: image },
            { texture: gpuTexture },
            [image.width, image.height]
        );

        const textureView = gpuTexture.createView();
        const sampler = gfx.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });

        return new Texture(gpuTexture, textureView, sampler);
    }

    static fromColor(gfx: WebGFX, width: number, height: number, color: [number, number, number, number]): Texture {
        const gpuTexture = gfx.device.createTexture({
            size: [width, height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });

        const data = new Uint8Array(width * height * 4);
        for (let i = 0; i < width * height; i++) {
            data[i * 4 + 0] = color[0];
            data[i * 4 + 1] = color[1];
            data[i * 4 + 2] = color[2];
            data[i * 4 + 3] = color[3];
        }

        gfx.device.queue.writeTexture(
            { texture: gpuTexture },
            data,
            { bytesPerRow: width * 4 },
            [width, height]
        );

        const textureView = gpuTexture.createView();
        const sampler = gfx.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });

        return new Texture(gpuTexture, textureView, sampler);
    }

    /**
     * Returns the GPUTextureView associated with this texture.
     * @returns The GPUTextureView of the texture.
     */
    getTextureView(): GPUTextureView {
        return this.textureView;
    }

    /**
     * Returns the GPUSampler associated with this texture.
     * @returns The GPUSampler of the texture.
     */
    getSampler(): GPUSampler {
        return this.sampler;
    }

    /**
     * Returns the GPUTexture associated with this texture.
     * @returns The GPUTexture of the texture.
     */
    getTexture(): GPUTexture {
        return this.texture;
    }

    /**
     * Destroys the texture and releases its resources.
     */
    destroy() {
        this.texture.destroy();
    }
}