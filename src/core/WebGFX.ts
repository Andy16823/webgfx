export class WebGFX {
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
    depthTexture: GPUTexture;
    depthTextureView: GPUTextureView;

    constructor(device: GPUDevice, context: GPUCanvasContext, format: GPUTextureFormat, depthTexture: GPUTexture) {
        this.device = device;
        this.context = context;
        this.format = format;
        this.depthTexture = depthTexture;
        this.depthTextureView = depthTexture.createView();
    }

    /**
     * Creates a new instance of WebGFX by initializing the GPU device and context for the provided canvas.
     * @param canvas The HTMLCanvasElement to be used for rendering.
     * @returns A promise that resolves to a new instance of WebGFX.
     */
    static async create(canvas: HTMLCanvasElement) {
        // Validate that the browser supports WebGPU
        if (!navigator.gpu) {
            throw new Error('WebGPU is not supported in this browser.');
        }

        // Request a GPU adapter
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('Failed to get GPU adapter.');
        }

        // Request a GPU device from the adapter and get the WebGPU context from the canvas
        const device = await adapter.requestDevice();
        const context = canvas.getContext('webgpu') as GPUCanvasContext;

        // Validate that the context was successfully obtained
        if (!context) {
            throw new Error('Failed to get WebGPU context.');
        }

        // Get the preferred canvas format for the current device
        const format = navigator.gpu.getPreferredCanvasFormat();

        // Configure the context with the device, format, and alpha mode
        context.configure({
            device: device,
            format: format,
            alphaMode: 'opaque',
        });

        const depthTexture = device.createTexture({
            size: [canvas.width, canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        // Return a new instance of WebGFX with the initialized device, context, format, and depth texture
        return new WebGFX(device, context, format, depthTexture);
    }

    /**
     * Begins a new frame by creating a command encoder and starting a render pass.
     * @returns An object containing the command encoder and render pass encoder for the current frame.
     */
    beginFrame() {
        const encoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();

        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
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

        return { encoder, renderPass };
    }

    /**
     * Ends the current frame by ending the render pass and submitting the command buffer to the GPU queue.
     * @param encoder The command encoder used to record GPU commands for the current frame.
     * @param renderPass The render pass encoder used to record rendering commands for the current frame.
     */
    endFrame(encoder: GPUCommandEncoder, renderPass: GPURenderPassEncoder) {
        renderPass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    /**
     * Creates a GPU shader module from the provided shader code.
     * @param code The shader code in WGSL (WebGPU Shading Language) format.
     * @returns A GPUShaderModule that can be used to create a render pipeline.
     */
    createShaderModule(code: string): GPUShaderModule {
        return this.device.createShaderModule({ code });
    }
}