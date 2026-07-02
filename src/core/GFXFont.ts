import * as opentype from 'opentype.js';
import { WebGFX } from './WebGFX'

type GFXGlyph = {
    width: number;
    height: number;
    bearingX: number;
    bearingY: number;
    advance: number;

    u0: number;
    v0: number;
    u1: number;
    v1: number;
}

/**
 * GFXFont class is responsible for loading a font, generating glyphs, and creating a texture atlas for rendering text in WebGPU.
 */
export default class GFXFont {
    private glyphs: Map<string, GFXGlyph> = new Map();
    private fontTexture: GPUTexture | null = null;
    private textureView: GPUTextureView | null = null;
    private fontSampler: GPUSampler | null = null;
    private bindingGroup: GPUBindGroup | null = null;
    private size: number = 0;

    constructor(size: number) {
        this.size = size;
    }

    /**
     * Creates a texture for the font glyphs.
     * @param gfx - The WebGFX instance used to access the GPU device.
     * @param width - The width of the texture.
     * @param height - The height of the texture.
     * @param layerCount - The number of layers in the texture (one for each glyph).
     */
    private createTexture(gfx: WebGFX, width: number, height: number): void {

        const texture = gfx.device.createTexture({
            size: {
                width: width,
                height: height,
            },
            format: 'r8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });

        const textureView = texture.createView();

        const sampler = gfx.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge'
        });

        this.fontTexture = texture;
        this.textureView = textureView;
        this.fontSampler = sampler;
    }

    /**
     * Copies the alpha channel data of a glyph to the font texture.
     * @param gfx - The WebGFX instance used to access the GPU device.
     * @param data - The alpha channel data of the glyph.
     * @param width - The width of the glyph.
     * @param height - The height of the glyph.
     * @param layer - The layer index in the texture array.
     * @param channel - The number of channels per pixel (default is 1 for r8unorm).
     */
    private copyDataToTexture(gfx: WebGFX, data: Uint8Array, width: number, height: number): void {
        gfx.device.queue.writeTexture(
            {
                texture: this.fontTexture!,
            },
            data.buffer,
            {
                bytesPerRow: width,
            },
            {
                width: width,
                height: height,
            }
        );
    }

    /**
     * Loads a font from a URL, generates glyphs, and creates a texture atlas for rendering text.
     * @param gfx - The WebGFX instance used to access the GPU device.
     * @param fontUrl - The URL of the font file to be loaded.
     * @param size - The size of the font to be loaded (default is 72).
     * @returns A Promise that resolves to a GFXFont instance containing the loaded font and its glyphs.
     */
    static async loadFont(gfx: WebGFX, fontUrl: string, size: number = 72): Promise<GFXFont> {
        // Load the font file using fetch and parse it with opentype.js
        const response = await fetch(fontUrl);
        if (!response.ok) throw new Error(`Failed to load font: ${fontUrl} (${response.status})`);
        const arrayBuffer = await response.arrayBuffer();

        // Define the number of glyphs to load (ASCII range)
        const glyphCount = 128;
        const font = opentype.parse(arrayBuffer);
        const scale = size / font.unitsPerEm;

        // Define the dimensions of the texture atlas
        const atlasWidth = 2048;
        const atlasHeight = 2048;

        // Create a canvas to render the glyphs into the texture atlas
        const canvas = document.createElement('canvas');
        canvas.width = atlasWidth;
        canvas.height = atlasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Failed to get 2D context from canvas.");
        ctx.clearRect(0, 0, atlasWidth, atlasHeight);
        ctx.fillStyle = 'white';

        // Create font metrics for layout of glyphs in the texture atlas
        const padding = 4;
        let penX = 0;
        let penY = 0;
        let rowHeight = 0;

        // Create a new GFXFont instance and initialize the texture
        const gfxFont = new GFXFont(size);
        gfxFont.createTexture(gfx, atlasWidth, atlasHeight);

        for (let i = 0; i < glyphCount; i++) {
            const char = String.fromCharCode(i);
            const glyph = font.charToGlyph(char);

            // Skip if glyph is not found
            if (!glyph) {
                console.warn(`Glyph for character '${char}' not found.`);
                continue;
            }

            // Handle glyphs with no bounding box (e.g., space character) – store advance only
            if (glyph.xMin == null || glyph.xMax == null || glyph.yMin == null || glyph.yMax == null) {
                gfxFont.glyphs.set(char, {
                    width: 0, height: 0,
                    bearingX: 0, bearingY: 0,
                    advance: (glyph.advanceWidth ?? 0) * scale,
                    u0: 0, v0: 0, u1: 0, v1: 0
                });
                continue;
            }

            // Calculate the dimensions of the glyph in pixels, including padding
            const glyphWidth = Math.ceil((glyph.xMax - glyph.xMin) * scale) + padding * 2;
            const glyphHeight = Math.ceil((glyph.yMax - glyph.yMin) * scale) + padding * 2;

            // Check if the glyph fits in the current row of the texture atlas
            if (penX + glyphWidth > atlasWidth) {
                penX = 0;
                penY += rowHeight;
                rowHeight = 0;
            }

            // Draw the glyph into the canvas at the current pen position
            const baseline = penY + size;
            const path = glyph.getPath(penX, baseline, size);
            path.draw(ctx);

            // Get the bounding box of the glyph to calculate UV coordinates
            const bbox = path.getBoundingBox();

            // Glyph dimensions in atlas-space
            const width = bbox.x2 - bbox.x1;
            const height = bbox.y2 - bbox.y1;

            // Font metrics for layout
            const advance = glyph.advanceWidth! * scale;
            const bearingX = bbox.x1 - penX;
            const bearingY = baseline - bbox.y1;

            // UVs from atlas-space
            const u0 = bbox.x1 / atlasWidth;
            const v0 = bbox.y1 / atlasHeight;
            const u1 = bbox.x2 / atlasWidth;
            const v1 = bbox.y2 / atlasHeight;

            // Store the glyph metrics and UVs in the GFXFont instance
            const gfxGlyph: GFXGlyph = {
                width,
                height,
                bearingX,
                bearingY,
                advance,
                u0,
                v0,
                u1,
                v1
            };
            gfxFont.glyphs.set(char, gfxGlyph);

            // Update the row height and pen position for the next glyph
            rowHeight = Math.max(rowHeight, glyphHeight);
            penX += glyphWidth;
        }

        // Extract the alpha channel from the canvas and copy it to the GPU texture
        const imageData = ctx.getImageData(0, 0, atlasWidth, atlasHeight);
        const alphaData = new Uint8Array(atlasWidth * atlasHeight);
        for (let i = 0; i < alphaData.length; i++) {
            alphaData[i] = imageData.data[i * 4 + 3]; // Extract alpha channel
        }
        gfxFont.copyDataToTexture(gfx, alphaData, atlasWidth, atlasHeight);
        console.log(`Loaded font`, gfxFont);
        return gfxFont;
    }

