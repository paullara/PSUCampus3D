// ModelLoader.js
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * loadGLTF(url) -> Promise<THREE.Object3D>
 * - simple promise wrapper around GLTFLoader.load
 * - returns the model scene (gltf.scene)
 */
export function loadGLTF(url) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            url,
            (gltf) => {
                const model = gltf.scene || gltf.scenes?.[0];
                resolve(model);
            },
            undefined,
            (err) => reject(err)
        );
    });
}
