import * as THREE from "three";

export function flyToTargetSafe(groupEntry, cameraRef, controlsRef, modelRef) {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || !groupEntry) return;

    // make page background transparent while flying (as in original)
    const prevBodyBg = document.body.style.background;
    const prevBodyOverflow = document.body.style.overflow;
    try {
        document.body.style.background = "transparent";
        document.body.style.overflow = "hidden";
    } catch (e) {}

    const targetPos = groupEntry.center.clone();
    targetPos.y += groupEntry.offsetY || 2;

    const radius = groupEntry.radius || 5;
    const fov = (camera.fov * Math.PI) / 180;
    const distance = Math.abs(radius / Math.sin(fov / 2)) * 1.2;

    const camDir = new THREE.Vector3();
    camDir.subVectors(camera.position, controls.target).normalize();

    const newCamPos = targetPos.clone().add(camDir.multiplyScalar(distance));

    const frames = 45;
    let i = 0;
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();

    function step() {
        i += 1;
        const t = Math.min(1, i / frames);
        camera.position.lerpVectors(startPos, newCamPos, t);
        controls.target.lerpVectors(startTarget, targetPos, t);
        controls.update();
        const req = window.__campus_requestRender;
        if (req) req();
        if (i < frames) requestAnimationFrame(step);
        else {
            try {
                document.body.style.background = prevBodyBg;
                document.body.style.overflow = prevBodyOverflow;
            } catch (e) {}
        }
    }
    step();
}

export function flyToMeshSafe(
    mesh,
    options = {},
    cameraRef,
    controlsRef,
    modelRef
) {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || !mesh) return;

    const padding = options.padding ?? 2;
    const animate = options.animate ?? true;
    const frames = options.frames ?? 45;

    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius =
        sphere.radius ||
        Math.max(
            box.getSize(new THREE.Vector3()).x,
            box.getSize(new THREE.Vector3()).y,
            box.getSize(new THREE.Vector3()).z
        ) * 0.5 ||
        1;

    const fovRad = (camera.fov * Math.PI) / 180;
    const desiredDistance = Math.abs(radius / Math.sin(fovRad / 2)) + padding;

    let dir = new THREE.Vector3();
    if (options.direction) {
        const d = options.direction;
        if (d instanceof THREE.Vector3) dir.copy(d).normalize();
        else if (Array.isArray(d)) dir.set(d[0], d[1], d[2]).normalize();
        else if (typeof d === "object" && d.x !== undefined)
            dir.set(d.x, d.y, d.z).normalize();
    } else {
        dir.subVectors(camera.position, controls.target).normalize();
    }

    let targetCamPos = center
        .clone()
        .add(dir.clone().multiplyScalar(desiredDistance));

    // avoid clipping through other geometry
    const raycaster = new THREE.Raycaster();
    const rayDir = targetCamPos.clone().sub(center).normalize();
    raycaster.set(
        center.clone().add(rayDir.clone().multiplyScalar(0.01)),
        rayDir
    );
    const root = modelRef.current || mesh.parent;
    const intersects = root
        ? raycaster.intersectObjects(root.children, true)
        : [];

    function isDescendant(obj, target) {
        let cur = obj;
        while (cur) {
            if (cur === target) return true;
            cur = cur.parent;
        }
        return false;
    }

    if (intersects && intersects.length) {
        const first = intersects.find(
            (i) => i.distance > 0.02 && !isDescendant(i.object, mesh)
        );
        if (first) {
            const safeDist = first.distance - 0.5;
            if (safeDist < desiredDistance) {
                targetCamPos = center
                    .clone()
                    .add(
                        rayDir
                            .clone()
                            .multiplyScalar(Math.max(safeDist, padding))
                    );
            }
        }
    }

    camera.near = Math.max(
        0.01,
        Math.min(camera.near, targetCamPos.distanceTo(center) / 100)
    );
    camera.far = Math.max(camera.far, targetCamPos.distanceTo(center) * 10);
    camera.updateProjectionMatrix();

    if (!animate) {
        camera.position.copy(targetCamPos);
        controls.target.copy(center);
        controls.update();
        const req = window.__campus_requestRender;
        if (req) req();
        return;
    }

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    let i = 0;
    function step() {
        i++;
        const t = Math.min(1, i / frames);
        camera.position.lerpVectors(startPos, targetCamPos, t);
        controls.target.lerpVectors(startTarget, center, t);
        controls.update();
        const req = window.__campus_requestRender;
        if (req) req();
        if (i < frames) requestAnimationFrame(step);
    }
    step();
}
