import { mat4, vec2, vec3, vec4, quat } from 'gl-matrix';
import * as react from 'react';

declare class WebGFX {
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
    depthTexture: GPUTexture;
    constructor(device: GPUDevice, context: GPUCanvasContext, format: GPUTextureFormat, depthTexture: GPUTexture);
    /**
     * Creates a new instance of WebGFX by initializing the GPU device and context for the provided canvas.
     * @param canvas The HTMLCanvasElement to be used for rendering.
     * @returns A promise that resolves to a new instance of WebGFX.
     */
    static create(canvas: HTMLCanvasElement): Promise<WebGFX>;
    /**
     * Begins a new frame by creating a command encoder and starting a render pass.
     * @returns An object containing the command encoder and render pass encoder for the current frame.
     */
    beginFrame(): {
        encoder: GPUCommandEncoder;
        renderPass: GPURenderPassEncoder;
    };
    /**
     * Ends the current frame by ending the render pass and submitting the command buffer to the GPU queue.
     * @param encoder The command encoder used to record GPU commands for the current frame.
     * @param renderPass The render pass encoder used to record rendering commands for the current frame.
     */
    endFrame(encoder: GPUCommandEncoder, renderPass: GPURenderPassEncoder): void;
    /**
     * Creates a GPU shader module from the provided shader code.
     * @param code The shader code in WGSL (WebGPU Shading Language) format.
     * @returns A GPUShaderModule that can be used to create a render pipeline.
     */
    createShaderModule(code: string): GPUShaderModule;
    createPipeline(shaderModule: GPUShaderModule): GPURenderPipeline;
}

/**
 * Scene interface represents a 3D scene in the WebGFX framework.
 * It defines methods for initializing, updating, rendering, and disposing of the scene.
 * Implementing classes should provide concrete implementations for these methods to manage the scene's lifecycle.
 */
interface Scene {
    initialize(gfx: WebGFX): Promise<void>;
    update(gfx: WebGFX, deltaTime: number): void;
    render(gfx: WebGFX, pass: GPURenderPassEncoder): void;
    dispose(gfx: WebGFX): void;
}

/**
 * Camera interface defines the methods that any camera class should implement to provide view and projection matrices.
 */
interface Camera {
    getViewMatrix(): mat4;
    getProjectionMatrix(): mat4;
}
/**
 * PerspectiveCamera class represents a camera in 3D space with perspective projection.
 * It provides methods to get the view and projection matrices based on the camera's position, rotation, and other parameters.
 */
declare class PerspectiveCamera implements Camera {
    private position;
    private rotation;
    private aspect;
    private near;
    private far;
    private fov;
    /**
     * Creates a new PerspectiveCamera instance.
     * @param position - The position of the camera in 3D space.
     * @param aspect - The aspect ratio of the camera's view (width / height).
     * @param near - The near clipping plane distance.
     * @param far - The far clipping plane distance.
     * @param fov - The field of view in degrees (default is 45 degrees).
     */
    constructor(position: vec3, aspect: number, near?: number, far?: number, fov?: number);
    /**
     * Returns the up vector of the camera in world space, calculated based on the camera's rotation.
     * @returns A vec3 representing the up direction of the camera.
     */
    getCameraUp(): vec3;
    /**
     * Returns the right vector of the camera in world space, calculated based on the camera's rotation.
     * @returns A vec3 representing the right direction of the camera.
     */
    getCameraRight(): vec3;
    /**
     * Returns the front vector of the camera in world space, calculated based on the camera's rotation.
     * @returns A vec3 representing the front direction of the camera.
     */
    getCameraFront(): vec3;
    getCameraPosition(): vec3;
    getCameraPositionVec4(): vec4;
    setCameraPosition(position: vec3): void;
    setCameraRotation(rotation: quat): void;
    lookAt(target: vec3): void;
    /**
     * Returns the view matrix of the camera, which transforms world coordinates into camera space.
     * @returns A mat4 representing the view matrix of the camera.
     */
    getViewMatrix(): mat4;
    /**
     * Returns the projection matrix of the camera, which defines how 3D points are projected onto the 2D screen.
     * @returns A mat4 representing the projection matrix of the camera.
     */
    getProjectionMatrix(): mat4;
}
/**
 * OrthographicCamera class represents a camera in 2D space with orthographic projection.
 * It provides methods to get the view and projection matrices based on the camera's position and resolution.
 */
