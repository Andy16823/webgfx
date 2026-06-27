import Model from "@/core/Model";
import Mesh from "./Mesh";
import { getParentPath } from "@/core/Utils";
import GFXArrayBuffer from "@/core/GFXArrayBuffer";
import { WebGFX } from "@/core/WebGFX";
import Material from "@/core/Material";
import Texture from "@/core/Texture";

/**
 * Class representing a GLTF buffer, which contains the URI and byte length of the buffer data.
 */
class GLTFBuffer {
    uri: string;
    byteLength: number;
    buffer?: ArrayBuffer; // Optional property to hold the loaded buffer data

    constructor(uri: string, byteLength: number) {
        this.uri = uri;
        this.byteLength = byteLength;
    }
}

/**
 * Class responsible for loading GLTF models and parsing their data into Mesh objects.
 * It provides methods to load GLTF files, read buffer data, and parse nodes into meshes.
 */
export default class GLTFLoader {

    /**
     * Loads a GLTF model from the specified URL and returns a Model object containing the parsed meshes.
     * @param url - The URL of the GLTF file to load.
     * @param gfx - The WebGFX instance used for creating GPU buffers.
     * @returns A Promise that resolves to a Model object containing the parsed meshes.
     */
    async load(url: string, gfx: WebGFX): Promise<Model> {
        const response = await fetch(url);
        const gltf = await response.json();

        const basePath = getParentPath(url);
        const materials = await this.readMaterials(gltf, basePath, gfx);
        console.log("Parsed materials:", materials);
        const buffers = await this.readBuffers(gltf, basePath);
        const meshes = this.parseNodes(gltf, buffers, gfx);
        console.log("Parsed meshes:", meshes);
        return new Model(meshes, materials);
    }

    /**
     * Reads the buffer data from the GLTF file and returns an array of GLTFBuffer objects containing the loaded data.
     * @param gltf - The parsed GLTF JSON object.
     * @param basePath - The base path for resolving buffer URIs.
     * @returns A Promise that resolves to an array of GLTFBuffer objects containing the loaded buffer data.
     */
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

    /**
     * Reads the materials from the GLTF file and returns an array of Material objects containing the loaded textures.
     * @param gltf - The parsed GLTF JSON object.
     * @param basePath - The base path for resolving texture URIs.
     * @param gfx - The WebGFX instance used for creating GPU textures.
     * @returns A Promise that resolves to an array of Material objects containing the loaded textures.
     * ------
     * remark: Every texture slots must be filled with a texture, if the gltf file does not have a texture for a slot, 
     * a default texture will be created and used for that slot.
     */
    async readMaterials(gltf: any, basePath: string, gfx: WebGFX): Promise<Material[]> {
        let materials = await Promise.all(
            gltf.materials.map(async (material: any) => {
                let gfxMaterial = new Material(material.name || "Unnamed Material");

                // Load base color texture if available or create a default white texture
                const baseColorTextureSrc = material.pbrMetallicRoughness?.baseColorTexture?.index !== undefined
                    ? `${basePath}/${gltf.images[material.pbrMetallicRoughness.baseColorTexture.index].uri}`
                    : undefined;

                if (baseColorTextureSrc) {
                    const baseColorImage = new Image();
                    baseColorImage.src = baseColorTextureSrc;
                    await baseColorImage.decode();
                    const baseColorTexture = Texture.fromImage(gfx, baseColorImage);
                    gfxMaterial.setAlbedoTexture(baseColorTexture);
                } else {
                    const defaultTexture = Texture.fromColor(gfx, 1, 1, [255, 255, 255, 255]);
                    gfxMaterial.setAlbedoTexture(defaultTexture);
                }

                // Load normal map texture if available or create a default normal map texture
                const normalMapTexture = material.normalTexture?.index !== undefined
                    ? `${basePath}/${gltf.images[material.normalTexture.index].uri}`
                    : undefined;

                if (normalMapTexture) {
                    const normalMapImage = new Image();
                    normalMapImage.src = normalMapTexture;
                    await normalMapImage.decode();
                    const normalMapTextureObj = Texture.fromImage(gfx, normalMapImage);
                    gfxMaterial.setNormalTexture(normalMapTextureObj);
                } else {
                    const defaultNormalTexture = Texture.fromColor(gfx, 1, 1, [128, 128, 255, 255]);
                    gfxMaterial.setNormalTexture(defaultNormalTexture);
                }

                // Load metallic-roughness texture if available or create a default metallic-roughness texture
                const metallicRoughnessTexture = material.pbrMetallicRoughness?.metallicRoughnessTexture?.index !== undefined
                    ? `${basePath}/${gltf.images[material.pbrMetallicRoughness.metallicRoughnessTexture.index].uri}`
                    : undefined;

                if (metallicRoughnessTexture) {
                    const metallicRoughnessImage = new Image();
                    metallicRoughnessImage.src = metallicRoughnessTexture;
                    await metallicRoughnessImage.decode();
                    const metallicRoughnessTextureObj = Texture.fromImage(gfx, metallicRoughnessImage);
                    gfxMaterial.setMetallicRoughnessTexture(metallicRoughnessTextureObj);
                } else {
                    const defaultMetallicRoughnessTexture = Texture.fromColor(gfx, 1, 1, [255, 255, 255, 255]);
                    gfxMaterial.setMetallicRoughnessTexture(defaultMetallicRoughnessTexture);
                }

                return gfxMaterial;
            }
            ));
        return materials;
    }

