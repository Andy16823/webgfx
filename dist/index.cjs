"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  GFXArrayBuffer: () => GFXArrayBuffer,
  GFXRenderTarget: () => GFXRenderTarget,
  GLTFLoader: () => GLTFLoader,
  Material: () => GFXMaterial,
  Mesh: () => GFXMesh,
  MeshBuilder: () => MeshBuilder,
  Model: () => GFXModel,
  OrthographicCamera: () => OrthographicCamera,
  PerspectiveCamera: () => PerspectiveCamera,
  PipelineBuilder: () => PipelineBuilder,
  Texture: () => GFXTexture,
  Transform: () => Transform,
  Viewport: () => Viewport,
  ViewportMode: () => ViewportMode,
  WebGFX: () => WebGFX,
  defaultShader: () => defaultShader,
  fullscreenQuadShader: () => fullscreenQuadShader,
  getDefaultAlbedoColor: () => getDefaultAlbedoColor,
  getDefaultMetallicRoughnessColor: () => getDefaultMetallicRoughnessColor,
  getDefaultNormalColor: () => getDefaultNormalColor,
  getParentPath: () => getParentPath,
  getRadians: () => getRadians,
  meshShader: () => meshShader,
  quatToEuler: () => quatToEuler
});
module.exports = __toCommonJS(index_exports);

// src/core/WebGFX.ts
var WebGFX = class _WebGFX {
  constructor(device, context, format, depthTexture) {
    this.device = device;
    this.context = context;
    this.format = format;
    this.depthTexture = depthTexture;
  }
  /**
   * Creates a new instance of WebGFX by initializing the GPU device and context for the provided canvas.
   * @param canvas The HTMLCanvasElement to be used for rendering.
   * @returns A promise that resolves to a new instance of WebGFX.
   */
  static async create(canvas) {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not supported in this browser.");
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("Failed to get GPU adapter.");
    }
    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");
    if (!context) {
      throw new Error("Failed to get WebGPU context.");
    }
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format,
      alphaMode: "opaque"
    });
    const depthTexture = device.createTexture({
      size: [canvas.width, canvas.height],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT
    });
    return new _WebGFX(device, context, format, depthTexture);
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
        loadOp: "clear",
        storeOp: "store"
      }],
      depthStencilAttachment: {
        view: this.depthTexture.createView(),
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    });
    return { encoder, renderPass };
  }
  /**
   * Ends the current frame by ending the render pass and submitting the command buffer to the GPU queue.
   * @param encoder The command encoder used to record GPU commands for the current frame.
   * @param renderPass The render pass encoder used to record rendering commands for the current frame.
   */
  endFrame(encoder, renderPass) {
    renderPass.end();
    this.device.queue.submit([encoder.finish()]);
  }
  /**
   * Creates a GPU shader module from the provided shader code.
   * @param code The shader code in WGSL (WebGPU Shading Language) format.
   * @returns A GPUShaderModule that can be used to create a render pipeline.
   */
  createShaderModule(code) {
    return this.device.createShaderModule({ code });
  }
  createPipeline(shaderModule) {
    return this.device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: [{
          arrayStride: 2 * 4,
          // 2 floats per vertex, 4 bytes per float
          attributes: [{
            shaderLocation: 0,
            offset: 0,
            format: "float32x2"
          }]
        }]
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{
          format: this.format
        }]
      },
      primitive: {
        topology: "triangle-list"
      }
    });
  }
};

// src/core/Camera.ts
var import_gl_matrix = require("gl-matrix");

// src/core/Utils.ts
function getRadians(degrees) {
  return degrees * (Math.PI / 180);
}
function quatToEuler(out, quat5) {
  let x = quat5[0], y = quat5[1], z = quat5[2], w = quat5[3];
  let x2 = x * x, y2 = y * y, z2 = z * z, w2 = w * w;
  let unit = x2 + y2 + z2 + w2;
  let test = x * w - y * z;
  if (test > 0.499995 * unit) {
    out[0] = Math.PI / 2;
    out[1] = 2 * Math.atan2(y, x);
    out[2] = 0;
  } else if (test < -0.499995 * unit) {
    out[0] = -Math.PI / 2;
    out[1] = 2 * Math.atan2(y, x);
    out[2] = 0;
  } else {
    out[0] = Math.asin(2 * (x * z - w * y));
    out[1] = Math.atan2(2 * (x * w + y * z), 1 - 2 * (z2 + w2));
    out[2] = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y2 + z2));
  }
  return out;
}
function getParentPath(path) {
  const lastSlashIndex = path.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return "";
  }
  return path.substring(0, lastSlashIndex);
}
function getDefaultAlbedoColor() {
  return [255, 255, 255, 255];
}
function getDefaultNormalColor() {
  return [128, 128, 255, 255];
}
function getDefaultMetallicRoughnessColor() {
  return [255, 255, 255, 255];
}