declare class OrthographicCamera implements Camera {
    private position;
    private resolution;
    private near;
    private far;
    /**
     * Creates an instance of OrthographicCamera.
     * @param position - The position of the camera in 2D space.
     * @param resolution - The resolution of the camera's view.
     * @param near - The near clipping plane distance (default is -1).
     * @param far - The far clipping plane distance (default is 1).
     */
    constructor(position: vec2, resolution: vec2, near?: number, far?: number);
    /**
     * Returns the view matrix of the orthographic camera, which transforms world coordinates into camera space.
     * @returns A mat4 representing the view matrix of the orthographic camera.
     */
    getViewMatrix(): mat4;
    /**
     * Returns the projection matrix of the orthographic camera, which defines how 2D points are projected onto the screen.
     * @returns A mat4 representing the projection matrix of the orthographic camera.
     */
    getProjectionMatrix(): mat4;
}

/**
 * Class representing a transform in 3D space, including position, rotation, and scale.
 */
declare class Transform {
    private position;
    private rotation;
    private scale;
    /**
     * Creates an instance of Transform.
     * @param position - The initial position of the transform.
     * @param rotation - The initial rotation of the transform as a quaternion.
     * @param scale - The initial scale of the transform.
     */
    constructor(position?: vec3, rotation?: quat, scale?: vec3);
    /**
     * Returns the position of the transform.
     * @returns The position as a vec3.
     */
    getPosition(): vec3;
    /**
     * Sets the position of the transform.
     * @param position - The new position as a vec3.
     */
    setPosition(position: vec3): void;
    /**
     * Returns the rotation of the transform as a quaternion.
     * @returns The rotation as a quat.
     */
    getRotation(): quat;
    /**
     * Returns the rotation of the transform as Euler angles in degrees.
     * @returns The rotation as a vec3 representing Euler angles (pitch, yaw, roll).
     */
    getRotationEuler(): vec3;
    /**
     * Sets the rotation of the transform as a quaternion.
     * @param rotation - The new rotation as a quat.
     */
    setRotation(rotation: quat): void;
    /**
     * Sets the rotation of the transform using Euler angles in degrees.
     * @param euler - The new rotation as a vec3 representing Euler angles (pitch, yaw, roll).
     */
    setRotationEuler(euler: vec3): void;
    /**
     * Returns the scale of the transform.
     * @returns The scale as a vec3.
     */
    getScale(): vec3;
    /**
     * Sets the scale of the transform.
     * @param scale - The new scale as a vec3.
     */
    setScale(scale: vec3): void;
    /**
     * Returns the model matrix of the transform.
     * @returns The model matrix as a mat4.
     */
    getModelMatrix(): mat4;
}

/**
 * Interface representing a GPU buffer.
 */
interface GFXBuffer {
    buffer: GPUBuffer;
    size: number;
    usage: GPUBufferUsageFlags;
    mappedAtCreation: boolean;
    update(data: Float32Array | Uint32Array, gfx: WebGFX): void;
    destroy(): void;
}

/**
 * Class representing a GPU array buffer.
 * It implements the Buffer interface and provides methods to create, update, and destroy GPU buffers.
 */
declare class GFXArrayBuffer implements GFXBuffer {
    buffer: GPUBuffer;
    size: number;
    usage: GPUBufferUsageFlags;
    mappedAtCreation: boolean;
    /**
     * Creates an instance of GFXArrayBuffer.
     * @param data - The initial data to populate the buffer with. It can be a Float32Array or Uint32Array.
     * @param usage - The usage flags for the GPU buffer, indicating how the buffer will be used (e.g., vertex buffer, index buffer).
     * @param gfx - The WebGFX instance used to create the GPU buffer.
     */
    constructor(data: Float32Array<ArrayBuffer> | Uint32Array<ArrayBuffer>, usage: GPUBufferUsageFlags, gfx: WebGFX);
    /**
     * Updates the contents of the GPU buffer with new data.
     * @param data - The new data to write into the buffer. It can be a Float32Array or Uint32Array.
     * @param gfx - The WebGFX instance used to access the GPU device and queue for writing the buffer.
     */
    update(data: Float32Array<ArrayBuffer> | Uint32Array<ArrayBuffer>, gfx: WebGFX): void;
    /**
     * Destroys the GPU buffer, releasing its resources.
     * This method should be called when the buffer is no longer needed to free up GPU memory.
     */
    destroy(): void;
}

