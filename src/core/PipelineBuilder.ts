import { WebGFX } from "@/core/WebGFX";

interface VertexBindingPoint {
    module: GPUShaderModule;
    entryPoint: string;
    buffers: GPUVertexBufferLayout[];
}

interface FragmentBindingPoint {
    module: GPUShaderModule;
    entryPoint: string;
}

interface PipelineDescriptor {
    vertex: VertexBindingPoint;
    fragment: FragmentBindingPoint;
    primitive: GPUPrimitiveState;
}

export default function PipelineBuilder(pipelineDescriptor: PipelineDescriptor, gfx: WebGFX): GPURenderPipeline {
    return gfx.device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: pipelineDescriptor.vertex.module,
            entryPoint: pipelineDescriptor.vertex.entryPoint,
            buffers: pipelineDescriptor.vertex.buffers
        },
        fragment: {
            module: pipelineDescriptor.fragment.module,
            entryPoint: pipelineDescriptor.fragment.entryPoint,
            targets: [{
                format: gfx.format
            }]
        },
        primitive: pipelineDescriptor.primitive
    });
}