    /**
     * Creates buffer data for rendering the given text string using the loaded font glyphs.
     * @param text - The text string to be rendered.
     * @returns An object containing the vertex and index data as Float32Array and Uint16Array respectively.
     */
    createBufferDataForText(text: string, posX: number, posY: number): { vertices: Float32Array, indices: Uint16Array, indexCount: number } {
        // Create arrays to hold vertex and index data
        const vertices: number[] = [];
        const indices: number[] = [];

        // Create cursor positions for rendering the text
        let cursorX = posX;
        let cursorY = posY;
        let indexOffset = 0;

        // Iterate through each character in the text string and generate vertex and index data for each glyph
        for (const char of text) {
            const glyph = this.glyphs.get(char);

            // Skip if glyph is not found
            if (!glyph) {
                console.warn(`Glyph for character '${char}' not found.`);
                continue;
            }

            // Invisible glyphs (e.g. space) – only advance the cursor
            if (glyph.width === 0 || glyph.height === 0) {
                cursorX += glyph.advance;
                continue;
            }

            // Calculate the positions of the glyph quad in screen space
            const x0 = cursorX + glyph.bearingX;
            const y0 = cursorY + glyph.bearingY - glyph.height;  // We use +Y so we subtract height to get the top-left corner
            const x1 = x0 + glyph.width;
            const y1 = y0 + glyph.height;

            // Push vertex data for the glyph quad (position and UVs)
            vertices.push(
                x0, y0, glyph.u0, glyph.v1,
                x1, y0, glyph.u1, glyph.v1,
                x1, y1, glyph.u1, glyph.v0,
                x0, y1, glyph.u0, glyph.v0
            );

            // Push index data for the glyph quad (two triangles)
            indices.push(
                indexOffset, indexOffset + 1, indexOffset + 2,
                indexOffset, indexOffset + 2, indexOffset + 3
            );

            // Update the index offset and cursor position for the next glyph
            indexOffset += 4;
            cursorX += glyph.advance;
        }

        // Return the vertex and index data as typed arrays along with the index count
        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices),
            indexCount: indices.length
        };
    }

    /**
     * Creates a bind group for the font texture and sampler, allowing them to be used in a shader pipeline.
     * @param gfx - The WebGFX instance used to access the GPU device.
     * @param pipeline - The GPURenderPipeline for which the bind group is being created.
     * @param bindingIndex - The index at which the bind group will be bound in the pipeline.
     */
    createBindGroup(gfx: WebGFX, pipeline: GPURenderPipeline, bindingIndex: number): void {
        if (!this.textureView || !this.fontSampler) {
            throw new Error("Font texture or sampler not initialized.");
        }
        this.bindingGroup = gfx.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(bindingIndex),
            entries: [
                {
                    binding: 0,
                    resource: this.textureView
                },
                {
                    binding: 1,
                    resource: this.fontSampler
                }
            ]
        });
    }

    /**
     * Binds the font's bind group to the provided render pass encoder at the specified binding index.
     * @param passEncoder - The GPURenderPassEncoder to which the bind group will be bound.
     * @param bindingIndex - The index at which to bind the font's bind group.
     */
    bind(passEncoder: GPURenderPassEncoder, bindingIndex: number): void {
        if (!this.bindingGroup) {
            throw new Error("Bind group not created. Call createBindGroup() first.");
        }
        passEncoder.setBindGroup(bindingIndex, this.bindingGroup);
    }
}