/**
 * Class representing a 3D mesh, which consists of vertex and index buffers.
 * It provides methods to set the vertex and index buffers, retrieve their information, and destroy the mesh.
 */
declare class GFXMesh {
    private name;
    private vertexBuffer;
    private indexBuffer;
    private indexCount;
    private materialIndex;
    private position;
    private rotation;
    private scale;
    /**
     * Creates an instance of GFXMesh with the specified name.
     * @param name - The name of the mesh, used for identification purposes.
     */
    constructor(name: string);
    /**
     * Sets the vertex buffer for the GFXMesh.
     * @param vertexBuffer - The GFXArrayBuffer containing the vertex data.
     */
    setVertexBuffer(vertexBuffer: GFXArrayBuffer): void;
    /**
     * Sets the index buffer for the GFXMesh.
     * @param indexBuffer - The GFXArrayBuffer containing the index data.
     * @param indexCount - The number of indices in the buffer.
     */
    setIndexBuffer(indexBuffer: GFXArrayBuffer, indexCount: number): void;
    /**
     * Returns the number of indices in the index buffer.
     * @returns The number of indices.
     */
    getIndexCount(): number;
    /**
     * Returns the vertex buffer of the mesh.
     * @returns The GFXArrayBuffer containing the vertex data, or null if not set.
     */
    getVertexBuffer(): GFXArrayBuffer | null;
    /**
     * Returns the index buffer of the mesh.
     * @returns The GFXArrayBuffer containing the index data, or null if not set.
     */
    getIndexBuffer(): GFXArrayBuffer | null;
    /**
     * Gets the material index associated with this mesh.
     * @returns The index of the material used by this mesh.
     */
    getMaterialIndex(): number;
    /**
     * Sets the material index for this mesh.
     * @param index - The index of the material to be associated with this mesh.
     */
    setMaterialIndex(index: number): void;
    /**
     * Sets the position of the mesh in 3D space.
     * @param position - A vec3 representing the new position of the mesh.
     */
    setPosition(position: vec3): void;
    /**
     * Sets the rotation of the mesh in 3D space.
     * @param rotation - A quat representing the new rotation of the mesh.
     */
    setRotation(rotation: quat): void;
    /**
     * Sets the scale of the mesh in 3D space.
     * @param scale - A vec3 representing the new scale of the mesh.
     */
    setScale(scale: vec3): void;
    /**
     * Gets the position of the mesh in 3D space.
     * @returns A vec3 representing the position of the mesh.
     */
    getPosition(): vec3;
    /**
     * Gets the rotation of the mesh in 3D space.
     * @returns A quat representing the rotation of the mesh.
     */
    getRotation(): quat;
    /**
     * Gets the scale of the mesh in 3D space.
     * @returns A vec3 representing the scale of the mesh.
     */
    getScale(): vec3;
    /**
     * Computes and returns the model matrix for the mesh based on its position, rotation, and scale.
     * @returns A mat4 representing the model matrix of the mesh.
     */
    getMeshMatrix(): mat4;
    /**
     * Destroys the mesh and releases its resources.
     */
    destroy(): void;
}

/**
 * Class representing a GPU texture in the WebGFX framework.
 */
declare class GFXTexture {
    private texture;
    private textureView;
    private sampler;
    /**
     * Creates an instance of Texture.
     * @param gfx - The WebGFX instance used to create the GPU texture.
     * @param imageBitmap - The HTMLImageElement or ImageBitmap used to populate the texture.
     */
    constructor(texture: GPUTexture, textureView: GPUTextureView, sampler: GPUSampler);
    static fromImage(gfx: WebGFX, image: ImageBitmap | HTMLImageElement): GFXTexture;
    static fromColor(gfx: WebGFX, width: number, height: number, color: [number, number, number, number]): GFXTexture;
    /**
     * Returns the GPUTextureView associated with this texture.
     * @returns The GPUTextureView of the texture.
     */
    getTextureView(): GPUTextureView;
    /**
     * Returns the GPUSampler associated with this texture.
     * @returns The GPUSampler of the texture.
     */
    getSampler(): GPUSampler;
    /**
     * Returns the GPUTexture associated with this texture.
     * @returns The GPUTexture of the texture.
     */
    getTexture(): GPUTexture;
    /**
     * Destroys the texture and releases its resources.
     */
    destroy(): void;
}

