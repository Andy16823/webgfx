import { WebGFX } from "@/core/WebGFX";

/**
 * VertexBindingPoint interface represents the binding point for vertex shaders in a render pipeline.
 */
interface VertexBindingPoint {
    module: GPUShaderModule;
    entryPoint: string;
    buffers: GPUVertexBufferLayout[];
}

/**
 * FragmentBindingPoint interface represents the binding point for fragment shaders in a render pipeline.
 */
interface FragmentBindingPoint {
    module: GPUShaderModule;
    entryPoint: string;
    blend?: GPUBlendState;
}

/**
 * PipelineDescriptor interface represents the descriptor for creating a render pipeline, including vertex and fragment shader binding points and primitive state.
 */
interface PipelineDescriptor {
    vertex: VertexBindingPoint;
    fragment: FragmentBindingPoint;
    primitive: GPUPrimitiveState;
    depthStencil: GPUDepthStencilState;
}

/**
 * PipelineBuilder function creates a GPURenderPipeline based on the provided PipelineDescriptor and WebGFX instance.
 * @param pipelineDescriptor - The descriptor containing vertex and fragment shader binding points and primitive state.
 * @param gfx - The WebGFX instance used to create the render pipeline.
 * @returns A GPURenderPipeline created based on the provided descriptor and WebGFX instance.
 */
export default function PipelineBuilder(pipelineDescriptor: PipelineDescriptor, gfx: WebGFX): GPURenderPipeline {
    return gfx.device.createRenderPipeline({
        layout: 'auto',
        depthStencil: pipelineDescriptor.depthStencil,
        vertex: {
            module: pipelineDescriptor.vertex.module,
            entryPoint: pipelineDescriptor.vertex.entryPoint,
            buffers: pipelineDescriptor.vertex.buffers
        },
        fragment: {
            module: pipelineDescriptor.fragment.module,
            entryPoint: pipelineDescriptor.fragment.entryPoint,
            targets: [{
                format: gfx.format,
                blend: pipelineDescriptor.fragment.blend
            }]
        },
        primitive: pipelineDescriptor.primitive
    });
}