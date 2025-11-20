import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { loadGLTF } from "./components/ModelLoader";
import { setupRaycaster } from "./components/RaycasterManager";
import { flyToTargetSafe, flyToMeshSafe } from "./components/ControlsManager";
import InfoPopup from "./components/InfoPopup";
import { STATIC_BUILDING_INFO } from "./data/buildingInfo";
import axios from "axios";
import { MapPin } from "lucide-react";

export default function CampusViewer() {
    const containerRef = useRef(null);
    const modelRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const rendererRef = useRef(null);
    const labelsRef = useRef([]);
    const raycasterRef = useRef(null);

    const [buildings, setBuildings] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [popupInfo, setPopupInfo] = useState(null);
    const [pinnedItems, setPinnedItems] = useState([]);
    const [expandedPins, setExpandedPins] = useState({});

    const prevBodyBgRef = useRef(document.body.style.background);
    const prevBodyOverflowRef = useRef(document.body.style.overflow);

    const meshRoleMap = {
        "3DGeom-5559": "arts_science", // Arts and Science Building
        // "3DGeom-5586": "arts_science", // Arts and Science Building
        "3DGeom-10191": "administrative", // Administrative Building
        "3DGeom-5890": "education", // Education Building
        "3DGeom-5891": "education",
        "3DGeom-9084": "sac", // Student Activity Center
        "3DGeom-4166": "cayetano", // Cayetano Building
        "3DGeom-4179": "cayetano",
        "3DGeom-4173": "cayetano",
        "3DGeom-3337": "audiovisual", // Audio Visual Building
        "3DGeom-3332": "audiovisual",
        "3DGeom-4309": "agri", // Agriculture Building
        "3DGeom-4308": "agri",
        "3DGeom-6523": "cc", // Covered Court
        "3DGeom-6071": "cc",
        "3DGeom-6255": "cc",
        "3DGeom-1104": "academic", // Academin Building
        "3DGeom-3177": "twinbldg", // Twin Building
        "3DGeom-9669": "hm_lb", // HM Lab Building
        "3DGeom-5597": "admin",
    };

    const meshLabelMap = {
        "3DGeom-5559": "Arts and Science Building",
        // "3DGeom-5586": "Arts and Science Building",
        "3DGeom-10191": "Administrative Building",
        "3DGeom-5890": "Education Building",
        "3DGeom-5891": "Education Building",
        "3DGeom-9084": "Student Activity Center",
        "3DGeom-4166": "Cayetano Building",
        "3DGeom-4179": "Cayetano Building",
        "3DGeom-4173": "Cayetano Building",
        "3DGeom-3337": "Audio Visual Building",
        "3DGeom-3332": "Audio Visual Building",
        "3DGeom-4309": "Agriculture Building",
        "3DGeom-4308": "Agriculture Building",
        "3DGeom-6523": "Covered Court",
        "3DGeom-6071": "Covered Court",
        "3DGeom-6255": "Covered Court",
        "3DGeom-1104": "Academic Building",
        "3DGeom-3177": "Twin Building",
        "3DGeom-9669": "HM Lab Building",
        "3DGeom-5597": "General Update",
    };

    const [sideBarOpen, setSidebarOpen] = useState(true);

    const fetchInfoForRoleAndShowPopup = async (
        role,
        clientX,
        clientY,
        groupMeta = null
    ) => {
        try {
            const res = await axios.get(`/info-building/${role}`);
            const data = res.data;

            const entries = Array.isArray(data) ? data : data ? [data] : [];

            if (entries.length === 0) {
                setPopupInfo(null);
                return;
            }
            const latest = entries[0];

            setPopupInfo({
                id: role,
                name: latest.name || groupMeta?.name || role.toUpperCase(),
                department: role.toUpperCase(),
                description: latest.information || "",
                picture: latest.picture || null,
                happenings: latest.happenings || null,
                count: entries.length,
                x: clientX,
                y: clientY,
                _rawEntries: entries,
            });
        } catch (err) {
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

    function createSVGTexture(svgString, width = 256, height = 256) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);

        const texture = new THREE.CanvasTexture(canvas);

        const blob = new Blob([svgString], {
            type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            texture.needsUpdate = true;
            URL.revokeObjectURL(url);
        };
        img.onerror = () => {
            texture.needsUpdate = true;
            URL.revokeObjectURL(url);
        };
        img.src = url;
        return texture;
    }

    function makePinTextureWithLabel(
        size = 256,
        color = "#ff5a5f",
        label = ""
    ) {
        // helper to split label into a few lines (max 3)
        const words = (label || "").split(/\s+/).filter(Boolean);
        const lines = [];
        let cur = "";
        for (let w of words) {
            if (!cur) cur = w;
            else if ((cur + " " + w).length > 12 && lines.length < 2) {
                lines.push(cur);
                cur = w;
            } else {
                cur = cur ? cur + " " + w : w;
            }
        }
        if (cur) lines.push(cur);
        while (lines.length < 1) lines.push("");

        const cx = Math.round(size / 2);
        const cy = Math.round(size * 0.36);
        const radius = Math.round(size * 0.14);
        const tipY = Math.round(cy + radius * 2.2);

        // Escape text for XML
        const esc = (s) =>
            String(s)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");

        const fontSize = Math.round(size * 0.09);
        const lineHeight = Math.round(size * 0.11);

        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity="1"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0.88"/>
    </linearGradient>
  </defs>

  <!-- soft shadow -->
  <ellipse cx="${cx}" cy="${tipY + Math.round(size * 0.04)}" rx="${Math.round(
            radius * 1.25
        )}" ry="${Math.round(radius * 0.6)}" fill="rgba(0,0,0,0.18)"/>

  <!-- teardrop pin (circle + pointed tail merged via path) -->
  <path d="M ${cx} ${tipY} L ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${
            cx - radius
        } ${cy} Z" fill="url(#g)"/>

  <!-- subtle highlight -->
  <ellipse cx="${cx - Math.round(radius * 0.35)}" cy="${
            cy - Math.round(radius * 0.35)
        }" rx="${Math.round(radius * 0.45)}" ry="${Math.round(
            radius * 0.25
        )}" fill="rgba(255,255,255,0.55)"/>

  <!-- inner white center -->
  <circle cx="${cx}" cy="${cy}" r="${Math.round(radius * 0.45)}" fill="#fff"/>

  <!-- label below pin (up to 3 lines) -->
  <g font-family="sans-serif" font-size="${fontSize}" fill="#222" text-anchor="middle">
    ${lines
        .slice(0, 3)
        .map((ln, idx) => {
            const y = tipY + Math.round(lineHeight * 0.9) + idx * lineHeight;
            return `<text x="${cx}" y="${y}">${esc(ln)}</text>`;
        })
        .join("")}
  </g>
