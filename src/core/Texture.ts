import {WebGFX} from "@/core/WebGFX";
import image from "next/image";

export default class Texture {
    private texture: GPUTexture;
    private textureView: GPUTextureView;
    private sampler: GPUSampler;

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

    getTextureView(): GPUTextureView {
        return this.textureView;
    }

    getSampler(): GPUSampler {
        return this.sampler;
    }

    getTexture(): GPUTexture {
        return this.texture;
    }

    dispose() {
        this.texture.destroy();
    }
}