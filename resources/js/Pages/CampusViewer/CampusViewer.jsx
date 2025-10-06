import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { loadGLTF } from "./components/ModelLoader";
import { setupRaycaster } from "./components/RaycasterManager";
import { flyToTargetSafe, flyToMeshSafe } from "./components/ControlsManager";
import InfoPopup from "./components/InfoPopup";
import { STATIC_BUILDING_INFO } from "./data/buildingInfo";

export default function CampusViewer() {
    const containerRef = useRef(null);
    const modelRef = useRef(null);
    const cameraRef = useRef(null);
    const controlRef = useRef(null);
    const rendererRef = useRef(null);
    const labelsRef = useRef(null);
    const raycasterRef = useRef(null);

    // buildings
    const [buildings, setBuildings] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [popupInformation, setPopupInformation] = useState(null);

    // keep the old css
    const prevBodyBgRef = useRef(document.body.style.background);
    const prevBodyOverFlowRef = useRef(document.body.style.overflow);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        // reset
        try {
            document.documentElement.style.margin = "0";
            document.body.style.margin = "0";
            document.documentElement.style.height = "100% ";
            document.body.style.height = "100%";
        } catch (e) {
            console.error("Error", e);
        }

        // fullview
        container.style.position = "0";
        container.style.left = "0";
        container.style.top = "0";
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.zIndex = "0";

        prevBodyOverFlowRef.current = document.body.style.overFlow;
        prevBodyBgRef.current = document.body.style.background;
        try {
            document.body.style.background =
                "linear-gradient(to bottom, #87CEEB, #e0f7ff, 100%)";
        } catch (e) {}
        document.body.style.overflow = "hidden";

        const scene = new THREE.Scene();
        scene.background = null;

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

        // renderer
        const renderer = new THREE.WebGLRenderer({
            antilias: false,
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

        // ambient
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(10, 20, 10);
        scene.add(dir);

        // controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controls.target.set(0, 5, 0);
        controls.minPolarAngle = Math.PI / 2 - 0.01;
        controls.screenSpacePanning = false;
        controlRef.current = controls;

        window.__campus_camera = camera;
        window.__campus_controls = controls;

        let renderRequest = false;
        let renderTimeout = null;
        const minInterval = 80;
        let lastRenderTime = 0;
        const render = () => renderer.render(scene, camera);
        function requestRender() {
            const now = performance.now();
            const remaining = Math.max(0, minInterval - (now - lastRenderTime));
            if (renderRequest) return;
            returnRequest = true;
            renderTimeout = setTimeout(() => {
                renderRequest = false;
                lastRenderTime = performance.now();
                render();
            }, remaining);
        }
        window.__campus_requestRender = requestRender;
        controls.addEventListener("change", requestRender);

        raycasterRef.current = new THREE.Raycaster();

        const modelPath = "/models/psucampus.glb";
        loadGLTF(modelPath)
            .then((model) => {
                modelRef.current = model;
                scene.add(model);

                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                const fitBox = new THREE.Box3().setFromObject(model);
                const boundingSphere = fitBox(new THREE.Sphere());
                const radius = boundingSphere.sphere || 10;

                const fov = (camera.fov * Math.PI) / 180;
                const distance = Math.abs(radius / Math.sin(fov / 2));
                const offsetFactor = 1.2;
                camera.position.set(
                    2,
                    radius * 0.6 + distance * 0.07,
                    distance * offsetFactor
                );
                camera.near = Math.max(0.4, distance / 100);
                camera.far = distance * 10;
                camera.lookAt(new THREE.Vector3(0, 0, 0));
                camera.updateProjectMatrix();
                controls.target.set(0, 0, 0);
                controls.update();

                // mesh groupings
                labelsRef.current = [];
                const groups = new Map();
                let autoIndex = 1;
                model.traverse((node) => {
                    if (!node.isMesh) return;
                    const bbox = new THREE.Box3().setFromObject(node);
                    const size = new THREE.Vector3();
                    bbox.getSize(size); // Anna Maliit ^_^;
                    const sizeThresHold = 0.8;
                    if (size.length() < sizeThresHold) return;

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
                    const offSetY = Math.max(
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
                        offSetY,
                    });
                    buildingsLocal.push({ id, name });
                }
            })
            .catch((err) => {
                console.error("Error loading models", err);
            });
    });

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
                    background: "rgba(255,255,255,0.95)",
                    padding: 8,
                    borderRadius: 8,
                    zIndex: 20,
                }}
            >
                <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Buildings</h3>
                {buildings.length === 0 && (
                    <div style={{ fontSize: 13, color: "#666" }}>
                        Loading...
                    </div>
                )}
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
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
                </ul>
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
                    // prefer group-level
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

            {/* Arrow controls */}
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
