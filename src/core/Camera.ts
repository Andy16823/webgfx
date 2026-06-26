import { mat4, vec3, quat, vec2 } from 'gl-matrix';
import { getRadians } from './Utils';

const WORLD_FRONT = vec3.fromValues(0, 0, -1);
const WORLD_UP = vec3.fromValues(0, 1, 0);
const WORLD_RIGHT = vec3.fromValues(1, 0, 0);

export class PerspectiveCamera {
    private position: vec3;
    private rotation: quat;
    private aspect: number;
    private near: number;
    private far: number;
    private fov: number;

    constructor(position: vec3, aspect: number, near: number = 0.1, far: number = 1000.0, fov: number = 45) {
        this.position = position;
        this.rotation = quat.create();
        this.aspect = aspect;
        this.fov = fov;
        this.near = near;
        this.far = far;
    }

    getCameraUp(): vec3 {
        return vec3.transformQuat(vec3.create(), WORLD_UP, this.rotation);
    }

    getCameraRight(): vec3 {
        return vec3.transformQuat(vec3.create(), WORLD_RIGHT, this.rotation);
    }

    getCameraFront(): vec3 {
        return vec3.transformQuat(vec3.create(), WORLD_FRONT, this.rotation);
    }

    getViewMatrix(): mat4 {
        const viewMatrix = mat4.create();
        const front = this.getCameraFront();
        const target = vec3.add(vec3.create(), this.position, front);
        mat4.lookAt(viewMatrix, this.position, target, this.getCameraUp());
        return viewMatrix;
    }

    getProjectionMatrix(): mat4 {
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, getRadians(this.fov), this.aspect, this.near, this.far);
        return projectionMatrix;
    }
}

export class OrthographicCamera {
    private position: vec2;
    private resolution: vec2;
    private near: number;
    private far: number;

    constructor(position: vec2, resolution: vec2, near: number = -1, far: number = 1) {
        this.position = position;
        this.resolution = resolution;
        this.near = near;
        this.far = far;
    }

    getViewMatrix(): mat4 {
        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, vec3.fromValues(0, 0, 1), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
        return viewMatrix;
    }

    getProjectionMatrix(): mat4 {
        const halfWidth = this.resolution[0] / 2;
        const halfHeight = this.resolution[1] / 2;

        const left = this.position[0] - halfWidth;
        const right = this.position[0] + halfWidth;
        const bottom = this.position[1] - halfHeight;
        const top = this.position[1] + halfHeight;

        const projectionMatrix = mat4.create();
        mat4.ortho(projectionMatrix, left, right, bottom, top, this.near, this.far);
        return projectionMatrix;
    }
}