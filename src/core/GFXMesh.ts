import GFXArrayBuffer from "@/core/GFXArrayBuffer";
import { mat4, quat, vec3 } from "gl-matrix";

/**
 * Class representing a 3D mesh, which consists of vertex and index buffers.
 * It provides methods to set the vertex and index buffers, retrieve their information, and destroy the mesh.
 */
export default class GFXMesh {
    private name: string;
    private vertexBuffer: GFXArrayBuffer | null = null;
    private indexBuffer: GFXArrayBuffer | null = null;
    private indexCount: number = 0;
    private materialIndex: number = -1;

    private position: vec3;
    private rotation: quat;
    private scale: vec3;


    /**
     * Creates an instance of GFXMesh with the specified name.
     * @param name - The name of the mesh, used for identification purposes.
     */
    constructor(name: string) {
        this.name = name;
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.indexCount = 0;
        this.materialIndex = -1;
        this.position = vec3.create();
        this.rotation = quat.create();
        this.scale = vec3.fromValues(1, 1, 1);
    }

    /**
     * Sets the vertex buffer for the GFXMesh.
     * @param vertexBuffer - The GFXArrayBuffer containing the vertex data.
     */
    setVertexBuffer(vertexBuffer: GFXArrayBuffer): void {
        this.vertexBuffer = vertexBuffer;
    }

    /**
     * Sets the index buffer for the GFXMesh.
     * @param indexBuffer - The GFXArrayBuffer containing the index data.
     * @param indexCount - The number of indices in the buffer.
     */
    setIndexBuffer(indexBuffer: GFXArrayBuffer, indexCount: number): void {
        this.indexBuffer = indexBuffer;
        this.indexCount = indexCount;
    }

    /**
     * Returns the number of indices in the index buffer.
     * @returns The number of indices.
     */
    getIndexCount(): number {
        return this.indexCount;
    }

    /**
     * Returns the vertex buffer of the mesh.
     * @returns The GFXArrayBuffer containing the vertex data, or null if not set.
     */
    getVertexBuffer(): GFXArrayBuffer | null {
        return this.vertexBuffer;
    }

    /**
     * Returns the index buffer of the mesh.
     * @returns The GFXArrayBuffer containing the index data, or null if not set.
     */
    getIndexBuffer(): GFXArrayBuffer | null {
        return this.indexBuffer;
    }
    
    /**
     * Gets the material index associated with this mesh.
     * @returns The index of the material used by this mesh.
     */
    getMaterialIndex(): number {
        return this.materialIndex;
    }

    /**
     * Sets the material index for this mesh.
     * @param index - The index of the material to be associated with this mesh.
     */
    setMaterialIndex(index: number): void {
        this.materialIndex = index;
    }

    /**
     * Sets the position of the mesh in 3D space.
     * @param position - A vec3 representing the new position of the mesh.
     */
    setPosition(position: vec3): void {
        this.position = position;
    }

    /**
     * Sets the rotation of the mesh in 3D space.
     * @param rotation - A quat representing the new rotation of the mesh.
     */
    setRotation(rotation: quat): void {
        this.rotation = rotation;
    }

    /**
     * Sets the scale of the mesh in 3D space.
     * @param scale - A vec3 representing the new scale of the mesh.
     */
    setScale(scale: vec3): void {
        this.scale = scale;
    }

    /**
     * Gets the position of the mesh in 3D space.
     * @returns A vec3 representing the position of the mesh.
     */
    getPosition(): vec3 {
        return this.position;
    }

    /**
     * Gets the rotation of the mesh in 3D space.
     * @returns A quat representing the rotation of the mesh.
     */
    getRotation(): quat {
        return this.rotation;
    }

    /**
     * Gets the scale of the mesh in 3D space.
     * @returns A vec3 representing the scale of the mesh.
     */
    getScale(): vec3 {
        return this.scale;
    }

    /**
     * Computes and returns the model matrix for the mesh based on its position, rotation, and scale.
     * @returns A mat4 representing the model matrix of the mesh.
     */
    getMeshMatrix(): mat4 {
        const modelMatrix = mat4.create();
        mat4.fromRotationTranslationScale(modelMatrix, this.rotation, this.position, this.scale);
        return modelMatrix;
    }
    
    /**
     * Destroys the mesh and releases its resources.
     */
    destroy(): void {
        if (this.vertexBuffer) {
            this.vertexBuffer.destroy();
            this.vertexBuffer = null;
        }
        if (this.indexBuffer) {
            this.indexBuffer.destroy();
            this.indexBuffer = null;
        }   
    }
}