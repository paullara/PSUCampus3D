// InfoPopup.jsx
import React from "react";

/**
 * InfoPopup props:
 * - popupInfo: { id, name, department, description, count, x, y, _mesh, _meshCenter, _meshRadius }
 * - onClose(): close callback
 * - onFlyTo(): fly-to callback
 */
export default function InfoPopup({ popupInfo, onClose, onFlyTo }) {
    if (!popupInfo) return null;

    const left = Math.min(
        window.innerWidth - 340,
        (popupInfo.x || window.innerWidth / 2) + 12
    );
    const top = Math.min(
        window.innerHeight - 200,
        (popupInfo.y || window.innerHeight / 2) + 12
    );

    return (
        <div
            role="dialog"
            aria-label="Building info"
            style={{
                position: "fixed",
                left,
                top,
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
                <strong style={{ fontSize: 15 }}>{popupInfo.name}</strong>
                <button
                    onClick={onClose}
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
                <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
                    <strong>Department:</strong> {popupInfo.department}
                </div>
            )}

            {popupInfo.description && (
                <div style={{ fontSize: 13, color: "#333", marginBottom: 8 }}>
                    {popupInfo.description}
                </div>
            )}

            <div style={{ fontSize: 13, color: "#333" }}>
                Parts: {popupInfo.count}
            </div>

            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button
                    onClick={onFlyTo}
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
                    onClick={onClose}
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
    );
}
