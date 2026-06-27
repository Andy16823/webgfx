import {vec3, quat, mat4} from 'gl-matrix';
import { WebGFX } from './WebGFX';
import Texture from './Texture';

/**
 * Converts degrees to radians.
 * @param degrees - The angle in degrees.
 * @returns The angle in radians.
 */
export function getRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Converts a quaternion to Euler angles (in radians).
 * @param out - The output vector to store the Euler angles.
 * @param quat - The input quaternion to convert.
 * @returns The output vector containing the Euler angles (pitch, yaw, roll).
 */
export function quatToEuler(out: vec3, quat: quat) {
    let x = quat[0], y = quat[1], z = quat[2], w = quat[3];
    let x2 = x * x, y2 = y * y, z2 = z * z, w2 = w * w;
    let unit = x2 + y2 + z2 + w2;
    let test = x * w - y * z;

    if (test > 0.499995 * unit) {
        // Singularity at north pole
        out[0] = Math.PI / 2;
        out[1] = 2 * Math.atan2(y, x);
        out[2] = 0;
    } else if (test < -0.499995 * unit) {
        // Singularity at south pole
        out[0] = -Math.PI / 2;
        out[1] = 2 * Math.atan2(y, x);
        out[2] = 0;
    } else {
        out[0] = Math.asin(2 * (x * z - w * y));
        out[1] = Math.atan2(2 * (x * w + y * z), 1 - 2 * (z2 + w2));
        out[2] = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y2 + z2));
    }
    return out;
}

/**
 * Returns the parent path of a given file path.
 * @param path - The file path to extract the parent path from.
 * @returns The parent path of the given file path. If there is no parent, returns an empty string.
 */
export function getParentPath(path: string): string {
    const lastSlashIndex = path.lastIndexOf('/');
    if (lastSlashIndex === -1) {
        return '';
    }
    return path.substring(0, lastSlashIndex);
}

export function getDefaultAlbedoColor(): [number, number, number, number] {
    return [255, 255, 255, 255]; // White color in RGBA format
}

export function getDefaultNormalColor(): [number, number, number, number] {
    return [128, 128, 255, 255]; // Default normal map color in RGBA format
}

export function getDefaultMetallicRoughnessColor(): [number, number, number, number] {
    return [255, 255, 255, 255]; // Default metallic-roughness map color in RGBA format
}