import { Scene } from '@/core/Scene';
import { WebGFX } from '@/core/WebGFX';
import { OrthographicCamera } from '@/core/Camera';
import Transform from '@/core/Transform';
import PipelineBuilder from '@/core/PipelineBuilder';
import { defaultShader } from '../shaders/Shaders';
import Texture from '@/core/Texture';
import GFXArrayBuffer from '@/core/GFXArrayBuffer';
import GLTFLoader from '@/core/GLTFLoader';

export class Scene2D implements Scene {
    private camera = new OrthographicCamera([0, 0], [800, 600]);
    private transform = new Transform();
    private vertexBuffer: GFXArrayBuffer | null = null;
    private indexBuffer: GFXArrayBuffer | null = null;
    private uniformBuffer: GFXArrayBuffer | null = null;
    private cameraUniformBuffer: GFXArrayBuffer | null = null;
    private modelUniformBuffer: GFXArrayBuffer | null = null;
    private pipeline: GPURenderPipeline | null = null;
    private uniformBindGroup: GPUBindGroup | null = null;
    private cameraBindGroup: GPUBindGroup | null = null;
    private texture: Texture | null = null;
    private samplerBindGroup: GPUBindGroup | null = null;

    async initialize(gfx: WebGFX): Promise<void> {
        console.log("WebGFX initialized:", gfx);

        // Set up camera and transform
        this.transform.setPosition([-200, 0, 0]);
        this.transform.setScale([256, 256, 0]);
        this.transform.setRotationEuler([0, 0, 0]);

        // Create vertex buffer
        const vertices = new Float32Array([
            -0.5, 0.5, 0.0, 0.0,  // Vertex 1: Top Left
            0.5, 0.5, 1.0, 0.0,   // Vertex 2: Top Right
            0.5, -0.5, 1.0, 1.0,  // Vertex 3: Bottom Right
            -0.5, -0.5, 0.0, 1.0, // Vertex 4: Bottom Left
        ]);
        this.vertexBuffer = new GFXArrayBuffer(vertices, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, gfx);

        // Create index buffer
        const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
        this.indexBuffer = new GFXArrayBuffer(indices, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, gfx);

        // Create uniform buffer for camera
        const viewMatrix = this.camera.getViewMatrix();
        const projectionMatrix = this.camera.getProjectionMatrix();
        const cameraUniformData = new Float32Array([
            ...viewMatrix,
            ...projectionMatrix
        ]);

        this.cameraUniformBuffer = new GFXArrayBuffer(cameraUniformData, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, gfx);

        // Create uniform buffer for model
        const modelMatrix = this.transform.getModelMatrix();
        const modelUniformData = new Float32Array([...modelMatrix]);
        this.modelUniformBuffer = new GFXArrayBuffer(modelUniformData, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, gfx);

        // Create uniform buffer for color
        const uniformData = new Float32Array([
            1.0, 1.0, 0.0, 1.0
        ]);
        this.uniformBuffer = new GFXArrayBuffer(uniformData, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, gfx);

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
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: false, // For 2D rendering, we typically don't need depth testing
                depthCompare: 'less',
            }
        }, gfx);

        // Create bind groups
        this.uniformBindGroup = gfx.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.uniformBuffer?.buffer
                }
            }]
        });

        this.cameraBindGroup = gfx.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(1),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.cameraUniformBuffer?.buffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.modelUniformBuffer?.buffer
                    }
                }
            ]
        });

        const image = new Image();
        image.src = '/pmr_logo.png';
        await image.decode();

        this.texture = Texture.fromImage(gfx, image);

        this.samplerBindGroup = gfx.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(2),
            entries: [
                {
                    binding: 0,
                    resource: this.texture.getTextureView()
                },
                {
                    binding: 1,
                    resource: this.texture.getSampler()
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
        pass.setVertexBuffer(0, this.vertexBuffer.buffer);
        pass.setIndexBuffer(this.indexBuffer.buffer, 'uint32');
        pass.setBindGroup(0, this.uniformBindGroup);
        pass.setBindGroup(1, this.cameraBindGroup);
        pass.setBindGroup(2, this.samplerBindGroup);
        pass.drawIndexed(6);
    }

    dispose(gfx: WebGFX): void {
        this.vertexBuffer?.destroy();
        this.indexBuffer?.destroy();
        this.uniformBuffer?.destroy();
        this.cameraUniformBuffer?.destroy();
        this.modelUniformBuffer?.destroy();
        this.texture?.destroy();
    }

    update(gfx: WebGFX, deltaTime: number): void {

        if (this.uniformBuffer) {
            const red = (Math.sin(performance.now() / 1000) + 1) / 2;
            const green = (Math.cos(performance.now() / 1000) + 1) / 2;
            const blue = (Math.sin(performance.now() / 500) + 1) / 2;

            const uniformData = new Float32Array([
                red, green, blue, 1.0
            ]);
            this.uniformBuffer.update(uniformData, gfx);
        }

        if (this.modelUniformBuffer) {
            this.transform.setRotationEuler([0, 0, performance.now() / 10]);
            const modelMatrix = this.transform.getModelMatrix();
            const modelUniformData = new Float32Array([...modelMatrix]);
            this.modelUniformBuffer.update(modelUniformData, gfx);
        }
    }
}