import {mat4, vec3, quat} from 'gl-matrix';
import {quatToEuler} from './Utils';

/**
 * Class representing a transform in 3D space, including position, rotation, and scale.
 */
export default class Transform {
    private position: vec3;
    private rotation: quat;
    private scale: vec3;

    /**
     * Creates an instance of Transform.
     * @param position - The initial position of the transform.
     * @param rotation - The initial rotation of the transform as a quaternion.
     * @param scale - The initial scale of the transform.
     */
    constructor(position: vec3 = vec3.create(), rotation: quat = quat.create(), scale: vec3 = vec3.fromValues(1, 1, 1)) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    /**
     * Returns the position of the transform.
     * @returns The position as a vec3.
     */
    getPosition(): vec3 {
        return this.position;
    }

    /**
     * Sets the position of the transform.
     * @param position - The new position as a vec3.
     */
    setPosition(position: vec3): void {
        this.position = position;
    }

    /**
     * Returns the rotation of the transform as a quaternion.
     * @returns The rotation as a quat.
     */
    getRotation(): quat {
        return this.rotation;
    }

    /**
     * Returns the rotation of the transform as Euler angles in degrees.
     * @returns The rotation as a vec3 representing Euler angles (pitch, yaw, roll).
     */
    getRotationEuler(): vec3 {
        const euler = vec3.create();
        quatToEuler(euler, this.rotation);
        return euler;
    }

    /**
     * Sets the rotation of the transform as a quaternion.
     * @param rotation - The new rotation as a quat.
     */
    setRotation(rotation: quat): void {
        this.rotation = rotation;
    }

    /**
     * Sets the rotation of the transform using Euler angles in degrees.
     * @param euler - The new rotation as a vec3 representing Euler angles (pitch, yaw, roll).
     */
    setRotationEuler(euler: vec3): void {
        const q = quat.create();
        quat.fromEuler(q, euler[0], euler[1], euler[2]);
        this.rotation = q;
    }

    /**
     * Returns the scale of the transform.
     * @returns The scale as a vec3.
     */
    getScale(): vec3 {
        return this.scale;
    }

    /**
     * Sets the scale of the transform.
     * @param scale - The new scale as a vec3.
     */
    setScale(scale: vec3): void {
        this.scale = scale;
    }

    /**
     * Returns the model matrix of the transform.
     * @returns The model matrix as a mat4.
     */
    getModelMatrix(): mat4 {
        const modelMatrix = mat4.create();
        mat4.fromRotationTranslationScale(modelMatrix, this.rotation, this.position, this.scale);
        return modelMatrix;
    }
}