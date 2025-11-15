import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import CampusViewer from "@/Pages/CampusViewer/CampusViewer";

export default function SchoolMap() {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="w-full h-full">
                <CampusViewer />
            </div>
        </div>
    );
}