// src/core/Camera.ts
var WORLD_FRONT = import_gl_matrix.vec3.fromValues(0, 0, -1);
var WORLD_UP = import_gl_matrix.vec3.fromValues(0, 1, 0);
var WORLD_RIGHT = import_gl_matrix.vec3.fromValues(1, 0, 0);
var PerspectiveCamera = class {
  /**
   * Creates a new PerspectiveCamera instance.
   * @param position - The position of the camera in 3D space.
   * @param aspect - The aspect ratio of the camera's view (width / height).
   * @param near - The near clipping plane distance.
   * @param far - The far clipping plane distance.
   * @param fov - The field of view in degrees (default is 45 degrees).
   */
  constructor(position, aspect, near = 0.1, far = 1e3, fov = 45) {
    this.position = position;
    this.rotation = import_gl_matrix.quat.create();
    this.aspect = aspect;
    this.fov = fov;
    this.near = near;
    this.far = far;
  }
  /**
   * Returns the up vector of the camera in world space, calculated based on the camera's rotation.
   * @returns A vec3 representing the up direction of the camera.
   */
  getCameraUp() {
    return import_gl_matrix.vec3.transformQuat(import_gl_matrix.vec3.create(), WORLD_UP, this.rotation);
  }
  /**
   * Returns the right vector of the camera in world space, calculated based on the camera's rotation.
   * @returns A vec3 representing the right direction of the camera.
   */
  getCameraRight() {
    return import_gl_matrix.vec3.transformQuat(import_gl_matrix.vec3.create(), WORLD_RIGHT, this.rotation);
  }
  /**
   * Returns the front vector of the camera in world space, calculated based on the camera's rotation.
   * @returns A vec3 representing the front direction of the camera.
   */
  getCameraFront() {
    return import_gl_matrix.vec3.transformQuat(import_gl_matrix.vec3.create(), WORLD_FRONT, this.rotation);
  }
  getCameraPosition() {
    return this.position;
  }
  getCameraPositionVec4() {
    return import_gl_matrix.vec4.fromValues(this.position[0], this.position[1], this.position[2], 1);
  }
  setCameraPosition(position) {
    this.position = position;
  }
  setCameraRotation(rotation) {
    this.rotation = rotation;
  }
  lookAt(target) {
    const direction = import_gl_matrix.vec3.normalize(import_gl_matrix.vec3.create(), import_gl_matrix.vec3.subtract(import_gl_matrix.vec3.create(), target, this.position));
    let up = import_gl_matrix.vec3.fromValues(0, 1, 0);
    if (Math.abs(import_gl_matrix.vec3.dot(direction, up)) > 0.999) {
      up = import_gl_matrix.vec3.fromValues(0, 0, 1);
    }
    const right = import_gl_matrix.vec3.normalize(import_gl_matrix.vec3.create(), import_gl_matrix.vec3.cross(import_gl_matrix.vec3.create(), up, direction));
    const newUp = import_gl_matrix.vec3.cross(import_gl_matrix.vec3.create(), direction, right);
    this.rotation = import_gl_matrix.quat.fromMat3(import_gl_matrix.quat.create(), import_gl_matrix.mat3.fromValues(
      right[0],
      right[1],
      right[2],
      newUp[0],
      newUp[1],
      newUp[2],
      direction[0],
      direction[1],
      direction[2]
    ));
  }
  /**
   * Returns the view matrix of the camera, which transforms world coordinates into camera space.
   * @returns A mat4 representing the view matrix of the camera.
   */
  getViewMatrix() {
    const viewMatrix = import_gl_matrix.mat4.create();
    const front = this.getCameraFront();
    const target = import_gl_matrix.vec3.add(import_gl_matrix.vec3.create(), this.position, front);
    import_gl_matrix.mat4.lookAt(viewMatrix, this.position, target, this.getCameraUp());
    return viewMatrix;
  }
  /**
   * Returns the projection matrix of the camera, which defines how 3D points are projected onto the 2D screen.
   * @returns A mat4 representing the projection matrix of the camera.
   */
  getProjectionMatrix() {
    const projectionMatrix = import_gl_matrix.mat4.create();
    import_gl_matrix.mat4.perspective(projectionMatrix, getRadians(this.fov), this.aspect, this.near, this.far);
    return projectionMatrix;
  }
};
var OrthographicCamera = class {
  /**
   * Creates an instance of OrthographicCamera.
   * @param position - The position of the camera in 2D space.
   * @param resolution - The resolution of the camera's view.
   * @param near - The near clipping plane distance (default is -1).
   * @param far - The far clipping plane distance (default is 1).
   */
  constructor(position, resolution, near = -1, far = 1) {
    this.position = position;
    this.resolution = resolution;
    this.near = near;
    this.far = far;
  }
  /**
   * Returns the view matrix of the orthographic camera, which transforms world coordinates into camera space.
   * @returns A mat4 representing the view matrix of the orthographic camera.
   */
  getViewMatrix() {
    const viewMatrix = import_gl_matrix.mat4.create();
    import_gl_matrix.mat4.lookAt(viewMatrix, import_gl_matrix.vec3.fromValues(0, 0, 1), import_gl_matrix.vec3.fromValues(0, 0, 0), import_gl_matrix.vec3.fromValues(0, 1, 0));
    return viewMatrix;
  }
  /**
   * Returns the projection matrix of the orthographic camera, which defines how 2D points are projected onto the screen.
   * @returns A mat4 representing the projection matrix of the orthographic camera.
   */
  getProjectionMatrix() {
    const halfWidth = this.resolution[0] / 2;
    const halfHeight = this.resolution[1] / 2;
    const left = this.position[0] - halfWidth;
    const right = this.position[0] + halfWidth;
    const bottom = this.position[1] - halfHeight;
    const top = this.position[1] + halfHeight;
    const projectionMatrix = import_gl_matrix.mat4.create();
    import_gl_matrix.mat4.ortho(projectionMatrix, left, right, bottom, top, this.near, this.far);
    return projectionMatrix;
  }
};

