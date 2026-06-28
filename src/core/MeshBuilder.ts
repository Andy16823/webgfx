import { vec2, vec3, vec4 } from "gl-matrix";
import GFXMesh from "@/core/GFXMesh";
import GFXArrayBuffer from "@/core/GFXArrayBuffer";
import { WebGFX } from "@/core/WebGFX";

/**
 * MeshBuilder is a utility class for constructing 3D meshes by accumulating vertex and index data.
 * It provides methods to add vertices, triangles, and quads, and finally build a GFXMesh object.
 * The builder maintains internal arrays for vertices and indices, which are used to create GPU buffers.
 */
export default class MeshBuilder {
    private vertices: number[] = [];
    private indices: number[] = [];
    private vertexCount: number = 0;

    /**
     * Adds a vertex to the mesh.
     * @param position - The position of the vertex as a vec3.
     * @param normal - The normal of the vertex as a vec3.
     * @param uv - The texture coordinates of the vertex as a vec2.
     * @param tangent - The tangent of the vertex as a vec4.
     */
    addVertex4(position: vec3, normal: vec3, uv: vec2, tangent: vec4): void {
        this.vertices.push(...position, ...normal, ...uv, ...tangent);
        this.vertexCount++;
    }

    /**
     * Adds a vertex to the mesh with a default tangent value.
     * @param position - The position of the vertex as a vec3.
     * @param normal - The normal of the vertex as a vec3.
     * @param uv - The texture coordinates of the vertex as a vec2.
     */
    addVertex3(position: vec3, normal: vec3, uv: vec2): void {
        const tangent: vec4 = vec4.fromValues(1, 0, 0, 1);
        this.addVertex4(position, normal, uv, tangent);
    }

    /**
     * Adds a vertex to the mesh with a default normal and tangent value.
     * @param position - The position of the vertex as a vec3.
     * @param uv - The texture coordinates of the vertex as a vec2.
     */
    addVertex2(position: vec3, uv: vec2): void {
        const normal: vec3 = vec3.fromValues(0, 0, 1);
        this.addVertex3(position, normal, uv);
    }

    /**
     * Adds a triangle to the mesh by specifying the indices of its vertices.
     * @param i0 - The index of the first vertex.
     * @param i1 - The index of the second vertex.
     * @param i2 - The index of the third vertex.
     */
    addTriangle(i0: number, i1: number, i2: number): void {
        this.indices.push(i0, i1, i2);
    }

    /**
     * Adds a quad to the mesh by specifying the indices of its vertices.
     * @param i0 - The index of the first vertex.
     * @param i1 - The index of the second vertex.
     * @param i2 - The index of the third vertex.
     * @param i3 - The index of the fourth vertex.
     */
    addQuad(i0: number, i1: number, i2: number, i3: number): void {
        this.addTriangle(i0, i1, i2);
        this.addTriangle(i2, i3, i0);
    }

    /**
     * Builds a GFXMesh from the accumulated vertices and indices.
     * @param name - The name of the mesh.
     * @param gfx - The WebGFX instance used to create the mesh buffers.
     * @returns A GFXMesh instance containing the vertex and index buffers.
     */
    buildMesh(name: string, gfx: WebGFX): GFXMesh {
        const mesh = new GFXMesh(name);
        // Create vertex buffer
        const vertexBufferData = new Float32Array(this.vertices);
        const vertexBuffer = new GFXArrayBuffer(vertexBufferData, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, gfx);

        // Create index buffer
        const indexBufferData = new Uint32Array(this.indices);
        const indexBuffer = new GFXArrayBuffer(indexBufferData, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, gfx);

        // Set buffers to mesh
        mesh.setVertexBuffer(vertexBuffer);
        mesh.setIndexBuffer(indexBuffer, this.indices.length);

        // Clear the builder for potential reuse
        this.vertices = [];
        this.indices = [];
        this.vertexCount = 0;

        // Return the constructed mesh
        return mesh;
    }

}