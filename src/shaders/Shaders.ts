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

export function fullscreenQuadShader(): string {
    return `
    struct VertexOutput {
        @builtin(position) position : vec4<f32>,
        @location(0) uv : vec2<f32>,
    };

    @group(0) @binding(0)
    var myTexture: texture_2d<f32>;

    @group(0) @binding(1)
    var mySampler: sampler;

    @vertex
    fn vs_main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
        var output : VertexOutput;
        var pos = array<vec2<f32>, 6>(
            vec2<f32>(-1.0, -1.0),
            vec2<f32>(1.0, -1.0),
            vec2<f32>(-1.0, 1.0),
            vec2<f32>(-1.0, 1.0),
            vec2<f32>(1.0, -1.0),
            vec2<f32>(1.0, 1.0)
        );

        var uv = array<vec2<f32>, 6>(
            vec2<f32>(0.0, 1.0),
            vec2<f32>(1.0, 1.0),
            vec2<f32>(0.0, 0.0),
            vec2<f32>(0.0, 0.0),
            vec2<f32>(1.0, 1.0),
            vec2<f32>(1.0, 0.0)
        );

        output.position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
        output.uv = uv[VertexIndex];
        return output;
    }

    @fragment
    fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
        let texColor = textureSample(myTexture, mySampler, input.uv);
        return texColor;
    }
    `;
}

export function textShader(): string {
    return `
    struct VertexInput {
        @location(0) position: vec2f,
        @location(2) uv: vec2f
    }

    struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv: vec2f,
    }

    struct CameraUniforms {
        viewMatrix: mat4x4f,
        projectionMatrix: mat4x4f
    }

    @group(0) @binding(0)
    var<uniform> cameraUniforms: CameraUniforms;

    @group(1) @binding(0)
    var fontTexture: texture_2d<f32>;

    @group(1) @binding(1)
    var fontSampler: sampler;

    @vertex
    fn vs_main(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;
        let worldPos = vec4f(input.position, 0.0, 1.0);
        output.position = cameraUniforms.projectionMatrix * cameraUniforms.viewMatrix * worldPos;
        output.uv = input.uv;
        return output;
    }

    @fragment
    fn fs_main(input: VertexOutput) -> @location(0) vec4f {
        let alpha = textureSample(fontTexture, fontSampler, input.uv).r;
        return vec4f(1.0, 1.0, 1.0, alpha);
    }
    `;
}

export function meshShader(): string {
    return `
    struct VertexInput {
        @location(0) position: vec3f,
        @location(1) normal: vec3f,
        @location(2) uv: vec2f,
        @location(3) tangent: vec4f
    }
    
    struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) normal: vec3f,
        @location(1) uv: vec2f,
        @location(2) fragPos: vec4f,
        @location(3) tangent: vec3f,
        @location(4) tangentSign: f32
    }

    struct CameraUniforms {
        viewMatrix: mat4x4f,
        projectionMatrix: mat4x4f,
        cameraPosition: vec4f
    }

    struct ModelUniforms {
        modelMatrix: mat4x4f
    }
    
    @group(0) @binding(0)
    var<uniform> cameraUniforms: CameraUniforms;

    @group(0) @binding(1)
    var<uniform> modelUniforms: ModelUniforms;

    @group(1) @binding(0)
    var albedoTexture: texture_2d<f32>;

    @group(1) @binding(1)
    var albedoSampler: sampler;

    @group(1) @binding(2)
    var normalTexture: texture_2d<f32>;

    @group(1) @binding(3)
    var normalSampler: sampler;

    @group(1) @binding(4)
    var metallicRoughnessTexture: texture_2d<f32>;

    @group(1) @binding(5)
    var metallicRoughnessSampler: sampler;

    @vertex
    fn vs_main(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;
        let mvp = cameraUniforms.projectionMatrix * cameraUniforms.viewMatrix * modelUniforms.modelMatrix;

        let worldPos = modelUniforms.modelMatrix * vec4f(input.position, 1.0);
        output.position = cameraUniforms.projectionMatrix *
                  cameraUniforms.viewMatrix *
                  worldPos;
        output.fragPos = worldPos;

        let worldNormal = normalize(
            (modelUniforms.modelMatrix * vec4f(input.normal, 0.0)).xyz
        );

        let worldTangent = normalize(
            (modelUniforms.modelMatrix * vec4f(input.tangent.xyz, 0.0)).xyz
        );

        output.normal = worldNormal;
        output.tangent = worldTangent;
        output.tangentSign = input.tangent.w;
        output.uv = input.uv;

        return output;
    }

    @fragment
    fn fs_main(input: VertexOutput) -> @location(0) vec4f {
        let albedoColor = textureSample(albedoTexture, albedoSampler, input.uv);
        let normalColor = textureSample(normalTexture, normalSampler, input.uv);
        let mr = textureSample(metallicRoughnessTexture, metallicRoughnessSampler, input.uv);

        let N = normalize(input.normal);
        let T = normalize(input.tangent);
        let B = normalize(cross(N, T) * input.tangentSign);
        let tangentNormal = normalize(normalColor.xyz * 2.0 - vec3f(1.0));
        let TBN = mat3x3f(T, B, N);
        let worldNormal = normalize(TBN * tangentNormal);

        let roughness = mr.g;
        let metallic = mr.b;
        let shininess = mix(128.0, 4.0, roughness);

        let viewDir = normalize(cameraUniforms.cameraPosition.xyz - input.fragPos.xyz);
        let norm = worldNormal;
        let lightDir = normalize(vec3f(0.5, 1.0, 0.3));
        let halfDir = normalize(lightDir + viewDir);
        let spec = pow(max(dot(norm, halfDir), 0.0), shininess);
        let specularStrength = mix(0.04, 1.0, metallic);
        let specular = specularStrength * spec * vec3f(1.0);
        let diff = max(dot(norm, lightDir), 0.0);
        let diffuse = diff * vec3f(1.0, 1.0, 1.0);

        let ambient = 0.1 * albedoColor.rgb;
        let result = ambient + diffuse * albedoColor.rgb + specular;
        return vec4f(result, 1.0);
    }
    `;
}