import GFXArrayBuffer from "@/core/GFXArrayBuffer";

export default class Mesh {
    private name: string;
    private vertexBuffer: GFXArrayBuffer | null = null;
    private indexBuffer: GFXArrayBuffer | null = null;
    private indexCount: number = 0;

    constructor(name: string) {
        this.name = name;
    }

    setVertexBuffer(vertexBuffer: GFXArrayBuffer): void {
        this.vertexBuffer = vertexBuffer;
    }

    setIndexBuffer(indexBuffer: GFXArrayBuffer, indexCount: number): void {
        this.indexBuffer = indexBuffer;
        this.indexCount = indexCount;
    }

    getIndexCount(): number {
        return this.indexCount;
    }

    getVertexBuffer(): GFXArrayBuffer | null {
        return this.vertexBuffer;
    }

    getIndexBuffer(): GFXArrayBuffer | null {
        return this.indexBuffer;
    }

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