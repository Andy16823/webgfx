import { Scene } from '@/core/Scene';
import { WebGFX } from '@/core/WebGFX';
import { PerspectiveCamera } from '@/core/Camera';
import Transform from '@/core/Transform';
import PipelineBuilder from '@/core/PipelineBuilder';
import { meshShader } from './shader/Shaders';
import GFXArrayBuffer from '@/core/GFXArrayBuffer';
import GLTFLoader from '@/core/GLTFLoader';
import Model from '@/core/Model';

export class Scene3D implements Scene {
    private camera = new PerspectiveCamera([0, 0, 5], 800 / 600);
    private transform = new Transform();
    private model: Model | null = null;
    private cameraUniformBuffer: GFXArrayBuffer | null = null;
    private modelUniformBuffer: GFXArrayBuffer | null = null;
    private pipeline: GPURenderPipeline | null = null;
    private cameraBindGroup: GPUBindGroup | null = null;

    async initialize(gfx: WebGFX): Promise<void> {
        console.log("WebGFX initialized:", gfx);

        // Set up camera and transform
        this.transform.setPosition([0, 0, 0]);
        this.transform.setScale([1, 1, 1]);
        this.transform.setRotationEuler([0, 0, 0]);

        // Load the GLTF model
        const gltfLoader = new GLTFLoader();
        this.model = await gltfLoader.load('/models/test/test.gltf', gfx);
        console.log("Loaded model:", this.model);

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

        // Create pipeline
        const shaderCode = meshShader();
        const shaderModule = gfx.createShaderModule(shaderCode);
        this.pipeline = PipelineBuilder({
            vertex: {
                module: shaderModule,
                entryPoint: 'vs_main',
                buffers: [{
                    arrayStride: 4 * 8, // 3 floats for position, 3 floats for normal, 2 floats for UV, 4 bytes per float
                    attributes: [{
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3',
                    }, {
                        shaderLocation: 1,
                        offset: 4 * 3,
                        format: 'float32x3',
                    }, {
                        shaderLocation: 2,
                        offset: 4 * 6,
                        format: 'float32x2',
                    }],
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

        // Camera bind group
        this.cameraBindGroup = gfx.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
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

        this.model?.createBindGroups(gfx, this.pipeline, 1);
    }

    render(gfx: WebGFX, pass: GPURenderPassEncoder): void {
        if (!this.pipeline || !this.model || !this.cameraBindGroup) {
            console.error("Pipeline or buffers are not initialized.");
            return;
        }
        pass.setPipeline(this.pipeline);
        this.model.meshes.forEach(mesh => {
            const material = this.model?.materials[mesh.getMaterialIndex()];
            if (material) {
                material.bindMaterial(pass);
            }
            pass.setVertexBuffer(0, mesh.getVertexBuffer()?.buffer!);
            pass.setIndexBuffer(mesh.getIndexBuffer()?.buffer!, 'uint16');
            pass.setBindGroup(0, this.cameraBindGroup!);
            pass.drawIndexed(mesh.getIndexCount());
        });
    }

    dispose(gfx: WebGFX): void {
        this.model?.destroy();
        this.cameraUniformBuffer?.destroy();
        this.modelUniformBuffer?.destroy();
    }

    update(gfx: WebGFX, deltaTime: number): void {

        if (this.modelUniformBuffer) {
            this.transform.setRotationEuler([0, performance.now() / 10, 0]);
            const modelMatrix = this.transform.getModelMatrix();
            const modelUniformData = new Float32Array([...modelMatrix]);
            this.modelUniformBuffer.update(modelUniformData, gfx);
        }
    }
}