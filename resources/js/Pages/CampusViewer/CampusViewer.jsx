// resources/js/Pages/CampusViewer.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { loadGLTF } from "./components/ModelLoader";
import { setupRaycaster } from "./components/RaycasterManager";
import { flyToTargetSafe, flyToMeshSafe } from "./components/ControlsManager";
import InfoPopup from "./components/InfoPopup";
import { STATIC_BUILDING_INFO } from "./data/buildingInfo";
import axios from "axios";

export default function CampusViewer() {
    const containerRef = useRef(null);
    const modelRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const rendererRef = useRef(null);
    const labelsRef = useRef([]); // group entries
    const raycasterRef = useRef(null);

    const [buildings, setBuildings] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [popupInfo, setPopupInfo] = useState(null);

    // Keep previous body style for restoration (used similarly to original)
    const prevBodyBgRef = useRef(document.body.style.background);
    const prevBodyOverflowRef = useRef(document.body.style.overflow);

    // Role ↔ mesh mapping: map mesh id to user role (adjust as needed)
    const meshRoleMap = {
        "3DGeom-1078": "bsit",
        "3DGeom-2065": "bsit",
        "3DGeom-2137": "bshm",
        "3DGeom-1110": "bshm",
        // Add more entries here for each mesh
    };

    // Helper: fetch info for a role and set popup info
    const fetchInfoForRoleAndShowPopup = async (
        role,
        clientX,
        clientY,
        groupMeta = null
    ) => {
        try {
            // Request your backend route that returns the info entries for this role
            // Expectation: controller returns JSON array of InfoBuilding records (latest first)
            const res = await axios.get(`/info-building/${role}`);
            const data = res.data;

            // If backend returns a single object instead of array, normalize
            const entries = Array.isArray(data) ? data : data ? [data] : [];

            if (entries.length === 0) {
                // No dynamic info -> show default "no info" message
                setPopupInfo({
                    id: role,
                    name: groupMeta?.name || role.toUpperCase(),
                    department: role.toUpperCase(),
                    description:
                        "No data has been posted for this building yet.",
                    count: 0,
                    x: clientX,
                    y: clientY,
                });
                return;
            }

            // Show latest entry (index 0) — adjust if your API sorts differently
            const latest = entries[0];

            setPopupInfo({
                id: role,
                // Use poster name if you store it, else role label
                name: latest.name || groupMeta?.name || role.toUpperCase(),
                department: role.toUpperCase(),
                description: latest.information || "",
                picture: latest.picture || null,
                happenings: latest.happenings || null,
                count: entries.length,
                x: clientX,
                y: clientY,
                _rawEntries: entries, // keep raw entries if you want to expand popup later
            });
        } catch (err) {
            // if request fails, fallback to static data (if any)
            console.error("Error fetching info for role", role, err);
            const staticMeta = STATIC_BUILDING_INFO[role] || null;
            setPopupInfo({
                id: role,
                name: staticMeta?.name || role.toUpperCase(),
                department: role.toUpperCase(),
                description:
                    staticMeta?.description ||
                    "Unable to fetch dynamic info (server error).",
                count: 0,
                x: clientX,
                y: clientY,
            });
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // reset some page styles (same intent as original)
        try {
            document.documentElement.style.margin = "0";
            document.body.style.margin = "0";
            document.documentElement.style.height = "100%";
            document.body.style.height = "100%";
        } catch (e) {}

        // full-viewport container
        container.style.position = "fixed";
        container.style.left = "0";
        container.style.top = "0";
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.zIndex = "0";

        prevBodyOverflowRef.current = document.body.style.overflow;
        prevBodyBgRef.current = document.body.style.background;
        try {
            document.body.style.background =
                "linear-gradient(to bottom, #87CEEB 0%, #e0f7ff 100%)";
        } catch (e) {}
        document.body.style.overflow = "hidden";

        // scene / camera / renderer
        const scene = new THREE.Scene();
        scene.background = null; // let CSS show through

        const width = container.clientWidth;
        const height = container.clientHeight;

        const camera = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            1000
        );
        camera.position.set(0, 20, 40);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
        });
        renderer.setSize(width, height);
        renderer.domElement.style.display = "block";
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.objectFit = "cover";
        renderer.setPixelRatio(1);
        renderer.shadowMap.enabled = false;
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
        container.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(10, 20, 10);
        scene.add(dir);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controls.target.set(0, 5, 0);
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI / 2 - 0.01;
        controls.screenSpacePanning = false;
        controlsRef.current = controls;

        window.__campus_camera = camera;
        window.__campus_controls = controls;

        // render-on-demand setup (same as original)
        let renderRequested = false;
        let renderTimeout = null;
        const minInterval = 80;
        let lastRenderTime = 0;
        const render = () => renderer.render(scene, camera);
        function requestRender() {
            const now = performance.now();
            const remaining = Math.max(0, minInterval - (now - lastRenderTime));
            if (renderRequested) return;
            renderRequested = true;
            renderTimeout = setTimeout(() => {
                renderRequested = false;
                lastRenderTime = performance.now();
                render();
            }, remaining);
        }
        window.__campus_requestRender = requestRender;
        controls.addEventListener("change", requestRender);

        // clouds
        let cloudsGroup = null;
        function addClouds(radius) {
            function makeCloudTexture(size = 256) {
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                const grd = ctx.createRadialGradient(
                    size / 2,
                    size / 2,
                    size * 0.05,
                    size / 2,
                    size / 2,
                    size / 2
                );
                grd.addColorStop(0, "rgba(255,255,255,0.95)");
                grd.addColorStop(0.6, "rgba(255,255,255,0.65)");
                grd.addColorStop(1, "rgba(255,255,255,0)");
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, size, size);
                const tx = new THREE.CanvasTexture(canvas);
                tx.needsUpdate = true;
                return tx;
            }

            cloudsGroup = new THREE.Group();
            const cloudTexture = makeCloudTexture(256);

            const cloudCount = Math.min(
                24,
                Math.max(6, Math.floor(radius / 8))
            );
            for (let i = 0; i < cloudCount; i++) {
                const mat = new THREE.SpriteMaterial({
                    map: cloudTexture,
                    transparent: true,
                    opacity: 0,
                    depthWrite: false,
                });
                const sprite = new THREE.Sprite(mat);
                const spread = radius * 1.6;
                sprite.position.set(
                    (Math.random() - 0.5) * spread,
                    radius * (0.8 + Math.random() * 1.0),
                    (Math.random() - 0.5) * spread
                );
                const scale = radius * (0.25 + Math.random() * 0.6);
                sprite.scale.set(scale, scale * 0.6, 1);
                cloudsGroup.add(sprite);
            }
            cloudsGroup.position.y = 0;
            scene.add(cloudsGroup);

            // fade in and drift
            let cloudFrame = 0;
            const cloudFrames = 60;
            let lastTime = performance.now();
            function animateClouds() {
                cloudFrame++;
                const t = Math.min(1, cloudFrame / cloudFrames);
                cloudsGroup.children.forEach((s, idx) => {
                    s.material.opacity = t * (0.6 + (idx % 3) * 0.12);
                    const now = performance.now();
                    const dt = (now - lastTime) / 1000;
                    s.position.x +=
                        Math.sin(now / 10000 + idx) *
                        0.02 *
                        dt *
                        Math.max(10, 1);
                });
                lastTime = performance.now();
                renderer.render(scene, camera);
                if (cloudFrame < cloudFrames)
                    requestAnimationFrame(animateClouds);
            }
            animateClouds();
        }

        // Raycaster that will be set up later via setupRaycaster
        raycasterRef.current = new THREE.Raycaster();

        // Load GLTF model
        const modelPath = "/models/psucampus.glb";
        loadGLTF(modelPath)
            .then((model) => {
                modelRef.current = model;
                scene.add(model);

                // center model like original
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                // fit camera similar to original logic
                const fitBox = new THREE.Box3().setFromObject(model);
                const boundingSphere = fitBox.getBoundingSphere(
                    new THREE.Sphere()
                );
                const radius = boundingSphere.radius || 10;
                addClouds(radius);

                const fov = (camera.fov * Math.PI) / 180;
                const distance = Math.abs(radius / Math.sin(fov / 2));
                const offsetFactor = 1.2;
                camera.position.set(
                    0,
                    radius * 0.6 + distance * 0.05,
                    distance * offsetFactor
                );
                camera.near = Math.max(0.1, distance / 100);
                camera.far = distance * 10;
                camera.lookAt(new THREE.Vector3(0, 0, 0));
                camera.updateProjectionMatrix();
                controls.target.set(0, 0, 0);
                controls.update();

                // build groups (labelsRef)
                labelsRef.current = [];
                const groups = new Map();
                let autoIndex = 1;
                model.traverse((node) => {
                    if (!node.isMesh) return;
                    const bbox = new THREE.Box3().setFromObject(node);
                    const size = new THREE.Vector3();
                    bbox.getSize(size);
                    const sizeThreshold = 0.8;
                    if (size.length() < sizeThreshold) return;

                    const nameFromUserData = node.userData?.buildingName;
                    const nameFromUserDataAlt = node.userData?.name;
                    const nodeName =
                        node.name && node.name !== "" ? node.name : null;
                    const labelText =
                        nameFromUserData ||
                        nameFromUserDataAlt ||
                        nodeName ||
                        `Building ${autoIndex++}`;

                    if (!groups.has(labelText)) groups.set(labelText, []);
                    groups.get(labelText).push(node);
                });

                const buildingsLocal = [];
                for (const [name, meshes] of groups.entries()) {
                    const groupBox = new THREE.Box3();
                    for (const m of meshes) {
                        const b = new THREE.Box3().setFromObject(m);
                        groupBox.union(b);
                    }
                    const center = groupBox.getCenter(new THREE.Vector3());
                    const sphere = groupBox.getBoundingSphere(
                        new THREE.Sphere()
                    );
                    const r =
                        sphere.radius ||
                        Math.max(
                            ...meshes.map((m) =>
                                new THREE.Box3()
                                    .setFromObject(m)
                                    .getSize(new THREE.Vector3())
                                    .length()
                            )
                        ) ||
                        5;
                    const offsetY = Math.max(
                        1,
                        groupBox.getSize(new THREE.Vector3()).y * 0.5 + 1
                    );
                    const id = name;
                    labelsRef.current.push({
                        id,
                        name,
                        meshes,
                        center,
                        radius: r,
                        offsetY,
                    });
                    buildingsLocal.push({ id, name });
                }

                setBuildings(buildingsLocal);
                requestRender();

                // initial focus (if present)
                const initialId = "3DGeom-5597";
                const foundInit = labelsRef.current.find(
                    (l) => l.id === initialId
                );
                if (foundInit) {
                    setSelectedGroupId(foundInit.id);
                    setPopupInfo({
                        id: foundInit.id,
                        name: foundInit.name,
                        count: foundInit.meshes.length,
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                    });
                    try {
                        const targetPos = foundInit.center.clone();
                        targetPos.y += foundInit.offsetY || 2;
                        const radius = foundInit.radius || 5;
                        const fov = (camera.fov * Math.PI) / 180;
                        const distance =
                            Math.abs(radius / Math.sin(fov / 2)) * 1.2;
                        const dir = new THREE.Vector3(1, 0.6, 1).normalize();
                        const newCamPos = targetPos
                            .clone()
                            .add(dir.multiplyScalar(distance));
                        camera.position.copy(newCamPos);
                        controls.target.copy(targetPos);
                        controls.update();
                        const req = window.__campus_requestRender;
                        if (req) req();
                    } catch (e) {}
                }
            })
            .catch((err) => {
                console.error("Error loading model:", err);
            });

        // onSelect callback for raycast hits
        const onSelect = (hitObject, clientX, clientY) => {
            const root = modelRef.current;
            if (!root) return;

            // find group that contains this mesh
            const group = labelsRef.current.find((g) =>
                g.meshes.some((m) => m === hitObject)
            );
            if (group) {
                // If we can map this group's id (label) to a role, try dynamic fetch first
                const possibleRole =
                    meshRoleMap[group.id] ||
                    meshRoleMap[hitObject.name] ||
                    null;
                if (possibleRole) {
                    // fetch dynamic info by role and show popup (async, but we don't await here)
                    fetchInfoForRoleAndShowPopup(
                        possibleRole,
                        clientX,
                        clientY,
                        group
                    );
                    setSelectedGroupId(group.id);
                    const req = window.__campus_requestRender;
                    if (req) req();
                    return;
                }

                // fallback to static info
                const staticMeta = STATIC_BUILDING_INFO[group.id] || null;
                setSelectedGroupId(group.id);
                setPopupInfo({
                    id: group.id,
                    name: staticMeta?.name || group.name,
                    department: staticMeta?.department,
                    description: staticMeta?.description,
                    count: group.meshes.length,
                    x: clientX,
                    y: clientY,
                });
                const req = window.__campus_requestRender;
                if (req) req();
                return;
            }

            // fallback: check by mesh name in STATIC_BUILDING_INFO or show mesh-level popup
            const byNameMeta = STATIC_BUILDING_INFO[hitObject.name] || null;
            const meshBox = new THREE.Box3().setFromObject(hitObject);
            const meshCenter = meshBox.getCenter(new THREE.Vector3());
            const meshSphere = meshBox.getBoundingSphere(new THREE.Sphere());
            const meshRadius =
                meshSphere.radius ||
                Math.max(
                    meshBox.getSize(new THREE.Vector3()).x,
                    meshBox.getSize(new THREE.Vector3()).y,
                    meshBox.getSize(new THREE.Vector3()).z
                ) * 0.5 ||
                1;

            // If this mesh itself maps to a role, try fetch dynamic info
            const directRole = meshRoleMap[hitObject.name] || null;
            if (directRole) {
                fetchInfoForRoleAndShowPopup(
                    directRole,
                    clientX,
                    clientY,
                    null
                );
                setSelectedGroupId(hitObject.name || hitObject.uuid);
                const req = window.__campus_requestRender;
                if (req) req();
                return;
            }

            setSelectedGroupId(hitObject.name || hitObject.uuid);
            setPopupInfo({
                id: hitObject.name || hitObject.uuid,
                name: byNameMeta?.name || hitObject.name || "Part",
                department: byNameMeta?.department,
                description: byNameMeta?.description,
                count: 1,
                x: clientX,
                y: clientY,
                _mesh: hitObject,
                _meshCenter: meshCenter,
                _meshRadius: meshRadius,
            });
            const req = window.__campus_requestRender;
            if (req) req();
        };

        // attach the raycaster manager that listens for pointer events
        setupRaycaster(renderer, camera, modelRef, onSelect);

        // window resize
        const onWindowResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onWindowResize);

        // initial render
        requestRender();

        // cleanup on unmount
        return () => {
            if (renderTimeout) clearTimeout(renderTimeout);
            try {
                delete window.__campus_requestRender;
            } catch (e) {}
            window.removeEventListener("resize", onWindowResize);
            controls.removeEventListener("change", requestRender);
            // cleanup renderer/controls
            try {
                renderer.domElement.remove();
            } catch (e) {}
            controls.dispose();
            renderer.dispose();
            document.body.style.overflow = prevBodyOverflowRef.current;
            try {
                delete window.__campus_camera;
                delete window.__campus_controls;
            } catch (e) {}
            if (renderer.domElement && renderer.domElement.parentNode)
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            try {
                document.body.style.background = prevBodyBgRef.current;
            } catch (e) {}
        };
    }, []); // end main useEffect

    // Sidebar interactions same as original
    const handleGroupClick = (groupId) => {
        setSelectedGroupId((prev) => (prev === groupId ? null : groupId));
    };

    const handleFlyToGroup = (groupId) => {
        const found = labelsRef.current.find((l) => l.id === groupId);
        if (found) flyToTargetSafe(found, cameraRef, controlsRef, modelRef);
    };

    const handleFlyToMesh = (groupId, meshIndex) => {
        const found = labelsRef.current.find((l) => l.id === groupId);
        if (!found) return;
        const mesh = found.meshes[meshIndex];
        if (mesh)
            flyToMeshSafe(
                mesh,
                { padding: found.offsetY || 2, animate: true, frames: 40 },
                cameraRef,
                controlsRef,
                modelRef
            );
    };

    // Camera movement helpers
    const moveCameraRelative = (forwardAmt = 0, rightAmt = 0, upAmt = 0) => {
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!camera || !controls) return;

        const forward = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(camera.quaternion)
            .setY(0)
            .normalize();
        const right = new THREE.Vector3(1, 0, 0)
            .applyQuaternion(camera.quaternion)
            .setY(0)
            .normalize();
        const up = new THREE.Vector3(0, 1, 0);

        const delta = new THREE.Vector3();
        delta.add(forward.multiplyScalar(forwardAmt));
        delta.add(right.multiplyScalar(rightAmt));
        delta.add(up.multiplyScalar(upAmt));

        camera.position.add(delta);
        controls.target.add(delta);
        controls.update();
        const req = window.__campus_requestRender;
        if (req) req();
    };
    const moveForward = () => moveCameraRelative(5, 0, 0);
    const moveBackward = () => moveCameraRelative(-5, 0, 0);
    const moveLeft = () => moveCameraRelative(0, -5, 0);
    const moveRight = () => moveCameraRelative(0, 5, 0);

    const arrowStyle = {
        border: "none",
        background: "transparent",
        fontSize: 18,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        padding: 6,
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div ref={containerRef} />

            <div
                style={{
                    position: "absolute",
                    left: 10,
                    top: 10,
                    width: 260,
                    maxHeight: "80vh",
                    overflowY: "auto",
                    padding: 8,
                    borderRadius: 8,
                    zIndex: 20,
                }}
            >
                {/* <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Buildings</h3>
                {buildings.length === 0 && (
                    <div style={{ fontSize: 13, color: "#666" }}>
                        Loading...
                    </div>
                )} */}
                {/* <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {buildings.map((b) => (
                        <li key={b.id} style={{ marginBottom: 6 }}>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    style={{
                                        flex: 1,
                                        textAlign: "left",
                                        padding: "6px 8px",
                                        borderRadius: 4,
                                        border:
                                            selectedGroupId === b.id
                                                ? "2px solid #2684FF"
                                                : "1px solid #eee",
                                        background:
                                            selectedGroupId === b.id
                                                ? "#F0F8FF"
                                                : "#fff",
                                    }}
                                    onClick={() => handleGroupClick(b.id)}
                                >
                                    {b.name}
                                </button>
                                <button
                                    title="Fly to this group"
                                    onClick={() => handleFlyToGroup(b.id)}
                                    style={{
                                        padding: "6px 8px",
                                        borderRadius: 4,
                                    }}
                                >
                                    Go
                                </button>
                            </div>

                            {selectedGroupId === b.id && (
                                <div style={{ marginTop: 8, paddingLeft: 6 }}>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            marginBottom: 6,
                                        }}
                                    >
                                        Parts:
                                    </div>
                                    <ul
                                        style={{
                                            listStyle: "none",
                                            padding: 0,
                                            margin: 0,
                                        }}
                                    >
                                        {(() => {
                                            const found =
                                                labelsRef.current.find(
                                                    (l) => l.id === b.id
                                                );
                                            if (!found)
                                                return (
                                                    <li
                                                        style={{
                                                            color: "#666",
                                                        }}
                                                    >
                                                        No parts found
                                                    </li>
                                                );
                                            return found.meshes.map(
                                                (m, idx) => (
                                                    <li
                                                        key={m.uuid}
                                                        style={{
                                                            display: "flex",
                                                            gap: 8,
                                                            marginBottom: 6,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                flex: 1,
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            {m.name || m.uuid}
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                handleFlyToMesh(
                                                                    b.id,
                                                                    idx
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    "4px 8px",
                                                                borderRadius: 4,
                                                            }}
                                                        >
                                                            Fly
                                                        </button>
                                                    </li>
                                                )
                                            );
                                        })()}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul> */}
            </div>

            {/* Popup overlay */}
            <InfoPopup
                popupInfo={popupInfo}
                onClose={() => {
                    setPopupInfo(null);
                    setSelectedGroupId(null);
                }}
                onFlyTo={() => {
                    if (!popupInfo) return;
                    const found = labelsRef.current.find(
                        (l) => l.id === popupInfo.id
                    );
                    if (found) {
                        flyToTargetSafe(
                            found,
                            cameraRef,
                            controlsRef,
                            modelRef
                        );
                    } else if (popupInfo._mesh) {
                        flyToMeshSafe(
                            popupInfo._mesh,
                            {
                                padding: popupInfo._meshRadius || 2,
                                animate: true,
                                frames: 45,
                            },
                            cameraRef,
                            controlsRef,
                            modelRef
                        );
                    }
                    setPopupInfo(null);
                }}
            />

            {/* Arrow controls (D-pad) */}
            <div
                aria-label="Camera controls"
                style={{
                    position: "fixed",
                    right: 20,
                    bottom: 20,
                    width: 120,
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 40,
                    pointerEvents: "auto",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        width: 96,
                        height: 96,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.95)",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gridTemplateRows: "repeat(3, 1fr)",
                        gap: 6,
                        padding: 6,
                    }}
                >
                    <div />
                    <button
                        onClick={() => moveForward()}
                        title="Forward"
                        style={arrowStyle}
                    >
                        ▲
                    </button>
                    <div />
                    <button
                        onClick={() => moveLeft()}
                        title="Left"
                        style={arrowStyle}
                    >
                        ◀
                    </button>
                    <div />
                    <button
                        onClick={() => moveRight()}
                        title="Right"
                        style={arrowStyle}
                    >
                        ▶
                    </button>
                    <div />
                    <button
                        onClick={() => moveBackward()}
                        title="Backward"
                        style={arrowStyle}
                    >
                        ▼
                    </button>
                    <div />
                </div>
            </div>
        </div>
    );
}
