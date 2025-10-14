import React from "react";

export default function InfoPopup({ popupInfo, onClose, onFlyTo }) {
    if (!popupInfo) return null;

    const info = popupInfo._rawEntries ? popupInfo._rawEntries[0] : popupInfo;

    return (
        <div style={{ fontSize: 14, lineHeight: 1.4, padding: 8 }}>
            <button
                onClick={onClose}
                style={{
                    float: "right",
                    background: "#eee",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: 16,
                }}
                aria-label="Close"
            >
                ×
            </button>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18 }}>
                {info.name || "Building Info"}
            </h3>
            <div style={{ marginBottom: 6 }}>
                <strong>Description:</strong>{" "}
                <span style={{ color: "#333" }}>
                    {info.information || "No description."}
                </span>
            </div>
            {info.happenings && (
                <div style={{ marginBottom: 6 }}>
                    <strong>Happenings:</strong>{" "}
                    <span style={{ color: "#333" }}>{info.happenings}</span>
                </div>
            )}
            {info.picture && (
                <div style={{ marginBottom: 6 }}>
                    <img
                        src={info.picture}
                        alt="Building"
                        style={{
                            maxWidth: "100%",
                            borderRadius: 6,
                            marginTop: 2,
                            marginBottom: 2,
                        }}
                    />
                </div>
            )}
            {info.video && (
                <div style={{ marginBottom: 6 }}>
                    <video
                        src={info.video}
                        controls
                        style={{
                            maxWidth: "100%",
                            borderRadius: 6,
                            marginTop: 2,
                            marginBottom: 2,
                        }}
                    />
                </div>
            )}
            <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
                {/* <span>
                    <strong>User ID:</strong> {info.user_id}
                </span>
                <span>
                    <strong>ID:</strong> {info.id}
                </span> */}
            </div>
            {onFlyTo && (
                <button
                    onClick={onFlyTo}
                    style={{
                        marginTop: 8,
                        background: "#2684FF",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: 14,
                    }}
                >
                    Fly To
                </button>
            )}
        </div>
    );
}
