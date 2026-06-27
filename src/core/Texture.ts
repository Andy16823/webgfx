import {WebGFX} from "@/core/WebGFX";

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
    constructor(gfx: WebGFX, imageBitmap: HTMLImageElement | ImageBitmap) {
        this.texture = gfx.device.createTexture({
            size: [imageBitmap.width, imageBitmap.height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });

        gfx.device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: this.texture },
            [imageBitmap.width, imageBitmap.height]
        );

        this.textureView = this.texture.createView();
        this.sampler = gfx.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });
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
    dispose() {
        this.texture.destroy();
    }
}