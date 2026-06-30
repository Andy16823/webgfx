import { mat4, vec3, quat, vec2, vec4, mat3 } from 'gl-matrix';
import { getRadians } from './Utils';

const WORLD_FRONT = vec3.fromValues(0, 0, -1);
const WORLD_UP = vec3.fromValues(0, 1, 0);
const WORLD_RIGHT = vec3.fromValues(1, 0, 0);

/**
 * Camera interface defines the methods that any camera class should implement to provide view and projection matrices.
 */
export interface Camera {
    getViewMatrix(): mat4;
    getProjectionMatrix(): mat4;
}

/**
 * PerspectiveCamera class represents a camera in 3D space with perspective projection.
 * It provides methods to get the view and projection matrices based on the camera's position, rotation, and other parameters.
 */
export class PerspectiveCamera implements Camera {
    private position: vec3;
    private rotation: quat;
    private aspect: number;
    private near: number;
    private far: number;
    private fov: number;

    /**
     * Creates a new PerspectiveCamera instance.
     * @param position - The position of the camera in 3D space.
     * @param aspect - The aspect ratio of the camera's view (width / height).
     * @param near - The near clipping plane distance.
     * @param far - The far clipping plane distance.
     * @param fov - The field of view in degrees (default is 45 degrees).
     */
    constructor(position: vec3, aspect: number, near: number = 0.1, far: number = 1000.0, fov: number = 45) {
        this.position = position;
        this.rotation = quat.create();
        this.aspect = aspect;
        this.fov = fov;
        this.near = near;
        this.far = far;
    }
    
    setAspect(aspect: number): void {
        this.aspect = aspect;
    }

    /**
     * Returns the up vector of the camera in world space, calculated based on the camera's rotation.
     * @returns A vec3 representing the up direction of the camera.
     */
    getCameraUp(): vec3 {
        return vec3.transformQuat(vec3.create(), WORLD_UP, this.rotation);
    }

    /**
     * Returns the right vector of the camera in world space, calculated based on the camera's rotation.
     * @returns A vec3 representing the right direction of the camera.
     */
    getCameraRight(): vec3 {
        return vec3.transformQuat(vec3.create(), WORLD_RIGHT, this.rotation);
    }

    /**
     * Returns the front vector of the camera in world space, calculated based on the camera's rotation.
     * @returns A vec3 representing the front direction of the camera.
     */
    getCameraFront(): vec3 {
        return vec3.transformQuat(vec3.create(), WORLD_FRONT, this.rotation);
    }

    getCameraPosition(): vec3 {
        return this.position;
    }

    getCameraPositionVec4(): vec4 {
        return vec4.fromValues(this.position[0], this.position[1], this.position[2], 1.0);
    }

    setCameraPosition(position: vec3): void {
        this.position = position;
    }

    setCameraRotation(rotation: quat): void {
        this.rotation = rotation;
    }

    lookAt(target: vec3): void {
        const direction = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), target, this.position));
        let up = vec3.fromValues(0, 1, 0);

        // Check for Gimbal Lock
        if (Math.abs(vec3.dot(direction, up)) > 0.999) {
            up = vec3.fromValues(0, 0, 1);
        }

        // Calculate the rotation quaternion
        const right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), up, direction));
        const newUp = vec3.cross(vec3.create(), direction, right);
        this.rotation = quat.fromMat3(quat.create(), mat3.fromValues(
            right[0], right[1], right[2],
            newUp[0], newUp[1], newUp[2],
            direction[0], direction[1], direction[2]
        ));
    }

    /**
     * Returns the view matrix of the camera, which transforms world coordinates into camera space.
     * @returns A mat4 representing the view matrix of the camera.
     */
    getViewMatrix(): mat4 {
        const viewMatrix = mat4.create();
        const front = this.getCameraFront();
        const target = vec3.add(vec3.create(), this.position, front);
        mat4.lookAt(viewMatrix, this.position, target, this.getCameraUp());
        return viewMatrix;
    }

    /**
     * Returns the projection matrix of the camera, which defines how 3D points are projected onto the 2D screen.
     * @returns A mat4 representing the projection matrix of the camera.
     */
    getProjectionMatrix(): mat4 {
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, getRadians(this.fov), this.aspect, this.near, this.far);
        return projectionMatrix;
    }
}

/**
 * OrthographicCamera class represents a camera in 2D space with orthographic projection.
 * It provides methods to get the view and projection matrices based on the camera's position and resolution.
 */
export class OrthographicCamera implements Camera {
    private position: vec2;
    private resolution: vec2;
    private near: number;
    private far: number;

    /**
     * Creates an instance of OrthographicCamera.
     * @param position - The position of the camera in 2D space.
     * @param resolution - The resolution of the camera's view.
     * @param near - The near clipping plane distance (default is -1).
     * @param far - The far clipping plane distance (default is 1).
     */
    constructor(position: vec2, resolution: vec2, near: number = -1, far: number = 1) {
        this.position = position;
        this.resolution = resolution;
        this.near = near;
        this.far = far;
    }

    /**
     * Returns the view matrix of the orthographic camera, which transforms world coordinates into camera space.
     * @returns A mat4 representing the view matrix of the orthographic camera.
     */
    getViewMatrix(): mat4 {
        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, vec3.fromValues(0, 0, 1), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
        return viewMatrix;
    }

    /**
     * Returns the projection matrix of the orthographic camera, which defines how 2D points are projected onto the screen.
     * @returns A mat4 representing the projection matrix of the orthographic camera.
     */
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