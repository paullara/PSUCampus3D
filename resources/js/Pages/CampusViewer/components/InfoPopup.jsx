import React from "react";
import { X, MapPin, Clock } from "lucide-react";

const PSU_BLUE = "#003366";
const PSU_GOLD = "#FFB81C";
const PSU_LIGHT_BLUE = "#E8F0F7";

export default function InfoPopup({ popupInfo, onClose, onFlyTo }) {
    if (!popupInfo) return null;

    const info = popupInfo;

    return (
        <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
            {/* Header */}
            <div
                style={{
                    background: `linear-gradient(135deg, ${PSU_BLUE} 0%, ${PSU_BLUE}dd 100%)`,
                    padding: "10px",
                    borderRadius: "8px 8px 0 0",
                    borderBottom: `3px solid ${PSU_GOLD}`,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <MapPin size={24} color={PSU_GOLD} />
                    <h3
                        style={{
                            fontWeight: 700,
                            color: PSU_GOLD,
                            fontSize: 18,
                            margin: 0,
                            letterSpacing: 0.5,
                        }}
                    >
                        {info.name || "Building Info"}
                    </h3>
                </div>
                {/* <button
                    onClick={onClose}
                    style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: PSU_GOLD,
                        padding: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 6,
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                    }}
                    aria-label="Close"
                >
                    <X size={20} />
                </button> */}
            </div>

            {/* Content Scroll Area */}
            <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
                {/* Picture */}
                {info.picture && (
                    <div
                        style={{
                            width: "100%",
                            height: 200,
                            borderRadius: 8,
                            overflow: "hidden",
                            marginBottom: 16,
                            border: `2px solid ${PSU_BLUE}`,
                            boxShadow: "0 4px 12px rgba(0, 51, 102, 0.15)",
                        }}
                    >
                        <img
                            src={info.picture}
                            alt={info.name}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                )}

                {/* Description */}
                {info.description && (
                    <div style={{ marginBottom: 16 }}>
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: PSU_BLUE,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <div
                                style={{
                                    width: 3,
                                    height: 14,
                                    background: PSU_GOLD,
                                    borderRadius: 2,
                                }}
                            />
                            Description
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                lineHeight: 1.6,
                                color: "#333",
                                background: PSU_LIGHT_BLUE,
                                padding: 12,
                                borderRadius: 6,
                                border: `1px solid ${PSU_BLUE}`,
                            }}
                        >
                            {info.description}
                        </div>
                    </div>
                )}

                {/* Happenings */}
                {info.happenings && (
                    <div style={{ marginBottom: 16 }}>
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: PSU_BLUE,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <Clock size={14} color={PSU_GOLD} />
                            Events & Happenings
                        </div>
                        <div
                            style={{
                                padding: 12,
                                borderRadius: 6,
                                background: "#fff",
                                border: `1.5px solid ${PSU_GOLD}`,
                                transition: "all 0.2s ease",
                                lineHeight: 1.6,
                                color: "#333",
                                fontSize: 14,
                            }}
                        >
                            {info.happenings}
                        </div>
                    </div>
                )}

                {/* Video */}
                {info.video && (
                    <div style={{ marginBottom: 16 }}>
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: PSU_BLUE,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <div
                                style={{
                                    width: 3,
                                    height: 14,
                                    background: PSU_GOLD,
                                    borderRadius: 2,
                                }}
                            />
                            Video
                        </div>
                        <video
                            src={info.video}
                            controls
                            style={{
                                maxWidth: "100%",
                                borderRadius: 8,
                                border: `2px solid ${PSU_BLUE}`,
                                boxShadow: "0 4px 12px rgba(0, 51, 102, 0.15)",
                            }}
                        />
                    </div>
                )}

                {info.services && (
                    <div style={{ marginBottom: 16 }}>
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: PSU_BLUE,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            Services
                        </div>
                        <div
                            style={{
                                padding: 12,
                                borderRadius: 6,
                                background: "#fff",
                                border: `1.5px solid ${PSU_GOLD}`,
                                transition: "all 0.2s ease",
                                lineHeight: 1.6,
                                color: "#333",
                                fontSize: 14,
                            }}
                        >
                            {info.services}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    paddingTop: 16,
                    borderTop: `1px solid ${PSU_LIGHT_BLUE}`,
                }}
            >
                {/* {onFlyTo && (
                    <button
                        onClick={onFlyTo}
                        style={{
                            flex: 1,
                            background: PSU_BLUE,
                            color: "#fff",
                            border: "none",
                            padding: "12px 16px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 600,
                            transition: "all 0.2s ease",
                            boxShadow: "0 4px 12px rgba(0, 51, 102, 0.2)",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = PSU_GOLD;
                            e.target.style.color = PSU_BLUE;
                            e.target.style.boxShadow =
                                "0 6px 16px rgba(255, 184, 28, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = PSU_BLUE;
                            e.target.style.color = "#fff";
                            e.target.style.boxShadow =
                                "0 4px 12px rgba(0, 51, 102, 0.2)";
                        }}
                    >
                        Fly to Location
                    </button>
                )} */}
                <button
                    onClick={onClose}
                    style={{
                        flex: 1,
                        background: "#fff",
                        color: PSU_BLUE,
                        border: `2px solid ${PSU_BLUE}`,
                        padding: "12px 16px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = PSU_BLUE;
                        e.target.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "#fff";
                        e.target.style.color = PSU_BLUE;
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
