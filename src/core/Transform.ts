import {mat4, vec3, quat} from 'gl-matrix';
import {quatToEuler} from './Utils';

export default class Transform {
    private position: vec3;
    private rotation: quat;
    private scale: vec3;

    constructor(position: vec3 = vec3.create(), rotation: quat = quat.create(), scale: vec3 = vec3.fromValues(1, 1, 1)) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    getPosition(): vec3 {
        return this.position;
    }

    setPosition(position: vec3): void {
        this.position = position;
    }

    getRotation(): quat {
        return this.rotation;
    }

    getRotationEuler(): vec3 {
        const euler = vec3.create();
        quatToEuler(euler, this.rotation);
        return euler;
    }

    setRotation(rotation: quat): void {
        this.rotation = rotation;
    }

    setRotationEuler(euler: vec3): void {
        const q = quat.create();
        quat.fromEuler(q, euler[0], euler[1], euler[2]);
        this.rotation = q;
    }

    getScale(): vec3 {
        return this.scale;
    }

    setScale(scale: vec3): void {
        this.scale = scale;
    }

    getModelMatrix(): mat4 {
        const modelMatrix = mat4.create();
        mat4.fromRotationTranslationScale(modelMatrix, this.rotation, this.position, this.scale);
        return modelMatrix;
    }
}