// src/core/Transform.ts
var import_gl_matrix2 = require("gl-matrix");
var Transform = class {
  /**
   * Creates an instance of Transform.
   * @param position - The initial position of the transform.
   * @param rotation - The initial rotation of the transform as a quaternion.
   * @param scale - The initial scale of the transform.
   */
  constructor(position = import_gl_matrix2.vec3.create(), rotation = import_gl_matrix2.quat.create(), scale = import_gl_matrix2.vec3.fromValues(1, 1, 1)) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }
  /**
   * Returns the position of the transform.
   * @returns The position as a vec3.
   */
  getPosition() {
    return this.position;
  }
  /**
   * Sets the position of the transform.
   * @param position - The new position as a vec3.
   */
  setPosition(position) {
    this.position = position;
  }
  /**
   * Returns the rotation of the transform as a quaternion.
   * @returns The rotation as a quat.
   */
  getRotation() {
    return this.rotation;
  }
  /**
   * Returns the rotation of the transform as Euler angles in degrees.
   * @returns The rotation as a vec3 representing Euler angles (pitch, yaw, roll).
   */
  getRotationEuler() {
    const euler = import_gl_matrix2.vec3.create();
    quatToEuler(euler, this.rotation);
    return euler;
  }
  /**
   * Sets the rotation of the transform as a quaternion.
   * @param rotation - The new rotation as a quat.
   */
  setRotation(rotation) {
    this.rotation = rotation;
  }
  /**
   * Sets the rotation of the transform using Euler angles in degrees.
   * @param euler - The new rotation as a vec3 representing Euler angles (pitch, yaw, roll).
   */
  setRotationEuler(euler) {
    const q = import_gl_matrix2.quat.create();
    import_gl_matrix2.quat.fromEuler(q, euler[0], euler[1], euler[2]);
    this.rotation = q;
  }
  /**
   * Returns the scale of the transform.
   * @returns The scale as a vec3.
   */
  getScale() {
    return this.scale;
  }
  /**
   * Sets the scale of the transform.
   * @param scale - The new scale as a vec3.
   */
  setScale(scale) {
    this.scale = scale;
  }
  /**
   * Returns the model matrix of the transform.
   * @returns The model matrix as a mat4.
   */
  getModelMatrix() {
    const modelMatrix = import_gl_matrix2.mat4.create();
    import_gl_matrix2.mat4.fromRotationTranslationScale(modelMatrix, this.rotation, this.position, this.scale);
    return modelMatrix;
  }
};

// src/core/GFXMesh.ts
var import_gl_matrix3 = require("gl-matrix");
var GFXMesh = class {
  /**
   * Creates an instance of GFXMesh with the specified name.
   * @param name - The name of the mesh, used for identification purposes.
   */
  constructor(name) {
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.indexCount = 0;
    this.materialIndex = -1;
    this.name = name;
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.indexCount = 0;
    this.materialIndex = -1;
    this.position = import_gl_matrix3.vec3.create();
    this.rotation = import_gl_matrix3.quat.create();
    this.scale = import_gl_matrix3.vec3.fromValues(1, 1, 1);
  }
  /**
   * Sets the vertex buffer for the GFXMesh.
   * @param vertexBuffer - The GFXArrayBuffer containing the vertex data.
   */
  setVertexBuffer(vertexBuffer) {
    this.vertexBuffer = vertexBuffer;
  }
  /**
   * Sets the index buffer for the GFXMesh.
   * @param indexBuffer - The GFXArrayBuffer containing the index data.
   * @param indexCount - The number of indices in the buffer.
   */
  setIndexBuffer(indexBuffer, indexCount) {
    this.indexBuffer = indexBuffer;
    this.indexCount = indexCount;
  }
  /**
   * Returns the number of indices in the index buffer.
   * @returns The number of indices.
   */
  getIndexCount() {
    return this.indexCount;
  }
  /**
   * Returns the vertex buffer of the mesh.
   * @returns The GFXArrayBuffer containing the vertex data, or null if not set.
   */
  getVertexBuffer() {
    return this.vertexBuffer;
  }
  /**
   * Returns the index buffer of the mesh.
   * @returns The GFXArrayBuffer containing the index data, or null if not set.
   */
  getIndexBuffer() {
    return this.indexBuffer;
  }
  /**
   * Gets the material index associated with this mesh.
   * @returns The index of the material used by this mesh.
   */
  getMaterialIndex() {
    return this.materialIndex;
  }
  /**
   * Sets the material index for this mesh.
   * @param index - The index of the material to be associated with this mesh.
   */
  setMaterialIndex(index) {
    this.materialIndex = index;
  }
  /**
   * Sets the position of the mesh in 3D space.
   * @param position - A vec3 representing the new position of the mesh.
   */
  setPosition(position) {
    this.position = position;
  }
  /**
   * Sets the rotation of the mesh in 3D space.
   * @param rotation - A quat representing the new rotation of the mesh.
   */
  setRotation(rotation) {
    this.rotation = rotation;
  }
  /**
   * Sets the scale of the mesh in 3D space.
   * @param scale - A vec3 representing the new scale of the mesh.
   */
  setScale(scale) {
    this.scale = scale;
  }
  /**
   * Gets the position of the mesh in 3D space.
   * @returns A vec3 representing the position of the mesh.
   */
  getPosition() {
    return this.position;
  }
  /**
   * Gets the rotation of the mesh in 3D space.
   * @returns A quat representing the rotation of the mesh.
   */
  getRotation() {
    return this.rotation;
  }
  /**
   * Gets the scale of the mesh in 3D space.
   * @returns A vec3 representing the scale of the mesh.
   */
  getScale() {
    return this.scale;
  }
  /**
   * Computes and returns the model matrix for the mesh based on its position, rotation, and scale.
   * @returns A mat4 representing the model matrix of the mesh.
   */
  getMeshMatrix() {
    const modelMatrix = import_gl_matrix3.mat4.create();
    import_gl_matrix3.mat4.fromRotationTranslationScale(modelMatrix, this.rotation, this.position, this.scale);
    return modelMatrix;
  }
  /**
   * Destroys the mesh and releases its resources.
   */
  destroy() {
    if (this.vertexBuffer) {
      this.vertexBuffer.destroy();
      this.vertexBuffer = null;
    }
    if (this.indexBuffer) {
      this.indexBuffer.destroy();
      this.indexBuffer = null;
    }
  }
};

