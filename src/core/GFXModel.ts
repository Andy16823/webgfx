import GFXMesh from "@/core/GFXMesh";
import GFXMaterial from "@/core/GFXMaterial";
import { WebGFX } from "./WebGFX";

/**
 * Class representing a 3D model, which consists of multiple meshes.
 * It provides methods to manage the meshes and destroy the model when it is no longer needed.
 */
export default class GFXModel {
    meshes: GFXMesh[];
    materials: GFXMaterial[];

    /**
     * Creates an instance of GFXModel with the specified array of meshes and materials.
     * @param meshes - An array of GFXMesh objects that make up the model.
     * @param materials - An array of GFXMaterial objects that are used by the model's meshes.
     */
    constructor(meshes: GFXMesh[], materials: GFXMaterial[]) {
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
    createBindGroups(gfx: WebGFX, pipeline: GPURenderPipeline, groupIndex: number): void {
        this.materials.forEach(material => {
            material.createBindGroups(gfx, pipeline, groupIndex);
        });
    }

    /**
     * Destroys the model and releases its resources by destroying all associated meshes and materials.
     * This method should be called when the model is no longer needed to free up GPU memory.
     */
    destroy(): void {
        this.meshes.forEach(mesh => {
            mesh.destroy();
        });
        this.materials.forEach(material => {
            material.destroy();
        });
    }
}