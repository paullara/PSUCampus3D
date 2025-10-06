// resources/js/Pages/CampusViewer.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function CampusViewer() {
    const containerRef = useRef(null);
    const labelsRef = useRef([]); // group entries: { id, name, meshes, center, radius, offsetY }
    const modelRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const rendererRef = useRef(null);
    const [buildings, setBuildings] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [popupInfo, setPopupInfo] = useState(null); // { id, name, department, description, count, x, y, _mesh }

    // Static info map for initial (local) popup content.
    // Later you can replace lookups here with an API call to your backend.
    const STATIC_BUILDING_INFO = {
        "3DGeom-1078": {
            name: "Information Technology Building",
            department: "College of Information Technology",
            description:
                "This building houses computer labs, lecture rooms, and faculty offices for the IT Department.",
        },
        // add more static entries as needed:
        // "3DGeom-2056": { name: "...", department: "...", description: "..." }
    };

    useEffect(() => {
        const modelUrl = "/models/psucampus.glb";
        const container = containerRef.current;
        if (!container) return;

        // Make sure the page has no default margins and fills the viewport so the
        // 3D canvas can occupy the whole screen without white gaps.
        try {
            document.documentElement.style.margin = "0";
            document.body.style.margin = "0";
            document.documentElement.style.height = "100%";
            document.body.style.height = "100%";
        } catch (e) {}

        // Fill viewport
        container.style.position = "fixed";
        container.style.left = "0";
        container.style.top = "0";
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.zIndex = "0";

        const prevBodyOverflow = document.body.style.overflow;
        const prevBodyBg = document.body.style.background;
        // set a pleasant sky gradient as the page background
        try {
            document.body.style.background =
                "linear-gradient(to bottom, #87CEEB 0%, #e0f7ff 100%)";
        } catch (e) {}
        document.body.style.overflow = "hidden";

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        // keep scene.background null so the CSS sky shows through the canvas
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            1000
        );
        camera.position.set(0, 20, 40);

        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
        });
        // make sure the canvas covers the container exactly and is transparent so
        // the CSS background is visible behind it
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
        // Prevent the camera from tilting under the map (no bottom view).
        // Allow full 360-degree horizontal rotation (azimuth) but clamp polar angle
        // so the camera stays at or above the horizon. Adjust epsilon to taste.
        controls.minPolarAngle = 0; // radians — allow looking straight down from above
        controls.maxPolarAngle = Math.PI / 2 - 0.01; // radians — slightly above horizon
        // Ensure panning doesn't move camera vertically in screen space
        controls.screenSpacePanning = false;
        cameraRef.current = camera;
        controlsRef.current = controls;
        window.__campus_camera = camera;
        window.__campus_controls = controls;

        // local helper to fly camera to a group's center (available inside useEffect)
        // options.direction can be a THREE.Vector3, an {x,y,z} object, or an [x,y,z] array
        function flyToTargetLocal(groupEntry, options = {}) {
            const camera = cameraRef.current;
            const controls = controlsRef.current;
            if (!camera || !controls || !groupEntry) return;

            // make underlying page transparent so only the model shows
            const prevBodyOverflow = document.body.style.overflow;
            const prevBodyBg = document.body.style.background;
            document.body.style.background = "transparent";
            document.body.style.overflow = "hidden";

            const targetPos = groupEntry.center.clone();
            targetPos.y += groupEntry.offsetY || 2;

            // compute a sensible distance based on group's radius and camera fov
            const radius = groupEntry.radius || 5;
            const fov = (camera.fov * Math.PI) / 180;
            const distance = Math.abs(radius / Math.sin(fov / 2)) * 1.2;

            const camDir = new THREE.Vector3();
            if (options.direction) {
                const d = options.direction;
                if (d instanceof THREE.Vector3) {
                    camDir.copy(d).normalize();
                } else if (Array.isArray(d) && d.length >= 3) {
                    camDir.set(d[0], d[1], d[2]).normalize();
                } else if (typeof d === "object" && d.x !== undefined) {
                    camDir.set(d.x, d.y, d.z).normalize();
                } else {
                    camDir
                        .subVectors(camera.position, controls.target)
                        .normalize();
                }
            } else {
                camDir.subVectors(camera.position, controls.target).normalize();
            }

            const newCamPos = targetPos
                .clone()
                .add(camDir.multiplyScalar(distance));

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
                    // restore body styles after animation
                    try {
                        document.body.style.background = prevBodyBg;
                        document.body.style.overflow = prevBodyOverflow;
                    } catch (e) {}
                }
            }
            step();
        }

        const loader = new GLTFLoader();
        labelsRef.current = [];
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        loader.load(
            modelUrl,
            (gltf) => {
                const model = gltf.scene || gltf.scenes[0];
                if (!model) return;
                modelRef.current = model;
                scene.add(model);

                // center model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                // fit camera
                const fitBox = new THREE.Box3().setFromObject(model);
                const boundingSphere = fitBox.getBoundingSphere(
                    new THREE.Sphere()
                );
                const radius = boundingSphere.radius;
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

                // create procedural clouds and fade them in when the model loads
                (function addClouds() {
                    // helper: create a soft circular cloud texture on a canvas
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

                    const cloudsGroup = new THREE.Group();
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
                        // distribute clouds above the campus
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

                    // place clouds far enough so they appear behind building silhouettes
                    cloudsGroup.position.y = 0;
                    scene.add(cloudsGroup);

                    // fade-in animation and slow horizontal drift
                    let cloudFrame = 0;
                    const cloudFrames = 60;
                    let lastTime = performance.now();
                    function animateClouds() {
                        cloudFrame++;
                        const t = Math.min(1, cloudFrame / cloudFrames);
                        cloudsGroup.children.forEach((s, idx) => {
                            s.material.opacity = t * (0.6 + (idx % 3) * 0.12);
                            // slow drifting
                            const now = performance.now();
                            const dt = (now - lastTime) / 1000;
                            s.position.x +=
                                Math.sin(now / 10000 + idx) *
                                0.02 *
                                dt *
                                radius;
                        });
                        lastTime = performance.now();
                        renderer.render(scene, camera);
                        if (cloudFrame < cloudFrames)
                            requestAnimationFrame(animateClouds);
                    }
                    animateClouds();
                })();

                // Group meshes by label text
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

                // If a group named '3DGeom-5597' exists, focus it on initial load
                const initialId = "3DGeom-5597";
                const foundInit = labelsRef.current.find(
                    (l) => l.id === initialId
                );
                if (foundInit) {
                    // mark selected and show popup near center of screen
                    setSelectedGroupId(foundInit.id);
                    setPopupInfo({
                        id: foundInit.id,
                        name: foundInit.name,
                        count: foundInit.meshes.length,
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                    });
                    // Position camera immediately to the target (no animation)
                    try {
                        const camera = cameraRef.current;
                        const controls = controlsRef.current;
                        if (camera && controls) {
                            const targetPos = foundInit.center.clone();
                            targetPos.y += foundInit.offsetY || 2;
                            const radius = foundInit.radius || 5;
                            const fov = (camera.fov * Math.PI) / 180;
                            const distance =
                                Math.abs(radius / Math.sin(fov / 2)) * 1.2;
                            const dir = new THREE.Vector3(
                                1,
                                0.6,
                                1
                            ).normalize();
                            const newCamPos = targetPos
                                .clone()
                                .add(dir.multiplyScalar(distance));
                            camera.position.copy(newCamPos);
                            controls.target.copy(targetPos);
                            controls.update();
                            const req = window.__campus_requestRender;
                            if (req) req();
                        }
                    } catch (e) {}
                }
            },
            undefined,
            (err) => console.error("Error loading model:", err)
        );

        // click handler: detect which mesh was clicked and activate its group in the sidebar
        function onPointerDown(e) {
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);

            const root = modelRef.current;
            if (!root) return;
            // try to intersect all children (true => recursive)
            const intersects = raycaster.intersectObjects(root.children, true);
            if (!intersects || intersects.length === 0) {
                // clicked empty space -> close popup/selection
                setSelectedGroupId(null);
                setPopupInfo(null);
                const reqEmpty = window.__campus_requestRender;
                if (reqEmpty) reqEmpty();
                return;
            }
            const hit = intersects[0].object;

            // find the group that contains this mesh (mesh equality)
            const group = labelsRef.current.find((g) =>
                g.meshes.some((m) => m === hit)
            );

            if (group) {
                // found a group — use group-level info and static info override (if any)
                const staticMeta = STATIC_BUILDING_INFO[group.id] || null;
                setSelectedGroupId(group.id);
                setPopupInfo({
                    id: group.id,
                    name: staticMeta?.name || group.name,
                    department: staticMeta?.department,
                    description: staticMeta?.description,
                    count: group.meshes.length,
                    x: e.clientX,
                    y: e.clientY,
                });
                const req = window.__campus_requestRender;
                if (req) req();
                return;
            }

            // No group found — attempt to show static info by mesh name (some meshes might not be grouped)
            const byNameMeta = STATIC_BUILDING_INFO[hit.name] || null;
            if (byNameMeta || hit) {
                // compute bounding box/center for the single mesh for possible fly-to usage
                const meshBox = new THREE.Box3().setFromObject(hit);
                const meshCenter = meshBox.getCenter(new THREE.Vector3());
                const meshSphere = meshBox.getBoundingSphere(
                    new THREE.Sphere()
                );
                const meshRadius =
                    meshSphere.radius ||
                    Math.max(
                        meshBox.getSize(new THREE.Vector3()).x,
                        meshBox.getSize(new THREE.Vector3()).y,
                        meshBox.getSize(new THREE.Vector3()).z
                    ) * 0.5 ||
                    1;
                // create a temporary object descriptor (not stored in labelsRef)
                setSelectedGroupId(hit.name || hit.uuid);
                setPopupInfo({
                    id: hit.name || hit.uuid,
                    name: byNameMeta?.name || hit.name || "Part",
                    department: byNameMeta?.department,
                    description: byNameMeta?.description,
                    count: 1,
                    x: e.clientX,
                    y: e.clientY,
                    // attach mesh reference so Fly-to will work for this case
                    _mesh: hit,
                    _meshCenter: meshCenter,
                    _meshRadius: meshRadius,
                });
                const req = window.__campus_requestRender;
                if (req) req();
                return;
            }

            // fallback: clear
            setSelectedGroupId(null);
            setPopupInfo(null);
            const reqFallback = window.__campus_requestRender;
            if (reqFallback) reqFallback();
        }

        renderer.domElement.addEventListener("pointerdown", onPointerDown);

        // render-on-demand
        let renderRequested = false;
        let renderTimeout = null;
        const minInterval = 80;
        let lastRenderTime = 0;

        const render = () => renderer.render(scene, camera);
        const requestRender = () => {
            const now = performance.now();
            const remaining = Math.max(0, minInterval - (now - lastRenderTime));
            if (renderRequested) return;
            renderRequested = true;
            renderTimeout = setTimeout(() => {
                renderRequested = false;
                lastRenderTime = performance.now();
                render();
            }, remaining);
        };

        window.__campus_requestRender = requestRender;
        controls.addEventListener("change", requestRender);
        requestRender();

        const onWindowResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onWindowResize);

        // cleanup
        return () => {
            if (renderTimeout) clearTimeout(renderTimeout);
            try {
                delete window.__campus_requestRender;
            } catch (e) {}
            window.removeEventListener("resize", onWindowResize);
            controls.removeEventListener("change", requestRender);
            renderer.domElement.removeEventListener(
                "pointerdown",
                onPointerDown
            );
            controls.dispose();
            renderer.dispose();
            document.body.style.overflow = prevBodyOverflow;
            try {
                delete window.__campus_camera;
                delete window.__campus_controls;
            } catch (e) {}
            if (renderer.domElement && renderer.domElement.parentNode)
                renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    // Sidebar UI
    const handleGroupClick = (groupId) => {
        setSelectedGroupId((prev) => (prev === groupId ? null : groupId));
    };

    const handleFlyToGroup = (groupId) => {
        const found = labelsRef.current.find((l) => l.id === groupId);
        if (found) flyToTarget(found);
    };

    const handleFlyToMesh = (groupId, meshIndex) => {
        const found = labelsRef.current.find((l) => l.id === groupId);
        if (!found) return;
        const mesh = found.meshes[meshIndex];
        if (mesh)
            flyToMeshSafe(mesh, {
                padding: found.offsetY || 2,
                animate: true,
                frames: 40,
            });
    };

    // fly-to helper
    const flyToTarget = (target) => {
        const { center, radius } = target;
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!camera || !controls) return;

        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(camera.quaternion);
        const newPos = center.clone().add(direction.multiplyScalar(radius * 2));
        camera.position.copy(newPos);
        controls.target.copy(center);
        controls.update();
        const req = window.__campus_requestRender;
        if (req) req();
    };
    // restore previous body background
    try {
        document.body.style.background = prevBodyBg;
    } catch (e) {}

    const flyToMesh = (mesh, offsetY) => {
        // delegate to the safer version which performs intersection checks
        flyToMeshSafe(mesh, {
            padding: offsetY || 2,
            animate: true,
            frames: 45,
        });
    };

    // Safely fly to a mesh so the camera won't end up inside the geometry.
    // options:
    // - padding: extra distance beyond computed safe distance (units)
    // - direction: THREE.Vector3 or {x,y,z} or array; default is current camera forward inverse
    // - animate: boolean (true: animate over frames; false: snap immediately)
    // - frames: number of animation frames when animate=true
    function flyToMeshSafe(mesh, options = {}) {
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!camera || !controls || !mesh) return;

        const padding = options.padding ?? 2;
        const animate = options.animate ?? true;
        const frames = options.frames ?? 45;

        // compute center & radius using bounding box (more robust than mesh.geometry boundingSphere)
        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const radius =
            sphere.radius ||
            Math.max(
                ...[
                    box.getSize(new THREE.Vector3()).x,
                    box.getSize(new THREE.Vector3()).y,
                    box.getSize(new THREE.Vector3()).z,
                ]
            ) * 0.5 ||
            1;

        // compute distance based on camera fov so the object fits in view
        const fovRad = (camera.fov * Math.PI) / 180;
        const desiredDistance =
            Math.abs(radius / Math.sin(fovRad / 2)) + padding;

        // direction: use provided or camera's current forward vector (inverse of camera's -Z)
        let dir = new THREE.Vector3();
        if (options.direction) {
            const d = options.direction;
            if (d instanceof THREE.Vector3) dir.copy(d).normalize();
            else if (Array.isArray(d)) dir.set(d[0], d[1], d[2]).normalize();
            else if (typeof d === "object" && d.x !== undefined)
                dir.set(d.x, d.y, d.z).normalize();
        } else {
            // direction from target to camera (we want camera offset = target + dir*distance)
            dir.subVectors(camera.position, controls.target).normalize();
        }

        // preliminary camera position
        let targetCamPos = center
            .clone()
            .add(dir.clone().multiplyScalar(desiredDistance));

        // Ray test: ensure camera won't be placed inside other geometry between target and targetCamPos
        // We'll raycast from center slightly toward targetCamPos and find first intersection distance.
        const raycaster = new THREE.Raycaster();
        const rayDir = targetCamPos.clone().sub(center).normalize();
        raycaster.set(
            center.clone().add(rayDir.clone().multiplyScalar(0.01)),
            rayDir
        ); // offset start a little
        const root = modelRef.current || mesh.parent; // use model root if available
        const intersects = root
            ? raycaster.intersectObjects(root.children, true)
            : [];

        // helper to check if an object is the mesh or descendant of it
        function isDescendant(obj, target) {
            let cur = obj;
            while (cur) {
                if (cur === target) return true;
                cur = cur.parent;
            }
            return false;
        }

        if (intersects && intersects.length) {
            // find first meaningful hit that is not the mesh itself or its children
            const first = intersects.find(
                (i) => i.distance > 0.02 && !isDescendant(i.object, mesh)
            );
            if (first) {
                // stop before the hit (use a small epsilon)
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

        // clamp camera near/far to avoid clipping issues
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

        // animate: linear lerp over 'frames'
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

    // Camera movement helpers (move relative to camera orientation)
    const moveCameraRelative = (forwardAmt = 0, rightAmt = 0, upAmt = 0) => {
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!camera || !controls) return;

        // forward is -Z in camera space
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

    // style for arrow buttons
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

            {/* popup info */}
            {popupInfo && (
                <div
                    role="dialog"
                    aria-label="Building info"
                    style={{
                        position: "fixed",
                        left: Math.min(
                            window.innerWidth - 300,
                            popupInfo.x + 12
                        ),
                        top: Math.min(
                            window.innerHeight - 160,
                            popupInfo.y + 12
                        ),
                        width: 320,
                        background: "rgba(255,255,255,0.98)",
                        padding: 12,
                        borderRadius: 8,
                        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                        zIndex: 30,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                        }}
                    >
                        <strong style={{ fontSize: 15 }}>
                            {popupInfo.name}
                        </strong>
                        <button
                            onClick={() => {
                                setPopupInfo(null);
                                setSelectedGroupId(null);
                            }}
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {popupInfo.department && (
                        <div
                            style={{
                                fontSize: 13,
                                color: "#666",
                                marginBottom: 6,
                            }}
                        >
                            <strong>Department:</strong> {popupInfo.department}
                        </div>
                    )}

                    {popupInfo.description && (
                        <div
                            style={{
                                fontSize: 13,
                                color: "#333",
                                marginBottom: 8,
                            }}
                        >
                            {popupInfo.description}
                        </div>
                    )}

                    <div style={{ fontSize: 13, color: "#333" }}>
                        Parts: {popupInfo.count}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <button
                            onClick={() => {
                                const found = labelsRef.current.find(
                                    (l) => l.id === popupInfo.id
                                );
                                if (found) {
                                    // prefer group-level fly (keeps whole building in view)
                                    flyToTarget(found);
                                } else if (popupInfo._mesh) {
                                    // fallback: fly directly to the single clicked mesh
                                    flyToMeshSafe(popupInfo._mesh, {
                                        padding: popupInfo._meshRadius || 2,
                                        animate: true,
                                        frames: 45,
                                    });
                                }
                                setPopupInfo(null);
                            }}
                            style={{
                                padding: "6px 8px",
                                borderRadius: 6,
                                background: "#f0f8ff",
                                border: "1px solid #d0e6ff",
                                cursor: "pointer",
                            }}
                        >
                            Fly to
                        </button>
                        <button
                            onClick={() => setPopupInfo(null)}
                            style={{
                                padding: "6px 8px",
                                borderRadius: 6,
                                background: "#fff",
                                border: "1px solid #eee",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
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