// src/core/GFXModel.ts
var GFXModel = class {
  /**
   * Creates an instance of GFXModel with the specified array of meshes and materials.
   * @param meshes - An array of GFXMesh objects that make up the model.
   * @param materials - An array of GFXMaterial objects that are used by the model's meshes.
   */
  constructor(meshes, materials) {
    this.meshes = meshes;
    this.materials = materials;
  }
  /**
   * Creates bind groups for all materials in the model and associates them with the specified pipeline and group index.
   * This method iterates through each material in the model and calls its createBindGroups method.
   * @param gfx - The WebGFX instance used to create the bind groups.
   * @param pipeline - The GPURenderPipeline to which the bind groups will be associated.
   * @param groupIndex - The index of the bind group layout in the pipeline.
   */
  createBindGroups(gfx, pipeline, groupIndex) {
    this.materials.forEach((material) => {
      material.createBindGroups(gfx, pipeline, groupIndex);
    });
  }
  /**
   * Destroys the model and releases its resources by destroying all associated meshes and materials.
   * This method should be called when the model is no longer needed to free up GPU memory.
   */
  destroy() {
    this.meshes.forEach((mesh) => {
      mesh.destroy();
    });
    this.materials.forEach((material) => {
      material.destroy();
    });
  }
};

// src/core/GFXMaterial.ts
var GFXMaterial = class {
  /**
   * Creates an instance of Material with the specified name.
   * @param name - The name of the material.
   */
  constructor(name) {
    this.materialBindGroup = null;
    this.groupIndex = null;
    this.name = name;
    this.albedoTexture = null;
    this.normalTexture = null;
    this.metallicRoughnessTexture = null;
  }
  /**
   * Creates bind groups for the material's textures and associates them with the specified pipeline and group index.
   * The material creates a single bind group that contains the albedo, normal, and metallic-roughness textures along with their samplers.
   * For custom binding groups you can create your own bind group and bind it in the render pass.
   * @param gfx - The WebGFX instance used to create the bind groups.
   * @param pipeline - The GPURenderPipeline to which the bind groups will be associated.
   * @param groupIndex - The index of the bind group layout in the pipeline.
   */
  createBindGroups(gfx, pipeline, groupIndex) {
    console.log(`Creating bind groups for material: ${this.name}`);
    this.groupIndex = groupIndex;
    if (this.albedoTexture && this.normalTexture && this.metallicRoughnessTexture) {
      this.materialBindGroup = gfx.device.createBindGroup({
        layout: pipeline.getBindGroupLayout(groupIndex),
        entries: [
          {
            binding: 0,
            resource: this.albedoTexture.getTextureView()
          },
          {
            binding: 1,
            resource: this.albedoTexture.getSampler()
          },
          {
            binding: 2,
            resource: this.normalTexture.getTextureView()
          },
          {
            binding: 3,
            resource: this.normalTexture.getSampler()
          },
          {
            binding: 4,
            resource: this.metallicRoughnessTexture.getTextureView()
          },
          {
            binding: 5,
            resource: this.metallicRoughnessTexture.getSampler()
          }
        ]
      });
    }
  }
  /**
   * Binds the material's bind group to the specified render pass encoder and group index.
   * @param pass - The GPURenderPassEncoder to which the bind group will be bound.
   */
  bindMaterial(pass) {
    if (this.materialBindGroup && this.groupIndex !== null) {
      pass.setBindGroup(this.groupIndex, this.materialBindGroup);
    }
  }
  /**
   * Sets the albedo texture for the material.
   * @param texture - The GFXTexture object representing the albedo texture.
   */
  setAlbedoTexture(texture) {
    this.albedoTexture = texture;
  }
  /**
   * Sets the normal texture for the material.
   * @param texture - The GFXTexture object representing the normal texture.
   */
  setNormalTexture(texture) {
    this.normalTexture = texture;
  }
  /**
   * Sets the metallic-roughness texture for the material.
   * @param texture - The GFXTexture object representing the metallic-roughness texture.
   */
  setMetallicRoughnessTexture(texture) {
    this.metallicRoughnessTexture = texture;
  }
  /**
   * Returns the albedo texture associated with this material.
   * @returns The GFXTexture object representing the albedo texture, or null if not set.
   */
  getAlbedoTexture() {
    return this.albedoTexture;
  }
  /**
   * Returns the normal texture associated with this material.
   * @returns The GFXTexture object representing the normal texture, or null if not set.
   */
  getNormalTexture() {
    return this.normalTexture;
  }
  /**
   * Returns the metallic-roughness texture associated with this material.
   * @returns The GFXTexture object representing the metallic-roughness texture, or null if not set.
   */
  getMetallicRoughnessTexture() {
    return this.metallicRoughnessTexture;
  }
  /**
   * Destroys the material and releases its associated resources.
   */
  destroy() {
    if (this.albedoTexture) {
      this.albedoTexture.destroy();
      this.albedoTexture = null;
    }
    if (this.normalTexture) {
      this.normalTexture.destroy();
      this.normalTexture = null;
    }
    if (this.metallicRoughnessTexture) {
      this.metallicRoughnessTexture.destroy();
      this.metallicRoughnessTexture = null;
    }
  }
};

// src/core/GFXTexture.ts
var GFXTexture = class _GFXTexture {
  /**
   * Creates an instance of Texture.
   * @param gfx - The WebGFX instance used to create the GPU texture.
   * @param imageBitmap - The HTMLImageElement or ImageBitmap used to populate the texture.
   */
  constructor(texture, textureView, sampler) {
    this.texture = texture;
    this.textureView = textureView;
    this.sampler = sampler;
  }
  static fromImage(gfx, image) {
    const gpuTexture = gfx.device.createTexture({
      size: [image.width, image.height],
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    });
    gfx.device.queue.copyExternalImageToTexture(
      { source: image },
      { texture: gpuTexture },
      [image.width, image.height]
    );
    const textureView = gpuTexture.createView();
    const sampler = gfx.device.createSampler({
      magFilter: "linear",
      minFilter: "linear"
    });
    return new _GFXTexture(gpuTexture, textureView, sampler);
  }
  static fromColor(gfx, width, height, color) {
    const gpuTexture = gfx.device.createTexture({
      size: [width, height],
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    });
    const data = new Uint8Array(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      data[i * 4 + 0] = color[0];
      data[i * 4 + 1] = color[1];
      data[i * 4 + 2] = color[2];
      data[i * 4 + 3] = color[3];
    }
    gfx.device.queue.writeTexture(
      { texture: gpuTexture },
      data,
      { bytesPerRow: width * 4 },
      [width, height]
    );
    const textureView = gpuTexture.createView();
    const sampler = gfx.device.createSampler({
      magFilter: "linear",
      minFilter: "linear"
    });
    return new _GFXTexture(gpuTexture, textureView, sampler);
  }
  /**
   * Returns the GPUTextureView associated with this texture.
   * @returns The GPUTextureView of the texture.
   */
  getTextureView() {
    return this.textureView;
  }
  /**
   * Returns the GPUSampler associated with this texture.
   * @returns The GPUSampler of the texture.
   */
  getSampler() {
    return this.sampler;
  }
  /**
   * Returns the GPUTexture associated with this texture.
   * @returns The GPUTexture of the texture.
   */
  getTexture() {
    return this.texture;
  }
  /**
   * Destroys the texture and releases its resources.
   */
  destroy() {
    this.texture.destroy();
  }
};

