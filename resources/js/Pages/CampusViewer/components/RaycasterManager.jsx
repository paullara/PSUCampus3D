import * as THREE from "three";

export function setupRaycaster(renderer, camera, modelRef, onSelect) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function onPointerDown(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        const root =
            typeof modelRef === "function" ? modelRef() : modelRef.current;
        if (!root || !root.children) return;

        const objectsToCheck = [...root.children];

        const intersects = raycaster.intersectObjects(objectsToCheck, true);
        if (!intersects || intersects.length === 0) {
            onSelect(null, e.clientX, e.clientY);
            return;
        }
        const hit = intersects[0].object;
        onSelect(hit, e.clientX, e.clientY);
    }

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
}