/**
 * Interface representing a material in the WebGFX framework.
 * A material defines how a mesh is rendered, including its textures and properties.
 */
interface GFXMaterialInterface {
    createBindGroups(gfx: WebGFX, pipeline: GPURenderPipeline, groupIndex: number): void;
    bindMaterial(pass: GPURenderPassEncoder, groupIndex: number): void;
    destroy(): void;
}
/**
 * Class representing a material in the WebGFX framework.
 */
declare class GFXMaterial implements GFXMaterialInterface {
    name: string;
    albedoTexture: GFXTexture | null;
    normalTexture: GFXTexture | null;
    metallicRoughnessTexture: GFXTexture | null;
    private materialBindGroup;
    private groupIndex;
    /**
     * Creates an instance of Material with the specified name.
     * @param name - The name of the material.
     */
    constructor(name: string);
    /**
     * Creates bind groups for the material's textures and associates them with the specified pipeline and group index.
     * The material creates a single bind group that contains the albedo, normal, and metallic-roughness textures along with their samplers.
     * For custom binding groups you can create your own bind group and bind it in the render pass.
     * @param gfx - The WebGFX instance used to create the bind groups.
     * @param pipeline - The GPURenderPipeline to which the bind groups will be associated.
     * @param groupIndex - The index of the bind group layout in the pipeline.
     */
    createBindGroups(gfx: WebGFX, pipeline: GPURenderPipeline, groupIndex: number): void;
    /**
     * Binds the material's bind group to the specified render pass encoder and group index.
     * @param pass - The GPURenderPassEncoder to which the bind group will be bound.
     */
    bindMaterial(pass: GPURenderPassEncoder): void;
    /**
     * Sets the albedo texture for the material.
     * @param texture - The GFXTexture object representing the albedo texture.
     */
    setAlbedoTexture(texture: GFXTexture): void;
    /**
     * Sets the normal texture for the material.
     * @param texture - The GFXTexture object representing the normal texture.
     */
    setNormalTexture(texture: GFXTexture): void;
    /**
     * Sets the metallic-roughness texture for the material.
     * @param texture - The GFXTexture object representing the metallic-roughness texture.
     */
    setMetallicRoughnessTexture(texture: GFXTexture): void;
    /**
     * Returns the albedo texture associated with this material.
     * @returns The GFXTexture object representing the albedo texture, or null if not set.
     */
    getAlbedoTexture(): GFXTexture | null;
    /**
     * Returns the normal texture associated with this material.
     * @returns The GFXTexture object representing the normal texture, or null if not set.
     */
    getNormalTexture(): GFXTexture | null;
    /**
     * Returns the metallic-roughness texture associated with this material.
     * @returns The GFXTexture object representing the metallic-roughness texture, or null if not set.
     */
    getMetallicRoughnessTexture(): GFXTexture | null;
    /**
     * Destroys the material and releases its associated resources.
     */
    destroy(): void;
}

/**
 * Class representing a 3D model, which consists of multiple meshes.
 * It provides methods to manage the meshes and destroy the model when it is no longer needed.
 */
declare class GFXModel {
    meshes: GFXMesh[];
    materials: GFXMaterial[];
    /**
     * Creates an instance of GFXModel with the specified array of meshes and materials.
     * @param meshes - An array of GFXMesh objects that make up the model.
     * @param materials - An array of GFXMaterial objects that are used by the model's meshes.
     */
    constructor(meshes: GFXMesh[], materials: GFXMaterial[]);
    /**
     * Creates bind groups for all materials in the model and associates them with the specified pipeline and group index.
     * This method iterates through each material in the model and calls its createBindGroups method.
     * @param gfx - The WebGFX instance used to create the bind groups.
     * @param pipeline - The GPURenderPipeline to which the bind groups will be associated.
     * @param groupIndex - The index of the bind group layout in the pipeline.
     */
    createBindGroups(gfx: WebGFX, pipeline: GPURenderPipeline, groupIndex: number): void;
    /**
     * Destroys the model and releases its resources by destroying all associated meshes and materials.
     * This method should be called when the model is no longer needed to free up GPU memory.
     */
    destroy(): void;
}

