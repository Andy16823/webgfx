import Mesh from "@/core/Mesh";
import { WebGFX } from "./WebGFX";

export default class Model {
    meshes: Mesh[];

    constructor(meshes: Mesh[]) {
        this.meshes = meshes;
    }

    destroy(): void {
        this.meshes.forEach(mesh => {
            mesh.destroy();
        });
    }
            
}