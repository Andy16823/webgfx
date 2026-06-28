import {WebGFX} from "@/core/WebGFX";

/**
 * Interface representing a render target in the WebGFX framework.
 */
export interface GFXRenderTargetInterface {
    startRenderPass(gfx: WebGFX): {encoder: GPUCommandEncoder, pass: GPURenderPassEncoder};
    endRenderPass(gfx: WebGFX, pass: GPURenderPassEncoder, encoder: GPUCommandEncoder): void;
    createBindGroups(gfx: WebGFX, pipeline: GPURenderPipeline, groupIndex: number): void;
    bind(pass: GPURenderPassEncoder, group: number): void;
    destroy(): void;
}

/**
 * Class representing a render target in the WebGFX framework.
 * A render target is a texture that can be rendered to, allowing for off-screen rendering and post-processing effects.
 * It consists of a color texture and a depth texture, both of which are used during the rendering process.
 */
export default class GFXRenderTarget implements GFXRenderTargetInterface {
    private renderTargetTexture: GPUTexture;
    private renderTargetView: GPUTextureView; 
    private renderTargetSampler: GPUSampler;   
    private depthTexture: GPUTexture;
    private depthTextureView: GPUTextureView;    
    private bindGroup: GPUBindGroup | null = null;

    /**
     * Creates an instance of GFXRenderTarget with the specified width and height.
     * @param gfx - The WebGFX instance used to create the render target.
     * @param width - The width of the render target in pixels.
     * @param height - The height of the render target in pixels.
     */
    constructor(gfx: WebGFX, width: number, height: number) {
        this.renderTargetTexture = gfx.device.createTexture({
            size: [width, height],
            format: gfx.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.renderTargetView = this.renderTargetTexture.createView();

        this.depthTexture = gfx.device.createTexture({
            size: [width, height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.depthTextureView = this.depthTexture.createView();

        this.renderTargetSampler = gfx.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });
    }
    
    /**
     * Starts a render pass on the render target, returning the command encoder and render pass encoder.
     * The render pass is configured with the render target's color and depth textures, and it clears both textures at the start of the pass.
     * @param gfx - The WebGFX instance used to start the render pass.
     * @returns An object containing the command encoder and render pass encoder for the render pass.
     * @throws An error if the render target view is not created.
     */
    startRenderPass(gfx: WebGFX): {encoder: GPUCommandEncoder, pass: GPURenderPassEncoder} {
        const encoder = gfx.device.createCommandEncoder();
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.renderTargetView,
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
            depthStencilAttachment: {
                view: this.depthTextureView,
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            }
        });
        
        return { encoder, pass: renderPass };
    }

    /**
     * Ends the render pass on the render target, submitting the command buffer to the GPU queue.
     * @param gfx - The WebGFX instance used to end the render pass.
     * @param pass - The render pass encoder used to record rendering commands for the render pass. 
     * @param encoder - The command encoder used to record GPU commands for the render pass. 
     */
    endRenderPass(gfx: WebGFX, pass: GPURenderPassEncoder, encoder: GPUCommandEncoder): void {
        pass.end();
        gfx.device.queue.submit([encoder.finish()]);
    }

    /**
     * Destroys the render target, releasing its resources.
     * This method should be called when the render target is no longer needed to free up GPU memory.
     */
    destroy(): void {
        this.renderTargetTexture.destroy();
        this.depthTexture.destroy();
    }

    /**
     * Creates bind groups for the render target, allowing it to be used as a texture in shaders.
     */
    createBindGroups(gfx: WebGFX, pipeline: GPURenderPipeline, groupIndex: number): void {
        this.bindGroup = gfx.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(groupIndex),
            entries: [
                {
                    binding: 0,
                    resource: this.renderTargetView
                },
                {
                    binding: 1,
                    resource: this.renderTargetSampler
                }
            ]
        });
    }

    /**
     * Binds the render target's bind group to the specified render pass encoder and group index.
     * @param pass - The GPURenderPassEncoder to which the bind group will be bound.
     * @param group - The index of the bind group layout in the pipeline.
     */
    bind(pass: GPURenderPassEncoder, group: number): void {
        if (!this.bindGroup) {
            console.error("Bind group is not created. Call createBindGroups() before binding.");
            return;
        }
        pass.setBindGroup(group, this.bindGroup);
    }
}