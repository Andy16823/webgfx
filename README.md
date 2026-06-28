# @andy16823/webgfx

WebGPU graphics library with reusable core classes for scenes, cameras, meshes, materials, loaders, and utility helpers.

## Build

```bash
npm run build:lib
```

Build output is generated in `dist/`.

## Publish

```bash
npm version patch
npm publish --access public
```

If your npm account requires 2FA for publish, use:

```bash
npm publish --access public --otp=123456
```

## Install

```bash
npm i @andy16823/webgfx
```

## Example Import

```ts
import { WebGFX, PerspectiveCamera, Transform } from "@andy16823/webgfx";
```
