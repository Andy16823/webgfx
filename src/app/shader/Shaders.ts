export function defaultShader(): string {
    return `

    struct VertexInput {
        @location(0) position: vec2f
    }

    struct Uniforms {
        color: vec4f
    }

    struct CameraUniforms {
        viewMatrix: mat4x4f,
        projectionMatrix: mat4x4f
    }

    struct ModelUniforms {
        modelMatrix: mat4x4f
    }

    @group(0) @binding(0)
    var<uniform> uniforms: Uniforms;

    @group(1) @binding(0)
    var<uniform> cameraUniforms: CameraUniforms;

    @group(1) @binding(1)
    var<uniform> modelUniforms: ModelUniforms;

    @vertex
    fn vs_main(input: VertexInput) -> @builtin(position) vec4f {
        let mvp = cameraUniforms.projectionMatrix * cameraUniforms.viewMatrix * modelUniforms.modelMatrix;

        let pos = input.position;
        return mvp * vec4f(pos, 0.0, 1.0);
    }

    @fragment
    fn fs_main() -> @location(0) vec4f {
        return uniforms.color;
    }
    `;
}