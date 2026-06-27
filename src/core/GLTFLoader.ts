import Model from "@/core/Model";
import Mesh from "./Mesh";
import { getParentPath } from "@/core/Utils";
import GFXArrayBuffer from "@/core/GFXArrayBuffer";
import { WebGFX } from "@/core/WebGFX";

class GLTFBuffer {
    uri: string;
    byteLength: number;
    buffer?: ArrayBuffer; // Optional property to hold the loaded buffer data

    constructor(uri: string, byteLength: number) {
        this.uri = uri;
        this.byteLength = byteLength;
    }
}


export default class GLTFLoader {

    async load(url: string, gfx: WebGFX): Promise<Model> {
        const response = await fetch(url);
        const gltf = await response.json();

        const basePath = getParentPath(url);
        const buffers = await this.readBuffers(gltf, basePath);
        const meshes = this.parseNodes(gltf, buffers, gfx);
        console.log("Parsed meshes:", meshes);
        return new Model(meshes);
    }

    async readBuffers(gltf: any, basePath: string): Promise<GLTFBuffer[]> {
        let buffers = await Promise.all(
            gltf.buffers.map(async (buffer: GLTFBuffer) => {
                const bufferPath = `${basePath}/${buffer.uri}`;

                const response = await fetch(bufferPath);
                const arrayBuffer = await response.arrayBuffer();
                
                let gltfBuffer = new GLTFBuffer(buffer.uri, buffer.byteLength);
                gltfBuffer.buffer = arrayBuffer;
                return gltfBuffer;
            }
        ));
        return buffers;
    }

    parseNodes(gltf: any, buffers: GLTFBuffer[], gfx: WebGFX): Mesh[] {
        const meshes: Mesh[] = [];

        gltf.nodes.forEach((node: any) => {
            const name = node.name || "Unnamed Node";
            const meshIndex = node.mesh;

            // Load the mesh from the node
            const mesh = gltf.meshes[meshIndex];
            mesh.primitives.forEach((primitive: any) => {
                let gfxMesh = new Mesh(name)

                // Get the position accessor
                const positionAccessorIndex = primitive.attributes.POSITION;
                const positionAccessor = gltf.accessors[positionAccessorIndex];
                const positionBufferView = gltf.bufferViews[positionAccessor.bufferView];
                console.log("Position BufferView:", positionBufferView);

                // Get the index accessor
                const indexAccessorIndex = primitive.indices;
                const indexAccessor = gltf.accessors[indexAccessorIndex];
                const indexBufferView = gltf.bufferViews[indexAccessor.bufferView];
                console.log("Index BufferView:", indexBufferView);

                // Get the buffer for the position data
                const gltfBuffer = buffers[positionBufferView.buffer];
                if (gltfBuffer && gltfBuffer.buffer) {
                    const positionData = new Float32Array(gltfBuffer.buffer, positionBufferView.byteOffset, positionAccessor.count * 3);
                    const vertexBuffer = new GFXArrayBuffer(positionData, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, gfx);
                    gfxMesh.setVertexBuffer(vertexBuffer);
                } else {
                    console.error(`Buffer for position data not found or not loaded for node: ${name}`);
                }

                const gltfIndexBuffer = buffers[indexBufferView.buffer];
                console.log("GLTF Index Buffer:", gltfIndexBuffer);
                if (gltfIndexBuffer && gltfIndexBuffer.buffer) {
                    const indexData = new Uint16Array(gltfIndexBuffer.buffer, indexBufferView.byteOffset, indexAccessor.count);
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
}