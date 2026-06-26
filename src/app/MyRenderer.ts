import { Renderer } from '@/core/Renderer';
import { WebGFX } from '@/core/WebGFX';
import { OrthographicCamera } from '@/core/Camera';
import Transform from '@/core/Transform';
import PipelineBuilder from '@/core/PipelineBuilder';
import { defaultShader } from './shader/Shaders';

export class MyRenderer implements Renderer {
    private camera = new OrthographicCamera([0, 0], [800, 600]);
    private transform = new Transform();
    private vertexBuffer: GPUBuffer | null = null;
    private indexBuffer: GPUBuffer | null = null;
    private uniformBuffer: GPUBuffer | null = null;
    private cameraUniformBuffer: GPUBuffer | null = null;
    private modelUniformBuffer: GPUBuffer | null = null;
    private pipeline: GPURenderPipeline | null = null;
    private uniformBindGroup: GPUBindGroup | null = null;
    private cameraBindGroup: GPUBindGroup | null = null;
    private texture: GPUTexture | null = null;
    private textureView: GPUTextureView | null = null;
    private sampler: GPUSampler | null = null;
    private samplerBindGroup: GPUBindGroup | null = null;


    async initialize(gfx: WebGFX): Promise<void> {
        console.log("WebGFX initialized:", gfx);

        // Set up camera and transform
        this.transform.setPosition([-200, 0, 0]);
        this.transform.setScale([64, 64, 0]);
        this.transform.setRotationEuler([0, 0, 0]);

        // Create vertex buffer
        const vertices = new Float32Array([
            -0.5, 0.5, 0.0, 0.0,  // Vertex 1: Top Left
            0.5, 0.5, 1.0, 0.0,   // Vertex 2: Top Right
            0.5, -0.5, 1.0, 1.0,  // Vertex 3: Bottom Right
            -0.5, -0.5, 0.0, 1.0, // Vertex 4: Bottom Left
        ]);

        this.vertexBuffer = gfx.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });
        gfx.device.queue.writeBuffer(this.vertexBuffer, 0, vertices);

        // Create index buffer
        const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
        this.indexBuffer = gfx.device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });
        gfx.device.queue.writeBuffer(this.indexBuffer, 0, indices);

        // Create uniform buffer for camera
        const viewMatrix = this.camera.getViewMatrix();
        const projectionMatrix = this.camera.getProjectionMatrix();
        const cameraUniformData = new Float32Array([
            ...viewMatrix,
            ...projectionMatrix
        ]);

        this.cameraUniformBuffer = gfx.device.createBuffer({
            size: cameraUniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        gfx.device.queue.writeBuffer(this.cameraUniformBuffer, 0, cameraUniformData);

        // Create uniform buffer for model
        const modelMatrix = this.transform.getModelMatrix();
        const modelUniformData = new Float32Array([...modelMatrix]);

        this.modelUniformBuffer = gfx.device.createBuffer({
            size: modelUniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        gfx.device.queue.writeBuffer(this.modelUniformBuffer, 0, modelUniformData);

        // Create uniform buffer for color
        const uniformData = new Float32Array([
            1.0, 1.0, 0.0, 1.0
        ]);

        this.uniformBuffer = gfx.device.createBuffer({
            size: uniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        gfx.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

        // Create pipeline
        const shaderCode = defaultShader();
        const shaderModule = gfx.createShaderModule(shaderCode);
        this.pipeline = PipelineBuilder({
            vertex: {
                module: shaderModule,
                entryPoint: 'vs_main',
                buffers: [{
                    arrayStride: 4 * 4, // 4 floats per vertex, 4 bytes per float
                    attributes: [{
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x2',
                    },
                    {
                        shaderLocation: 1,
                        offset: 2 * 4,
                        format: 'float32x2',
                    }
                    ],
                }],
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fs_main',
            },
            primitive: {
                topology: 'triangle-list',
            }
        }, gfx);

        // Create bind groups
        this.uniformBindGroup = gfx.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.uniformBuffer
                }
            }]
        });

        this.cameraBindGroup = gfx.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(1),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.cameraUniformBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.modelUniformBuffer
                    }
                }
            ]
        });

        const image = new Image();
        image.src = '/pmr_logo.png';
        await image.decode();

        this.texture = gfx.device.createTexture({
            size: [image.width, image.height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });

        gfx.device.queue.copyExternalImageToTexture(
            { source: image },
            { texture: this.texture },
            [image.width, image.height]
        );

        this.textureView = this.texture.createView();
        this.sampler = gfx.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });

        this.samplerBindGroup = gfx.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(2),
            entries: [
                {
                    binding: 0,
                    resource: this.textureView
                },
                {
                    binding: 1,
                    resource: this.sampler
                }
            ]
        });
    }

    render(gfx: WebGFX, pass: GPURenderPassEncoder): void {
        if (!this.pipeline || !this.vertexBuffer || !this.indexBuffer || !this.uniformBindGroup || !this.cameraBindGroup || !this.samplerBindGroup) {
            console.error("Pipeline or buffers are not initialized.");
            return;
        }
        pass.setPipeline(this.pipeline);
        pass.setVertexBuffer(0, this.vertexBuffer);
        pass.setIndexBuffer(this.indexBuffer, 'uint32');
        pass.setBindGroup(0, this.uniformBindGroup);
        pass.setBindGroup(1, this.cameraBindGroup);
        pass.setBindGroup(2, this.samplerBindGroup);
        pass.drawIndexed(6);
    }

    dispose(gfx: WebGFX): void {
        throw new Error('Method not implemented.');
    }

    update(gfx: WebGFX, deltaTime: number): void {
        // Update logic here
        const red = (Math.sin(performance.now() / 1000) + 1) / 2; // Oscillates between 0 and 1
        const green = (Math.cos(performance.now() / 1000) + 1) / 2;
        const blue = (Math.sin(performance.now() / 500) + 1) / 2; // Faster oscillation for blue

        const uniformData = new Float32Array([
            red, green, blue, 1.0
        ]);
        gfx.device.queue.writeBuffer(this.uniformBuffer!, 0, uniformData);
    }
}