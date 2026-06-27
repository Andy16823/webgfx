import GFXArrayBuffer from "@/core/GFXArrayBuffer";

/**
 * Class representing a 3D mesh, which consists of vertex and index buffers.
 * It provides methods to set the vertex and index buffers, retrieve their information, and destroy the mesh.
 */
export default class Mesh {
    private name: string;
    private vertexBuffer: GFXArrayBuffer | null = null;
    private indexBuffer: GFXArrayBuffer | null = null;
    private indexCount: number = 0;
    private materialIndex: number = -1;

    /**
     * Creates an instance of Mesh with the specified name.
     * @param name - The name of the mesh, used for identification purposes.
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Sets the vertex buffer for the mesh.
     * @param vertexBuffer - The GFXArrayBuffer containing the vertex data.
     */
    setVertexBuffer(vertexBuffer: GFXArrayBuffer): void {
        this.vertexBuffer = vertexBuffer;
    }

    /**
     * Sets the index buffer for the mesh.
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
    
    getMaterialIndex(): number {
        return this.materialIndex;
    }

    setMaterialIndex(index: number): void {
        this.materialIndex = index;
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