</svg>`.trim();

        return createSVGTexture(svg, size, size);
    }

    function makePinTexture(size = 128, color = "#ff5a5f") {
        const cx = Math.round(size / 2);
        const cy = Math.round(size / 2);
        const r = Math.round(size * 0.36);

        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="rg" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="0.35" stop-color="${color}" stop-opacity="1"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0.9"/>
    </radialGradient>
  </defs>

  <!-- subtle shadow -->
  <ellipse cx="${cx}" cy="${cy + Math.round(r * 0.6)}" rx="${Math.round(
            r * 1.05
        )}" ry="${Math.round(r * 0.45)}" fill="rgba(0,0,0,0.18)"/>

  <!-- main circular marker -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#rg)"/>

  <!-- inner white dot -->
  <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 0.28)}" fill="#fff"/>
</svg>`.trim();

        return createSVGTexture(svg, size, size);
    }

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        try {
            document.documentElement.style.margin = "0";
            document.body.style.margin = "0";
            document.documentElement.style.height = "100%";
            document.body.style.height = "100%";
        } catch (e) {}

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

                try {
                    const pinsGroup = new THREE.Group();
                    pinsGroup.renderOrder = 999;

                    const roleBuckets = new Map();

                    model.traverse((node) => {
                        if (!node.isMesh) return;
                        const role = meshRoleMap[node.name];
                        if (!role) return;

                        const bbox = new THREE.Box3().setFromObject(node);
                        const sphere = bbox.getBoundingSphere(
                            new THREE.Sphere()
                        );
                        const metric =
                            sphere.radius ||
                            bbox.getSize(new THREE.Vector3()).length();

                        if (!roleBuckets.has(role)) {
                            roleBuckets.set(role, {
                                nodes: [node],
                                bbox: bbox.clone(),
                                bestNode: node,
                                bestMetric: metric,
                            });
                        } else {
                            const entry = roleBuckets.get(role);
                            entry.nodes.push(node);
                            entry.bbox.union(bbox);
                            if (metric > entry.bestMetric) {
                                entry.bestMetric = metric;
                                entry.bestNode = node;
                            }
                        }
                    });

                    // Create one pin per role bucket
                    for (const [role, entry] of roleBuckets.entries()) {
                        const center = entry.bbox.getCenter(
                            new THREE.Vector3()
                        );
                        const pinScale = Math.max(
                            0.6,
                            (entry.bestMetric || 1) * 0.6
                        );

                        const displayLabel =
                            meshLabelMap[entry.bestNode.name] ||
                            entry.bestNode.userData?.buildingName ||
                            role;

                        const tex = makePinTextureWithLabel(
                            256,
                            "#ff5a5f",
                            displayLabel
                        );

                        const mat = new THREE.SpriteMaterial({
                            map: tex,
                            transparent: true,
                            depthTest: false,
                            depthWrite: false,
                            alphaTest: 0.01,
                        });

                        const sprite = new THREE.Sprite(mat);
                        sprite.position.copy(center);
                        sprite.position.y += Math.max(0.25, pinScale * 0.6);
                        sprite.scale.set(pinScale, pinScale, 1);

                        sprite.userData = {
                            isPin: true,
                            role,
                            displayName: displayLabel,
                            targetMesh: entry.bestNode,
                            meshes: entry.nodes,
                        };

                        sprite.renderOrder = 1000;
                        sprite.frustumCulled = false;
                        pinsGroup.add(sprite);
                    }

                    scene.add(pinsGroup);

                    try {
                        const officeLabelOverrides = {
                            "3DGeom-5559":
                                "GENERAL EDUCATION DEPARTMENT Office",
                            "3DGeom-5586":
                                "PRODUCTION and AUXILIARY SERVICES OFFICE",
                        };

                        const explicitMeshRoleMap = {};

                        const inferOfficeRoleFromMesh = (node, parentRole) => {
                            const s =
                                (node.name || "") +
                                " " +
                                (node.userData?.buildingName || "") +
                                " " +
                                (node.userData?.name || "");
                            const text = String(s).toLowerCase();

                            // Academic building offices
                            if (
                                text.includes("hmo") ||
                                text.includes("hospitality") ||
                                text.includes("management")
                            )
                                return "hmo";
                            if (
                                text.includes("boa") ||
                                text.includes("business") ||
                                text.includes("office administration")
                            )
                                return "boa";
                            if (
                                text.includes("it") ||
                                text.includes("information") ||
                                text.includes("technology")
                            )
                                return "it_dept";
                            if (
                                text.includes("ced") ||
                                text.includes("campus executive")
                            )
                                return "ced";
                            if (
                                text.includes("coa") ||
                                text.includes("college of agriculture") ||
                                text.includes("agriculture")
                            )
                                return "coa";

                            // Administrative building offices
                            if (text.includes("registrar")) return "registrar";
                            if (text.includes("mis")) return "mis";
                            if (
                                text.includes("administrative") &&
                                text.includes("office")
                            )
                                return "administrative_office";
                            if (text.includes("supply")) return "supply_office";
                            if (
                                text.includes("account") ||
                                text.includes("accounting")
                            )
                                return "accounting_office";
                            if (text.includes("cashier"))
                                return "cashier_office";
                            if (text.includes("library"))
                                return "library_office";

                            // SAC offices
                            if (text.includes("guidance"))
                                return "guidance_office";
                            if (
                                text.includes("student services") ||
                                text.includes("student_services") ||
                                text.includes("student service")
                            )
                                return "student_services_office";
                            if (
                                text.includes("supreme") ||
                                text.includes("student council") ||
                                text.includes("ssc")
                            )
                                return "supreme_student_council";
                            if (
                                text.includes("clinic") ||
                                text.includes("health")
                            )
                                return "clinic";

                            if (parentRole && parentRole !== node.name) {
                                const cand = (node.name || "")
                                    .toLowerCase()
                                    .replace(/[^a-z0-9_]+/g, "_");
                                if (cand && cand.length > 2) return cand;
                            }

                            return null;
                        };

                        const items = [];

                        const explicitOfficeRoles = {
                            academic: ["hmo", "boa", "it_dept", "ced", "coa"],
                            administrative: [
                                "registrar",
                                "mis",
                                "administrative_office",
                                "supply_office",
                                "accounting_office",
                                "cashier_office",
                                "library_office",
                            ],
                            sac: [
                                "guidance_office",
                                "student_services_office",
                                "supreme_student_council",
                                "clinic",
                            ],

                            arts_science: ["gened", "paso"],
                        };

                        const officeRoleLabelMap = {
                            // Academic
                            hmo: "Hospitality Management Office",
                            boa: "Business & Office Administration Department",
                            it_dept: "Information Technology Department",
                            ced: "Campus Executive Director Office",
                            coa: "College of Agriculture",

                            // Administrative
                            registrar: "Registrar's Office",
                            mis: "Management Information Systems (MIS)",
                            administrative_office: "Administrative Office",
                            supply_office: "Supply Office",
                            accounting_office: "Accounting Office",
                            cashier_office: "Cashier",
                            library_office: "Library",

                            // SAC
                            guidance_office: "Guidance Office",
                            student_services_office: "Student Services Office",
                            supreme_student_council: "Supreme Student Council",
                            clinic: "Clinic / Health Center",

                            gened: "General Education",
                            paso: "Production and Auxiliary Services Office",
                        };

                        for (const [role, entry] of roleBuckets.entries()) {
                            const rep = entry.bestNode;
                            const base = {
                                id: rep.name || rep.uuid,
                                role,
                                displayName:
                                    meshLabelMap[rep.name] ||
                                    rep.userData?.buildingName ||
                                    role,
                                mesh: rep,
                                meshes: entry.nodes,
                                children: [],
                            };

                            if (
                                [
                                    "arts_science",
                                    "academic",
                                    "administrative",
                                    "sac",
                                ].includes(role)
                            ) {
                                const repName = rep.name || rep.uuid;

                                const nodeChildren = entry.nodes
                                    .map((n) => {
                                        const id = n.name || n.uuid;
                                        const childRole =
                                            explicitMeshRoleMap[id] ||
                                            inferOfficeRoleFromMesh(n, role) ||
                                            null;

                                        const displayFromRole = childRole
                                            ? officeRoleLabelMap[childRole]
                                            : null;
                                        const display =
                                            displayFromRole ||
                                            officeLabelOverrides[id] ||
                                            meshLabelMap[id] ||
                                            n.userData?.buildingName ||
                                            n.userData?.name ||
                                            id;
                                        return {
                                            id,
                                            displayName: display,
                                            role: childRole,
                                            mesh: n,
                                        };
                                    })
                                    .filter(
                                        (c) =>
                                            c.id !== repName &&
                                            c.displayName &&
                                            c.displayName !== base.displayName
                                    );

                                const prioritized = [
                                    ...nodeChildren.filter((c) => c.role),
                                    ...nodeChildren.filter((c) => !c.role),
                                ];

                                const children = [...prioritized];

                                const explicit =
                                    explicitOfficeRoles[role] || [];
                                for (const officeRole of explicit) {
                                    const already = children.some(
                                        (c) =>
                                            c.role === officeRole ||
                                            c.id === officeRole
                                    );
                                    if (!already) {
                                        const staticMeta =
                                            STATIC_BUILDING_INFO[officeRole] ||
                                            {};
                                        const formal =
                                            officeRoleLabelMap[officeRole] ||
                                            staticMeta?.name ||
                                            officeRole;
                                        children.push({
                                            id: officeRole,
                                            displayName: formal,
                                            role: officeRole,
                                            mesh: null,
                                        });
                                    }
                                }

                                base.children = children;
                            }

                            items.push(base);
                        }
                        setPinnedItems(items);
                    } catch (e) {
                        console.warn("Failed to collect pinned items:", e);
                    }

                    const req = window.__campus_requestRender;
                    if (req) req();
                } catch (e) {
                    console.warn("Failed to create pins:", e);
                }

                // initial focus
                const initialId = "3DGeom-5597";
                const foundInit = labelsRef.current.find(
                    (l) => l.id === initialId
                );
                if (foundInit) {
                    setSelectedGroupId(foundInit.id);

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

        const onSelect = (hitObject, clientX, clientY) => {
            const root = modelRef.current;
            if (!root) return;

            if (hitObject.userData?.isPin) {
                const role = hitObject.userData.role || null;
                const displayName = hitObject.userData.displayName || null;
                if (role) {
                    fetchInfoForRoleAndShowPopup(
                        role,
                        clientX,
                        clientY,
                        displayName ? { name: displayName } : null
                    );
                    setSelectedGroupId(
                        hitObject.userData.targetMesh?.name ||
                            hitObject.userData.targetMesh?.uuid
                    );
                    const req = window.__campus_requestRender;
                    if (req) req();
                    return;
                }
            }

            const directRole = meshRoleMap[hitObject.name];

            if (!directRole) return;

            fetchInfoForRoleAndShowPopup(directRole, clientX, clientY, null);
            setSelectedGroupId(hitObject.name || hitObject.uuid);
            const req = window.__campus_requestRender;
            if (req) req();
        };
        setupRaycaster(
            renderer,
            camera,
            () => ({
                children: [
                    modelRef.current,
                    ...scene.children.filter((c) => c.renderOrder >= 999),
                ],
            }),
            onSelect
        );

        const onWindowResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onWindowResize);

        requestRender();

        return () => {
            if (renderTimeout) clearTimeout(renderTimeout);
            try {
                delete window.__campus_requestRender;
            } catch (e) {}
            window.removeEventListener("resize", onWindowResize);
            controls.removeEventListener("change", requestRender);

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
    }, []);

    const handleFlyToPin = (pin) => {
        if (!pin || !pin.mesh) return;
        try {
            flyToMeshSafe(
                pin.mesh,
                {
                    padding: Math.max(2, pin.mesh.userData?.padding || 2),
                    animate: true,
                    frames: 45,
                },
                cameraRef,
                controlsRef,
                modelRef
            );
            setSelectedGroupId(pin.mesh.name || pin.id);
            const req = window.__campus_requestRender;
            if (req) req();
        } catch (e) {
            console.warn("Fly to pin failed:", e);
        }
    };

    const handleOpenInfo = (pin) => {
        if (!pin) return;
        try {
            if (pin.role) {
                fetchInfoForRoleAndShowPopup(
                    pin.role,
                    window.innerWidth / 2,
                    window.innerHeight / 2,
                    { name: pin.displayName }
                );
                setSelectedGroupId(pin.mesh?.name || pin.id);
            } else {
                const staticMeta = STATIC_BUILDING_INFO[pin.id] || null;
                setPopupInfo({
                    id: pin.id,
                    name: staticMeta?.name || pin.displayName || pin.id,
                    department: staticMeta?.department,
                    description: staticMeta?.description,
                    count: pin.mesh ? 1 : 0,
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                });
                setSelectedGroupId(pin.id);
            }
            const req = window.__campus_requestRender;
            if (req) req();
        } catch (e) {
            console.warn("Open info failed:", e);
        }
    };

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

    const PSU_BLUE = "#003366"; // PSU Blue
    const PSU_GOLD = "#FFB81C"; // PSU Gold
    const PSU_LIGHT_BLUE = "#E8F0F7";

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div ref={containerRef} />
            {/* Show button when hidden */}
            {!sideBarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    style={{
                        position: "absolute",
                        left: 10,
                        top: 10,
                        zIndex: 30,
                        background: PSU_BLUE,
                        color: "white",
                        border: "none",
                        padding: "10px 14px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                    }}
                >
                    Show Buildings
                </button>
            )}

            {/* PSU Buildings Sidebar */}
            {sideBarOpen && (
                <div
                    style={{
                        position: "absolute",
                        left: 10,
                        top: 10,
                        width: 330,
                        maxHeight: "100vh",
                        overflowY: "auto",
                        padding: 0,
                        borderRadius: 12,
                        zIndex: 20,
                        background: "#ffffff",
                        boxShadow: "0 4px 20px rgba(0, 51, 102, 0.15)",
                        border: `2px solid ${PSU_BLUE}`,
                    }}
                >
                    <div
                        style={{
                            background: `linear-gradient(135deg, ${PSU_BLUE} 0%, ${PSU_BLUE}dd 100%)`,
                            padding: "16px 20px",
                            borderRadius: "10px 10px 0 0",
                            borderBottom: `3px solid ${PSU_GOLD}`,
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 700,
                                color: PSU_GOLD,
                                fontSize: 16,
                                letterSpacing: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <MapPin size={20} color={PSU_GOLD} />
                                PSU BUILDINGS
                            </div>

                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="text-gray-400 hover:text-gray-200 text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div
                        style={{
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        {pinnedItems.length === 0 ? (
                            <div
                                style={{
                                    color: "#999",
                                    fontSize: 13,
                                    textAlign: "center",
                                    padding: "20px 10px",
                                }}
                            >
                                Loading campus buildings...
                            </div>
                        ) : (
                            pinnedItems.map((p) => {
                                const isExpanded = !!expandedPins[p.id];
                                const isSelected =
                                    selectedGroupId === (p.mesh?.name || p.id);

                                return (
                                    <div key={p.id}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                background: isSelected
                                                    ? PSU_LIGHT_BLUE
                                                    : "#f8f9fa",
                                                padding: "10px 12px",
                                                borderRadius: 8,
                                                border: isSelected
                                                    ? `2px solid ${PSU_BLUE}`
                                                    : "1px solid #e0e0e0",
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    flex: 1,
                                                }}
                                            >
                                                {p.children &&
                                                    p.children.length > 0 && (
                                                        <button
                                                            onClick={() =>
                                                                setExpandedPins(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [p.id]:
                                                                            !prev[
                                                                                p
                                                                                    .id
                                                                            ],
                                                                    })
                                                                )
                                                            }
                                                            style={{
                                                                border: "none",
                                                                background:
                                                                    "transparent",
                                                                cursor: "pointer",
                                                                padding: 4,
                                                                fontSize: 14,
                                                                color: PSU_BLUE,
                                                                transition:
                                                                    "transform 0.2s",
                                                                transform:
                                                                    isExpanded
                                                                        ? "rotate(180deg)"
                                                                        : "rotate(0)",
                                                            }}
                                                            aria-label={
                                                                isExpanded
                                                                    ? "Collapse"
                                                                    : "Expand"
                                                            }
                                                        >
                                                            ▾
                                                        </button>
                                                    )}
                                                {!p.children ||
                                                    (p.children.length ===
                                                        0 && (
                                                        <div
                                                            style={{
                                                                width: 24,
                                                            }}
                                                        />
                                                    ))}
                                                <div style={{ flex: 1 }}>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: PSU_BLUE,
                                                        }}
                                                    >
                                                        {p.displayName}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 6,
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleFlyToPin(p)
                                                    }
                                                    style={{
                                                        background: PSU_BLUE,
                                                        color: "#fff",
                                                        border: "none",
                                                        padding: "6px 10px",
                                                        borderRadius: 6,
                                                        cursor: "pointer",
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        transition:
                                                            "all 0.2s ease",
                                                        boxShadow:
                                                            "0 2px 8px rgba(0, 51, 102, 0.2)",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.background =
                                                            PSU_GOLD;
                                                        e.target.style.color =
                                                            PSU_BLUE;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.background =
                                                            PSU_BLUE;
                                                        e.target.style.color =
                                                            "#fff";
                                                    }}
                                                >
                                                    Fly
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleOpenInfo(p)
                                                    }
                                                    style={{
                                                        background: "#fff",
                                                        color: PSU_BLUE,
                                                        border: `1.5px solid ${PSU_BLUE}`,
                                                        padding: "6px 10px",
                                                        borderRadius: 6,
                                                        cursor: "pointer",
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        transition:
                                                            "all 0.2s ease",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.background =
                                                            PSU_BLUE;
                                                        e.target.style.color =
                                                            "#fff";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.background =
                                                            "#fff";
                                                        e.target.style.color =
                                                            PSU_BLUE;
                                                    }}
                                                >
                                                    Info
                                                </button>
                                            </div>
                                        </div>

                                        {/* Children List */}
                                        {p.children &&
                                            p.children.length > 0 &&
                                            isExpanded && (
                                                <div
                                                    style={{
                                                        marginTop: 8,
                                                        marginLeft: 0,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 6,
                                                        paddingLeft: 12,
                                                        borderLeft: `3px solid ${PSU_GOLD}`,
                                                    }}
                                                >
                                                    {p.children.map((c) => (
                                                        <div
                                                            key={c.id}
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "space-between",
                                                                padding:
                                                                    "8px 10px",
                                                                borderRadius: 6,
                                                                background:
                                                                    "#f0f4f8",
                                                                border: "1px solid #d0d9e8",
                                                                transition:
                                                                    "all 0.2s ease",
                                                            }}
                                                            onMouseEnter={(
                                                                e
                                                            ) => {
                                                                e.currentTarget.style.background =
                                                                    PSU_LIGHT_BLUE;
                                                                e.currentTarget.style.borderColor =
                                                                    PSU_GOLD;
                                                            }}
                                                            onMouseLeave={(
                                                                e
                                                            ) => {
                                                                e.currentTarget.style.background =
                                                                    "#f0f4f8";
                                                                e.currentTarget.style.borderColor =
                                                                    "#d0d9e8";
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    flex: 1,
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        fontSize: 12,
                                                                        color: "#333",
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    {
                                                                        c.displayName
                                                                    }
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenInfo(
                                                                        c
                                                                    )
                                                                }
                                                                style={{
                                                                    background:
                                                                        PSU_GOLD,
                                                                    color: PSU_BLUE,
                                                                    border: "none",
                                                                    padding:
                                                                        "4px 8px",
                                                                    borderRadius: 4,
                                                                    cursor: "pointer",
                                                                    fontSize: 11,
                                                                    fontWeight: 600,
                                                                    transition:
                                                                        "all 0.2s ease",
                                                                }}
                                                                onMouseEnter={(
                                                                    e
                                                                ) => {
                                                                    e.target.style.background =
                                                                        PSU_BLUE;
                                                                    e.target.style.color =
                                                                        PSU_GOLD;
                                                                }}
                                                                onMouseLeave={(
                                                                    e
                                                                ) => {
                                                                    e.target.style.background =
                                                                        PSU_GOLD;
                                                                    e.target.style.color =
                                                                        PSU_BLUE;
                                                                }}
                                                            >
                                                                Info
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            <div
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    width: 340,
                    height: "100vh",
                    background: "rgba(255,255,255,0.98)",
                    boxShadow: "2px 0 16px rgba(0,0,0,0.10)",
                    zIndex: 100,
                    padding: 24,
                    overflowY: "auto",
                    transition: "transform 0.3s",
                    transform: popupInfo
                        ? "translateX(0)"
                        : "translateX(-110%)",
                    pointerEvents: popupInfo ? "auto" : "none",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {popupInfo && (
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
                )}
            </div>

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
            ></div>
        </div>
    );
}
