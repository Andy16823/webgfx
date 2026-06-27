import Texture from "@/core/Texture";
import { WebGFX } from "./WebGFX";

/**
 * Class representing a material in the WebGFX framework.
 */
export default class Material {
    name: string;
    albedoTexture: Texture | null;
    normalTexture: Texture | null;
    metallicRoughnessTexture: Texture | null;

    private materialBindGroup: GPUBindGroup | null = null;

    /**
     * Creates an instance of Material with the specified name.
     * @param name - The name of the material.
     */
    constructor(name: string) {
        this.name = name;
        this.albedoTexture = null;
        this.normalTexture = null;
        this.metallicRoughnessTexture = null;
    }

    /**
     * Creates bind groups for the material's textures and associates them with the specified pipeline and group index.
     * @param gfx - The WebGFX instance used to create the bind groups.
     * @param pipeline - The GPURenderPipeline to which the bind groups will be associated.
     * @param groupIndex - The index of the bind group layout in the pipeline.
     */
    createBindGroups(gfx: WebGFX, pipeline: GPURenderPipeline, groupIndex: number): void {
        console.log(`Creating bind groups for material: ${this.name}`);
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
     * @param groupIndex - The index of the bind group layout in the pipeline.
     */
    bindMaterial(pass: GPURenderPassEncoder, groupIndex: number): void {
        if (this.materialBindGroup) {
            pass.setBindGroup(groupIndex, this.materialBindGroup);
        }
    }

    /**
     * Sets the albedo texture for the material.
     * @param texture - The Texture object representing the albedo texture.
     */
    setAlbedoTexture(texture: Texture): void {
        this.albedoTexture = texture;
    }

    /**
     * Sets the normal texture for the material.
     * @param texture - The Texture object representing the normal texture.
     */
    setNormalTexture(texture: Texture): void {
        this.normalTexture = texture;
    }

    /**
     * Sets the metallic-roughness texture for the material.
     * @param texture - The Texture object representing the metallic-roughness texture.
     */
    setMetallicRoughnessTexture(texture: Texture): void {
        this.metallicRoughnessTexture = texture;
    }

    /**
     * Returns the albedo texture associated with this material.
     * @returns The Texture object representing the albedo texture, or null if not set.
     */
    getAlbedoTexture(): Texture | null {
        return this.albedoTexture;
    }

    /**
     * Returns the normal texture associated with this material.
     * @returns The Texture object representing the normal texture, or null if not set.
     */
    getNormalTexture(): Texture | null {
        return this.normalTexture;
    }

    /**
     * Returns the metallic-roughness texture associated with this material.
     * @returns The Texture object representing the metallic-roughness texture, or null if not set.
     */
    getMetallicRoughnessTexture(): Texture | null {
        return this.metallicRoughnessTexture;
    }

    /**
     * Destroys the material and releases its associated resources.
     */
    destroy(): void {
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
}