// src/core/GFXArrayBuffer.ts
var GFXArrayBuffer = class {
  /**
   * Creates an instance of GFXArrayBuffer.
   * @param data - The initial data to populate the buffer with. It can be a Float32Array or Uint32Array.
   * @param usage - The usage flags for the GPU buffer, indicating how the buffer will be used (e.g., vertex buffer, index buffer).
   * @param gfx - The WebGFX instance used to create the GPU buffer.
   */
  constructor(data, usage, gfx) {
    this.size = data.byteLength;
    this.usage = usage;
    this.mappedAtCreation = false;
    this.buffer = gfx.device.createBuffer({
      size: this.size,
      usage: this.usage,
      mappedAtCreation: this.mappedAtCreation
    });
    gfx.device.queue.writeBuffer(this.buffer, 0, data);
  }
  /**
   * Updates the contents of the GPU buffer with new data.
   * @param data - The new data to write into the buffer. It can be a Float32Array or Uint32Array.
   * @param gfx - The WebGFX instance used to access the GPU device and queue for writing the buffer.
   */
  update(data, gfx) {
    gfx.device.queue.writeBuffer(this.buffer, 0, data);
  }
  /**
   * Destroys the GPU buffer, releasing its resources.
   * This method should be called when the buffer is no longer needed to free up GPU memory.
   */
  destroy() {
    this.buffer.destroy();
  }
};

