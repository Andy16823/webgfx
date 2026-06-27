import Mesh from "@/core/Mesh";
import Material from "@/core/Material";
import { WebGFX } from "./WebGFX";

/**
 * Class representing a 3D model, which consists of multiple meshes.
 * It provides methods to manage the meshes and destroy the model when it is no longer needed.
 */
export default class Model {
    meshes: Mesh[];
    materials: Material[];

    /**
     * Creates an instance of Model with the specified array of meshes and materials.
     * @param meshes - An array of Mesh objects that make up the model.
     * @param materials - An array of Material objects that are used by the model's meshes.
     */
    constructor(meshes: Mesh[], materials: Material[]) {
        this.meshes = meshes;
        this.materials = materials;
    }

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