/**
 * Class representing a GLTF buffer, which contains the URI and byte length of the buffer data.
 */
declare class GLTFBuffer {
    uri: string;
    byteLength: number;
    buffer?: ArrayBuffer;
    constructor(uri: string, byteLength: number);
}
/**
 * Class responsible for loading GLTF models and parsing their data into Mesh objects.
 * It provides methods to load GLTF files, read buffer data, and parse nodes into meshes.
 */
declare class GLTFLoader {
    /**
     * Loads a GLTF model from the specified URL and returns a Model object containing the parsed meshes.
     * @param url - The URL of the GLTF file to load.
     * @param gfx - The WebGFX instance used for creating GPU buffers.
     * @returns A Promise that resolves to a Model object containing the parsed meshes.
     */
    load(url: string, gfx: WebGFX): Promise<GFXModel>;
    /**
     * Reads the buffer data from the GLTF file and returns an array of GLTFBuffer objects containing the loaded data.
     * @param gltf - The parsed GLTF JSON object.
     * @param basePath - The base path for resolving buffer URIs.
     * @returns A Promise that resolves to an array of GLTFBuffer objects containing the loaded buffer data.
     */
    readBuffers(gltf: any, basePath: string): Promise<GLTFBuffer[]>;
    /**
     * Reads the materials from the GLTF file and returns an array of Material objects containing the loaded textures.
     * @param gltf - The parsed GLTF JSON object.
     * @param basePath - The base path for resolving texture URIs.
     * @param gfx - The WebGFX instance used for creating GPU textures.
     * @returns A Promise that resolves to an array of Material objects containing the loaded textures.
     * ------
     * remark: Every texture slots must be filled with a texture, if the gltf file does not have a texture for a slot,
     * a default texture will be created and used for that slot.
     */
    readMaterials(gltf: any, basePath: string, gfx: WebGFX): Promise<GFXMaterial[]>;
    /**
     * Parses the nodes in the GLTF file and creates Mesh objects for each node, using the provided buffer data.
     * @param gltf - The parsed GLTF JSON object.
     * @param buffers - An array of GLTFBuffer objects containing the loaded buffer data.
     * @param gfx - The WebGFX instance used for creating GPU buffers.
     * @returns An array of Mesh objects created from the parsed nodes in the GLTF file.
     */
    parseNodes(gltf: any, buffers: GLTFBuffer[], gfx: WebGFX): GFXMesh[];
}

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
declare function PipelineBuilder(pipelineDescriptor: PipelineDescriptor, gfx: WebGFX): GPURenderPipeline;

/**
 * MeshBuilder is a utility class for constructing 3D meshes by accumulating vertex and index data.
 * It provides methods to add vertices, triangles, and quads, and finally build a GFXMesh object.
 * The builder maintains internal arrays for vertices and indices, which are used to create GPU buffers.
 */