// src/core/GLTFLoader.ts
var import_gl_matrix4 = require("gl-matrix");
var GLTFBuffer = class {
  // Optional property to hold the loaded buffer data
  constructor(uri, byteLength) {
    this.uri = uri;
    this.byteLength = byteLength;
  }
};
var GLTFLoader = class {
  /**
   * Loads a GLTF model from the specified URL and returns a Model object containing the parsed meshes.
   * @param url - The URL of the GLTF file to load.
   * @param gfx - The WebGFX instance used for creating GPU buffers.
   * @returns A Promise that resolves to a Model object containing the parsed meshes.
   */
  async load(url, gfx) {
    const response = await fetch(url);
    const gltf = await response.json();
    const basePath = getParentPath(url);
    const materials = await this.readMaterials(gltf, basePath, gfx);
    console.log("Parsed materials:", materials);
    const buffers = await this.readBuffers(gltf, basePath);
    const meshes = this.parseNodes(gltf, buffers, gfx);
    console.log("Parsed meshes:", meshes);
    return new GFXModel(meshes, materials);
  }
  /**
   * Reads the buffer data from the GLTF file and returns an array of GLTFBuffer objects containing the loaded data.
   * @param gltf - The parsed GLTF JSON object.
   * @param basePath - The base path for resolving buffer URIs.
   * @returns A Promise that resolves to an array of GLTFBuffer objects containing the loaded buffer data.
   */
  async readBuffers(gltf, basePath) {
    let buffers = await Promise.all(
      gltf.buffers.map(
        async (buffer) => {
          const bufferPath = `${basePath}/${buffer.uri}`;
          const response = await fetch(bufferPath);
          const arrayBuffer = await response.arrayBuffer();
          let gltfBuffer = new GLTFBuffer(buffer.uri, buffer.byteLength);
          gltfBuffer.buffer = arrayBuffer;
          return gltfBuffer;
        }
      )
    );
    return buffers;
  }
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
  async readMaterials(gltf, basePath, gfx) {
    var _a, _b, _c, _d, _e;
    const materials = [];
    for (const material of gltf.materials) {
      let gfxMaterial = new GFXMaterial(material.name || "Unnamed Material");
      const baseColorTextureSrc = ((_b = (_a = material.pbrMetallicRoughness) == null ? void 0 : _a.baseColorTexture) == null ? void 0 : _b.index) !== void 0 ? `${basePath}/${gltf.images[material.pbrMetallicRoughness.baseColorTexture.index].uri}` : void 0;
      if (baseColorTextureSrc) {
        const baseColorImage = new Image();
        baseColorImage.src = baseColorTextureSrc;
        await baseColorImage.decode();
        const baseColorTexture = GFXTexture.fromImage(gfx, baseColorImage);
        gfxMaterial.setAlbedoTexture(baseColorTexture);
      } else {
        const defaultTexture = GFXTexture.fromColor(gfx, 1, 1, [255, 255, 255, 255]);
        gfxMaterial.setAlbedoTexture(defaultTexture);
      }
      const normalMapTexture = ((_c = material.normalTexture) == null ? void 0 : _c.index) !== void 0 ? `${basePath}/${gltf.images[material.normalTexture.index].uri}` : void 0;
      if (normalMapTexture) {
        const normalMapImage = new Image();
        normalMapImage.src = normalMapTexture;
        await normalMapImage.decode();
        const normalMapTextureObj = GFXTexture.fromImage(gfx, normalMapImage);
        gfxMaterial.setNormalTexture(normalMapTextureObj);
      } else {
        const defaultNormalTexture = GFXTexture.fromColor(gfx, 1, 1, [128, 128, 255, 255]);
        gfxMaterial.setNormalTexture(defaultNormalTexture);
      }
      const metallicRoughnessTexture = ((_e = (_d = material.pbrMetallicRoughness) == null ? void 0 : _d.metallicRoughnessTexture) == null ? void 0 : _e.index) !== void 0 ? `${basePath}/${gltf.images[material.pbrMetallicRoughness.metallicRoughnessTexture.index].uri}` : void 0;
      if (metallicRoughnessTexture) {
        const metallicRoughnessImage = new Image();
        metallicRoughnessImage.src = metallicRoughnessTexture;
        await metallicRoughnessImage.decode();
        const metallicRoughnessTextureObj = GFXTexture.fromImage(gfx, metallicRoughnessImage);
        gfxMaterial.setMetallicRoughnessTexture(metallicRoughnessTextureObj);
      } else {
        const defaultMetallicRoughnessTexture = GFXTexture.fromColor(gfx, 1, 1, [255, 255, 255, 255]);
        gfxMaterial.setMetallicRoughnessTexture(defaultMetallicRoughnessTexture);
      }
      materials.push(gfxMaterial);
    }
    return materials;
  }
  /**
   * Parses the nodes in the GLTF file and creates Mesh objects for each node, using the provided buffer data.
   * @param gltf - The parsed GLTF JSON object.
   * @param buffers - An array of GLTFBuffer objects containing the loaded buffer data.
   * @param gfx - The WebGFX instance used for creating GPU buffers.
   * @returns An array of Mesh objects created from the parsed nodes in the GLTF file.
   */
  parseNodes(gltf, buffers, gfx) {
    const meshes = [];
    gltf.nodes.forEach((node) => {
      var _a;
      const name = node.name || "Unnamed Node";
      const meshIndex = node.mesh;
      const position = node.translation || [0, 0, 0];
      const rotation = node.rotation || [0, 0, 0, 1];
      const scale = node.scale || [1, 1, 1];
      const mesh = gltf.meshes[meshIndex];
      (_a = mesh == null ? void 0 : mesh.primitives) == null ? void 0 : _a.forEach((primitive) => {
        var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
        let gfxMesh = new GFXMesh(name);
        gfxMesh.setPosition(import_gl_matrix4.vec3.fromValues(...position));
        gfxMesh.setRotation(import_gl_matrix4.quat.fromValues(...rotation));
        gfxMesh.setScale(import_gl_matrix4.vec3.fromValues(...scale));
        if (primitive.material !== void 0) {
          gfxMesh.setMaterialIndex(primitive.material);
        }
        const positionAccessorIndex = primitive.attributes.POSITION;
        const positionAccessor = gltf.accessors[positionAccessorIndex];
        const positionBufferView = gltf.bufferViews[positionAccessor.bufferView];
        console.log("Position BufferView:", positionBufferView);
        const normalAccessorIndex = primitive.attributes.NORMAL;
        const normalAccessor = gltf.accessors[normalAccessorIndex];
        const normalBufferView = gltf.bufferViews[normalAccessor.bufferView];
        console.log("Normal BufferView:", normalBufferView);
        const uvAccessorIndex = primitive.attributes.TEXCOORD_0;
        const uvAccessor = gltf.accessors[uvAccessorIndex];
        const uvBufferView = gltf.bufferViews[uvAccessor.bufferView];
        console.log("UV BufferView:", uvBufferView);
        const tangentAccessorIndex = primitive.attributes.TANGENT;
        const tangentAccessor = gltf.accessors[tangentAccessorIndex];
        const tangentBufferView = gltf.bufferViews[tangentAccessor.bufferView];
        console.log("Tangent BufferView:", tangentBufferView);
        const indexAccessorIndex = primitive.indices;
        const indexAccessor = gltf.accessors[indexAccessorIndex];
        const indexBufferView = gltf.bufferViews[indexAccessor.bufferView];
        console.log("Index BufferView:", indexBufferView);
        const vertexSize = 12;
        const floatSize = 4;
        const vec4Size = 4 * floatSize;
        const vec3Size = 3 * floatSize;
        const vec2Size = 2 * floatSize;
        const positionBase = ((_a2 = positionBufferView.byteOffset) != null ? _a2 : 0) + ((_b = positionAccessor.byteOffset) != null ? _b : 0);
        const normalBase = ((_c = normalBufferView.byteOffset) != null ? _c : 0) + ((_d = normalAccessor.byteOffset) != null ? _d : 0);
        const uvBase = ((_e = uvBufferView.byteOffset) != null ? _e : 0) + ((_f = uvAccessor.byteOffset) != null ? _f : 0);
        const tangentBase = ((_g = tangentBufferView.byteOffset) != null ? _g : 0) + ((_h = tangentAccessor.byteOffset) != null ? _h : 0);
        const positionStride = (_i = positionBufferView.byteStride) != null ? _i : vec3Size;
        const normalStride = (_j = normalBufferView.byteStride) != null ? _j : vec3Size;
        const uvStride = (_k = uvBufferView.byteStride) != null ? _k : vec2Size;
        const tangentStride = (_l = tangentBufferView.byteStride) != null ? _l : vec4Size;
        let vertexBufferData = new Float32Array(positionAccessor.count * vertexSize);
        const vertexCount = positionAccessor.count;
        for (let i = 0; i < vertexCount; i++) {
          const positionOffset = positionBase + i * positionStride;
          const normalOffset = normalBase + i * normalStride;
          const uvOffset = uvBase + i * uvStride;
          const tangentOffset = tangentBase + i * tangentStride;
          const position2 = new Float32Array(buffers[positionBufferView.buffer].buffer, positionOffset, 3);
          const normal = new Float32Array(buffers[normalBufferView.buffer].buffer, normalOffset, 3);
          const uv = new Float32Array(buffers[uvBufferView.buffer].buffer, uvOffset, 2);
          const tangent = new Float32Array(buffers[tangentBufferView.buffer].buffer, tangentOffset, 4);
          vertexBufferData[i * vertexSize] = position2[0];
          vertexBufferData[i * vertexSize + 1] = position2[1];
          vertexBufferData[i * vertexSize + 2] = position2[2];
          vertexBufferData[i * vertexSize + 3] = normal[0];
          vertexBufferData[i * vertexSize + 4] = normal[1];
          vertexBufferData[i * vertexSize + 5] = normal[2];
          vertexBufferData[i * vertexSize + 6] = uv[0];
          vertexBufferData[i * vertexSize + 7] = uv[1];
          vertexBufferData[i * vertexSize + 8] = tangent[0];
          vertexBufferData[i * vertexSize + 9] = tangent[1];
          vertexBufferData[i * vertexSize + 10] = tangent[2];
          vertexBufferData[i * vertexSize + 11] = tangent[3];
        }
        const vertexBuffer = new GFXArrayBuffer(vertexBufferData, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, gfx);
        gfxMesh.setVertexBuffer(vertexBuffer);
        const gltfIndexBuffer = buffers[indexBufferView.buffer];
        console.log("GLTF Index Buffer:", gltfIndexBuffer);
        if (gltfIndexBuffer && gltfIndexBuffer.buffer) {
          const indexBase = ((_m = indexBufferView.byteOffset) != null ? _m : 0) + ((_n = indexAccessor.byteOffset) != null ? _n : 0);
          const indexData16 = new Uint16Array(
            gltfIndexBuffer.buffer,
            indexBase,
            indexAccessor.count
          );
          const indexData = new Uint32Array(indexData16);
          const indexBuffer = new GFXArrayBuffer(indexData, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, gfx);
          gfxMesh.setIndexBuffer(indexBuffer, indexAccessor.count);
        } else {
          console.error(`Buffer for index data not found or not loaded for node: ${name}`);
        }
        meshes.push(gfxMesh);
      });
    });
    return meshes;
  }
};

