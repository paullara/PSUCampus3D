import React, { useState } from "react";
import Administrative from "@/Layouts/Administrative";
import { useForm } from "@inertiajs/react";

export default function BuildingInfo({ infoBuilding = [] }) {
    const [editingId, setEditingId] = useState(null);

    const {
        data,
        setData,
        put,
        delete: destroy,
    } = useForm({
        name: "",
        information: "",
    });

    const startEditing = (building) => {
        setEditingId(building.id);
        setData({
            name: building.name,
            information: building.information,
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setData({ name: "", information: "" });
    };

    const submitUpdate = (id) => {
        put(route("info.buildings.update", id), {
            onSuccess: () => {
                cancelEditing();
            },
        });
    };

    const deleteBuilding = (id) => {
        if (confirm("Delete this building?")) {
            destroy(route("info.buildings.destroy", id));
        }
    };

    return (
        <Administrative>
            <div className="max-w-4xl mx-auto mt-10">
                <h1 className="text-2xl font-semibold mb-6">
                    Building Information
                </h1>

                <div className="space-y-4">
                    {infoBuilding.map((building) => (
                        <div
                            key={building.id}
                            className="border rounded-xl p-5 bg-white shadow-sm"
                        >
                            {editingId === building.id ? (
                                // ✨ INLINE EDIT FORM
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                    />

                                    <textarea
                                        className="w-full border rounded-lg p-2"
                                        rows="4"
                                        value={data.information}
                                        onChange={(e) =>
                                            setData(
                                                "information",
                                                e.target.value
                                            )
                                        }
                                    ></textarea>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                submitUpdate(building.id)
                                            }
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                        >
                                            Save
                                        </button>

                                        <button
                                            onClick={cancelEditing}
                                            className="px-4 py-2 bg-gray-200 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // ✨ NORMAL DISPLAY MODE
                                <div className="flex justify-between">
                                    <div>
                                        <h2 className="text-lg font-medium">
                                            {building.name}
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            {building.information}
                                        </p>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                startEditing(building)
                                            }
                                            className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                deleteBuilding(building.id)
                                            }
                                            className="px-3 py-1 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Administrative>
    );
}