    /**
     * Parses the nodes in the GLTF file and creates Mesh objects for each node, using the provided buffer data.
     * @param gltf - The parsed GLTF JSON object.
     * @param buffers - An array of GLTFBuffer objects containing the loaded buffer data.
     * @param gfx - The WebGFX instance used for creating GPU buffers.
     * @returns An array of Mesh objects created from the parsed nodes in the GLTF file.
     */
    parseNodes(gltf: any, buffers: GLTFBuffer[], gfx: WebGFX): Mesh[] {
        const meshes: Mesh[] = [];

        gltf.nodes.forEach((node: any) => {
            const name = node.name || "Unnamed Node";
            const meshIndex = node.mesh;

            // Load the mesh from the node
            const mesh = gltf.meshes[meshIndex];
            mesh.primitives.forEach((primitive: any) => {
                let gfxMesh = new Mesh(name);
                if (primitive.material !== undefined) {
                    gfxMesh.setMaterialIndex(primitive.material);
                }

                // Get the position accessor
                const positionAccessorIndex = primitive.attributes.POSITION;
                const positionAccessor = gltf.accessors[positionAccessorIndex];
                const positionBufferView = gltf.bufferViews[positionAccessor.bufferView];
                console.log("Position BufferView:", positionBufferView);

                // Get the normal accessor
                const normalAccessorIndex = primitive.attributes.NORMAL;
                const normalAccessor = gltf.accessors[normalAccessorIndex];
                const normalBufferView = gltf.bufferViews[normalAccessor.bufferView];
                console.log("Normal BufferView:", normalBufferView);

                // Get the UV accessor
                const uvAccessorIndex = primitive.attributes.TEXCOORD_0;
                const uvAccessor = gltf.accessors[uvAccessorIndex];
                const uvBufferView = gltf.bufferViews[uvAccessor.bufferView];
                console.log("UV BufferView:", uvBufferView);

                // Get the index accessor
                const indexAccessorIndex = primitive.indices;
                const indexAccessor = gltf.accessors[indexAccessorIndex];
                const indexBufferView = gltf.bufferViews[indexAccessor.bufferView];
                console.log("Index BufferView:", indexBufferView);

                // Size definitions for vertex data
                const vertexSize = 8; // 3 for position, 3 for normal, 2 for UV
                const floatSize = 4; // Size of a float in bytes
                const vec3Size = 3 * floatSize; // Size of a vec3 in bytes
                const vec2Size = 2 * floatSize; // Size of a vec2 in bytes

                // Create the vertex buffer data
                let vertexBufferData = new Float32Array(positionAccessor.count * vertexSize); // 3 for position, 3 for normal, 2 for UV
                const vertexCount = positionAccessor.count;
                for (let i = 0; i < vertexCount; i++) {
                    // Calculate the offsets for position, normal, and UV data
                    const positionOffset = positionBufferView.byteOffset + i * vec3Size;
                    const normalOffset = normalBufferView.byteOffset + i * vec3Size;
                    const uvOffset = uvBufferView.byteOffset + i * vec2Size;

                    // Read the position, normal, and UV data from the buffers
                    const position = new Float32Array(buffers[positionBufferView.buffer].buffer!, positionOffset, 3);
                    const normal = new Float32Array(buffers[normalBufferView.buffer].buffer!, normalOffset, 3);
                    const uv = new Float32Array(buffers[uvBufferView.buffer].buffer!, uvOffset, 2);

                    // Populate the vertex buffer data with position, normal, and UV values
                    vertexBufferData[i * vertexSize] = position[0];
                    vertexBufferData[i * vertexSize + 1] = position[1];
                    vertexBufferData[i * vertexSize + 2] = position[2];
                    vertexBufferData[i * vertexSize + 3] = normal[0];
                    vertexBufferData[i * vertexSize + 4] = normal[1];
                    vertexBufferData[i * vertexSize + 5] = normal[2];
                    vertexBufferData[i * vertexSize + 6] = uv[0];
                    vertexBufferData[i * vertexSize + 7] = uv[1];
                }
                const vertexBuffer = new GFXArrayBuffer(vertexBufferData, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, gfx);
                gfxMesh.setVertexBuffer(vertexBuffer);

                // Create the index buffer data
                const gltfIndexBuffer = buffers[indexBufferView.buffer];
                console.log("GLTF Index Buffer:", gltfIndexBuffer);
                if (gltfIndexBuffer && gltfIndexBuffer.buffer) {
                    const indexData16 = new Uint16Array(gltfIndexBuffer.buffer, indexBufferView.byteOffset, indexAccessor.count);
                    const indexData = new Uint32Array(indexData16);
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