declare class MeshBuilder {
    private vertices;
    private indices;
    private vertexCount;
    /**
     * Adds a vertex to the mesh.
     * @param position - The position of the vertex as a vec3.
     * @param normal - The normal of the vertex as a vec3.
     * @param uv - The texture coordinates of the vertex as a vec2.
     * @param tangent - The tangent of the vertex as a vec4.
     */
    addVertex4(position: vec3, normal: vec3, uv: vec2, tangent: vec4): void;
    /**
     * Adds a vertex to the mesh with a default tangent value.
     * @param position - The position of the vertex as a vec3.
     * @param normal - The normal of the vertex as a vec3.
     * @param uv - The texture coordinates of the vertex as a vec2.
     */
    addVertex3(position: vec3, normal: vec3, uv: vec2): void;
    /**
     * Adds a vertex to the mesh with a default normal and tangent value.
     * @param position - The position of the vertex as a vec3.
     * @param uv - The texture coordinates of the vertex as a vec2.
     */
    addVertex2(position: vec3, uv: vec2): void;
    /**
     * Adds a triangle to the mesh by specifying the indices of its vertices.
     * @param i0 - The index of the first vertex.
     * @param i1 - The index of the second vertex.
     * @param i2 - The index of the third vertex.
     */
    addTriangle(i0: number, i1: number, i2: number): void;
    /**
     * Adds a quad to the mesh by specifying the indices of its vertices.
     * @param i0 - The index of the first vertex.
     * @param i1 - The index of the second vertex.
     * @param i2 - The index of the third vertex.
     * @param i3 - The index of the fourth vertex.
     */
    addQuad(i0: number, i1: number, i2: number, i3: number): void;
    /**
     * Builds a GFXMesh from the accumulated vertices and indices.
     * @param name - The name of the mesh.
     * @param gfx - The WebGFX instance used to create the mesh buffers.
     * @returns A GFXMesh instance containing the vertex and index buffers.
     */
    buildMesh(name: string, gfx: WebGFX): GFXMesh;
}

/**
 * ViewportMode defines the rendering mode for the Viewport component.
 * Continuous: The renderer continuously updates and renders frames.
 * OnDemand: The renderer only updates and renders frames when the invalidateSignal changes.
 */
declare enum ViewportMode {
    Continuous = 0,
    OnDemand = 1
}
/**
 * ViewportProps defines the properties for the Viewport component.
 * - renderer: The Renderer instance responsible for rendering the scene.
 * - invalidateSignal: An optional signal that triggers a re-render when it changes.
 * - width: The width of the canvas in pixels (default is 800).
 * - height: The height of the canvas in pixels (default is 600).
 * - mode: The rendering mode for the viewport (default is OnDemand).
 */
interface ViewportProps {
    scene: Scene;
    invalidateSignal?: number;
    width?: number;
    height?: number;
    mode?: ViewportMode;
    onKeyDown?: (event: KeyboardEvent) => void;
    onMouseMove?: (event: MouseEvent, relativeX: number, relativeY: number) => void;
    onMouseDown?: (event: MouseEvent, relativeX: number, relativeY: number) => void;
}
/**
 * Viewport is a React component that provides a canvas for rendering graphics using WebGFX and a specified Renderer.
 * @param param0 - The properties for the Viewport component, including the renderer, invalidateSignal, width, height, and mode.
 * @returns A canvas element that serves as the rendering surface for the specified Scene.
 */
declare function Viewport({ scene, invalidateSignal, width, height, mode, onKeyDown, onMouseMove, onMouseDown }: ViewportProps): react.JSX.Element;

/**
 * Converts degrees to radians.
 * @param degrees - The angle in degrees.
 * @returns The angle in radians.
 */
declare function getRadians(degrees: number): number;
/**
 * Converts a quaternion to Euler angles (in radians).
 * @param out - The output vector to store the Euler angles.
 * @param quat - The input quaternion to convert.
 * @returns The output vector containing the Euler angles (pitch, yaw, roll).
 */
declare function quatToEuler(out: vec3, quat: quat): vec3;
/**
 * Returns the parent path of a given file path.
 * @param path - The file path to extract the parent path from.
 * @returns The parent path of the given file path. If there is no parent, returns an empty string.
 */
declare function getParentPath(path: string): string;
declare function getDefaultAlbedoColor(): [number, number, number, number];
declare function getDefaultNormalColor(): [number, number, number, number];
declare function getDefaultMetallicRoughnessColor(): [number, number, number, number];

declare function defaultShader(): string;
declare function meshShader(): string;

export { GFXArrayBuffer, type GFXBuffer, GLTFLoader, GFXMaterial as Material, GFXMesh as Mesh, MeshBuilder, GFXModel as Model, OrthographicCamera, PerspectiveCamera, PipelineBuilder, type Scene, GFXTexture as Texture, Transform, Viewport, ViewportMode, WebGFX, defaultShader, getDefaultAlbedoColor, getDefaultMetallicRoughnessColor, getDefaultNormalColor, getParentPath, getRadians, meshShader, quatToEuler };