// src/core/PipelineBuilder.ts
function PipelineBuilder(pipelineDescriptor, gfx) {
  return gfx.device.createRenderPipeline({
    layout: "auto",
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
        format: gfx.format
      }]
    },
    primitive: pipelineDescriptor.primitive
  });
}

// src/core/MeshBuilder.ts
var import_gl_matrix5 = require("gl-matrix");
var MeshBuilder = class {
  constructor() {
    this.vertices = [];
    this.indices = [];
    this.vertexCount = 0;
  }
  /**
   * Adds a vertex to the mesh.
   * @param position - The position of the vertex as a vec3.
   * @param normal - The normal of the vertex as a vec3.
   * @param uv - The texture coordinates of the vertex as a vec2.
   * @param tangent - The tangent of the vertex as a vec4.
   */
  addVertex4(position, normal, uv, tangent) {
    this.vertices.push(...position, ...normal, ...uv, ...tangent);
    this.vertexCount++;
  }
  /**
   * Adds a vertex to the mesh with a default tangent value.
   * @param position - The position of the vertex as a vec3.
   * @param normal - The normal of the vertex as a vec3.
   * @param uv - The texture coordinates of the vertex as a vec2.
   */
  addVertex3(position, normal, uv) {
    const tangent = import_gl_matrix5.vec4.fromValues(1, 0, 0, 1);
    this.addVertex4(position, normal, uv, tangent);
  }
  /**
   * Adds a vertex to the mesh with a default normal and tangent value.
   * @param position - The position of the vertex as a vec3.
   * @param uv - The texture coordinates of the vertex as a vec2.
   */
  addVertex2(position, uv) {
    const normal = import_gl_matrix5.vec3.fromValues(0, 0, 1);
    this.addVertex3(position, normal, uv);
  }
  /**
   * Adds a triangle to the mesh by specifying the indices of its vertices.
   * @param i0 - The index of the first vertex.
   * @param i1 - The index of the second vertex.
   * @param i2 - The index of the third vertex.
   */
  addTriangle(i0, i1, i2) {
    this.indices.push(i0, i1, i2);
  }
  /**
   * Adds a quad to the mesh by specifying the indices of its vertices.
   * @param i0 - The index of the first vertex.
   * @param i1 - The index of the second vertex.
   * @param i2 - The index of the third vertex.
   * @param i3 - The index of the fourth vertex.
   */
  addQuad(i0, i1, i2, i3) {
    this.addTriangle(i0, i1, i2);
    this.addTriangle(i2, i3, i0);
  }
  /**
   * Builds a GFXMesh from the accumulated vertices and indices.
   * @param name - The name of the mesh.
   * @param gfx - The WebGFX instance used to create the mesh buffers.
   * @returns A GFXMesh instance containing the vertex and index buffers.
   */
  buildMesh(name, gfx) {
    const mesh = new GFXMesh(name);
    const vertexBufferData = new Float32Array(this.vertices);
    const vertexBuffer = new GFXArrayBuffer(vertexBufferData, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, gfx);
    const indexBufferData = new Uint32Array(this.indices);
    const indexBuffer = new GFXArrayBuffer(indexBufferData, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, gfx);
    mesh.setVertexBuffer(vertexBuffer);
    mesh.setIndexBuffer(indexBuffer, this.indices.length);
    this.vertices = [];
    this.indices = [];
    this.vertexCount = 0;
    return mesh;
  }
};

