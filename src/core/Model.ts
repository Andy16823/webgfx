import Mesh from "@/core/Mesh";

/**
 * Class representing a 3D model, which consists of multiple meshes.
 * It provides methods to manage the meshes and destroy the model when it is no longer needed.
 */
export default class Model {
    meshes: Mesh[];

    /**
     * Creates an instance of Model with the specified array of meshes.
     * @param meshes - An array of Mesh objects that make up the model.
     */
    constructor(meshes: Mesh[]) {
        this.meshes = meshes;
    }

    /**
     * Destroys the model and releases its resources by destroying all associated meshes.
     * This method should be called when the model is no longer needed to free up GPU memory.
     */
    destroy(): void {
        this.meshes.forEach(mesh => {
            mesh.destroy();
        });
    }
}