export function defaultShader(): string {
    return `

    struct VertexInput {
        @location(0) position: vec2f,
        @location(1) uv: vec2f
    }

    struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv: vec2f
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

    @group(2) @binding(0)
    var myTexture: texture_2d<f32>;

    @group(2) @binding(1)
    var mySampler: sampler;

    @vertex
    fn vs_main(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;
        let mvp = cameraUniforms.projectionMatrix * cameraUniforms.viewMatrix * modelUniforms.modelMatrix;

        let pos = input.position;
        output.position = mvp * vec4f(pos, 0.0, 1.0);
        output.uv = input.uv;
        return output;
    }

    @fragment
    fn fs_main(input: VertexOutput) -> @location(0) vec4f {
        let uniformColor = uniforms.color;
        let texColor = textureSample(myTexture, mySampler, input.uv);
        return uniformColor * texColor;
    }
    `;
}