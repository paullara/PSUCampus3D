import * as THREE from "three";

export function setupRaycaster(renderer, camera, modelRef, onSelect) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function onPointerDown(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        const root = modelRef.current;
        if (!root) return;
        const intersects = raycaster.intersectObjects(root.children, true);
        if (!intersects || intersects.length === 0) {
            onSelect(null, e.clientX, e.clientY);
            return;
        }
        const hit = intersects[0].object;
        onSelect(hit, e.clientX, e.clientY);
    }

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
}