// src/core/Viewport.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var ViewportMode = /* @__PURE__ */ ((ViewportMode2) => {
  ViewportMode2[ViewportMode2["Continuous"] = 0] = "Continuous";
  ViewportMode2[ViewportMode2["OnDemand"] = 1] = "OnDemand";
  return ViewportMode2;
})(ViewportMode || {});
function Viewport({ scene, invalidateSignal, width = 800, height = 600, mode = 1 /* OnDemand */, onKeyDown, onMouseMove, onMouseDown }) {
  const canvasRef = (0, import_react.useRef)(null);
  const gfxRef = (0, import_react.useRef)(null);
  const renderFrame = () => {
    const gfx = gfxRef.current;
    if (!gfx) return;
    scene.render(gfx);
  };
  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const relativeX = event.clientX - canvas.getBoundingClientRect().left;
    const relativeY = event.clientY - canvas.getBoundingClientRect().top;
    if (onMouseMove) {
      onMouseMove(event, relativeX, relativeY);
    }
  };
  const handleMouseDown = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const relativeX = event.clientX - canvas.getBoundingClientRect().left;
    const relativeY = event.clientY - canvas.getBoundingClientRect().top;
    if (onMouseDown) {
      onMouseDown(event, relativeX, relativeY);
    }
  };
  const handleKeyDown = (event) => {
    if (onKeyDown) {
      onKeyDown(event);
    }
  };
  (0, import_react.useEffect)(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frameId = 0;
    let disposed = false;
    let lastFrameTime = performance.now();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    const init = async () => {
      console.log("INIT VIEWPORT");
      const gfx = await WebGFX.create(canvas);
      if (disposed) return;
      gfxRef.current = gfx;
      await scene.initialize(gfx);
      if (mode === 1 /* OnDemand */) {
        renderFrame();
        return;
      }
      const loop = () => {
        if (disposed) return;
        const now = performance.now();
        const deltaTime = (now - lastFrameTime) / 1e3;
        lastFrameTime = now;
        scene.update(gfx, deltaTime);
        renderFrame();
        frameId = requestAnimationFrame(loop);
      };
      loop();
    };
    init();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      disposed = true;
      cancelAnimationFrame(frameId);
      if (gfxRef.current) {
        scene.dispose(gfxRef.current);
      } else {
        console.warn("WebGFX instance not initialized; cannot dispose scene.");
      }
    };
  }, [scene, mode]);
  (0, import_react.useEffect)(() => {
    if (invalidateSignal !== void 0 && mode === 1 /* OnDemand */) {
      renderFrame();
    }
  }, [invalidateSignal, mode]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: canvasRef, width, height });
}

// src/core/GFXRenderTarget.ts
var GFXRenderTarget = class {
  /**
   * Creates an instance of GFXRenderTarget with the specified width and height.
   * @param gfx - The WebGFX instance used to create the render target.
   * @param width - The width of the render target in pixels.
   * @param height - The height of the render target in pixels.
   */
  constructor(gfx, width, height) {
    this.bindGroup = null;
    this.renderTargetTexture = gfx.device.createTexture({
      size: [width, height],
      format: gfx.format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });
    this.renderTargetView = this.renderTargetTexture.createView();
    this.depthTexture = gfx.device.createTexture({
      size: [width, height],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT
    });
    this.depthTextureView = this.depthTexture.createView();
    this.renderTargetSampler = gfx.device.createSampler({
      magFilter: "linear",
      minFilter: "linear"
    });
  }
  /**
   * Starts a render pass on the render target, returning the command encoder and render pass encoder.
   * The render pass is configured with the render target's color and depth textures, and it clears both textures at the start of the pass.
   * @param gfx - The WebGFX instance used to start the render pass.
   * @returns An object containing the command encoder and render pass encoder for the render pass.
   * @throws An error if the render target view is not created.
   */
  startRenderPass(gfx) {
    const encoder = gfx.device.createCommandEncoder();
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.renderTargetView,
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: "clear",
        storeOp: "store"
      }],
      depthStencilAttachment: {
        view: this.depthTextureView,
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    });
    return { encoder, pass: renderPass };
  }
  /**
   * Ends the render pass on the render target, submitting the command buffer to the GPU queue.
   * @param gfx - The WebGFX instance used to end the render pass.
   * @param pass - The render pass encoder used to record rendering commands for the render pass. 
   * @param encoder - The command encoder used to record GPU commands for the render pass. 
   */
  endRenderPass(gfx, pass, encoder) {
    pass.end();
    gfx.device.queue.submit([encoder.finish()]);
  }
  /**
   * Destroys the render target, releasing its resources.
   * This method should be called when the render target is no longer needed to free up GPU memory.
   */
  destroy() {
    this.renderTargetTexture.destroy();
    this.depthTexture.destroy();
  }
  /**
   * Creates bind groups for the render target, allowing it to be used as a texture in shaders.
   */
  createBindGroups(gfx, pipeline, groupIndex) {
    this.bindGroup = gfx.device.createBindGroup({
      layout: pipeline.getBindGroupLayout(groupIndex),
      entries: [
        {
          binding: 0,
          resource: this.renderTargetView
        },
        {
          binding: 1,
          resource: this.renderTargetSampler
        }
      ]
    });
  }
  /**
   * Binds the render target's bind group to the specified render pass encoder and group index.
   * @param pass - The GPURenderPassEncoder to which the bind group will be bound.
   * @param group - The index of the bind group layout in the pipeline.
   */
  bind(pass, group) {
    if (!this.bindGroup) {
      console.error("Bind group is not created. Call createBindGroups() before binding.");
      return;
    }
    pass.setBindGroup(group, this.bindGroup);
  }
};

// src/shaders/Shaders.ts
function defaultShader() {
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
function fullscreenQuadShader() {
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
function meshShader() {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GFXArrayBuffer,
  GFXRenderTarget,
  GLTFLoader,
  Material,
  Mesh,
  MeshBuilder,
  Model,
  OrthographicCamera,
  PerspectiveCamera,
  PipelineBuilder,
  Texture,
  Transform,
  Viewport,
  ViewportMode,
  WebGFX,
  defaultShader,
  fullscreenQuadShader,
  getDefaultAlbedoColor,
  getDefaultMetallicRoughnessColor,
  getDefaultNormalColor,
  getParentPath,
  getRadians,
  meshShader,
  quatToEuler
});
