import React, { useEffect, useState } from "react";
import BOA from "@/Layouts/BOA";
import axios from "axios";

export default function HappeningPosting() {
    const [happeningsList, setHappeningsList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        happenings: "",
        picture: null,
        video: null,
    });

    const [preview, setPreview] = useState({
        picture: null,
        video: null,
    });

    useEffect(() => {
        axios
            .get("/happenings/json")
            .then((res) => {
                setHappeningsList(res.data.happenings || []);
            })
            .catch((err) => console.error("Failed to fetch happenings", err));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        setForm({ ...form, [name]: file });

        setPreview((prev) => ({
            ...prev,
            [name]: file ? URL.createObjectURL(file) : null,
        }));
    };

    const storeHappenings = async () => {
        const formData = new FormData();
        formData.append("happenings", form.happenings);
        if (form.picture) formData.append("picture", form.picture);
        if (form.video) formData.append("video", form.video);

        const res = await axios.post("/happenings", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        setHappeningsList([res.data, ...happeningsList]);
    };

    const updateHappenings = async () => {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("happenings", form.happenings);

        if (form.picture) formData.append("picture", form.picture);
        if (form.video) formData.append("video", form.video);

        const res = await axios.post(`/happenings/${editingId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        setHappeningsList((prev) =>
            prev.map((h) => (h.id === editingId ? res.data : h))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                await updateHappenings();
            } else {
                await storeHappenings();
            }

            resetForm();
        } catch (err) {
            console.error("Failed to submit form", err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (happening) => {
        setEditingId(happening.id);

        setForm({
            happenings: happening.happenings,
            picture: null,
            video: null,
        });

        setPreview({
            picture: happening.picture || null,
            video: happening.video || null,
        });
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this happening?")) return;

        try {
            await axios.delete(`/happenings/${id}`);
            setHappeningsList(happeningsList.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete happening.");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ happenings: "", picture: null, video: null });
        setPreview({ picture: null, video: null });
    };

    return (
        <BOA>
            <div className="bg-white rounded-2xl shadow p-6 w-full">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    {editingId ? "Edit Happening" : "Add Happening"}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                    className="space-y-4"
                >
                    {/* Text */}
                    <input
                        type="text"
                        placeholder="Happenings"
                        name="happenings"
                        value={form.happenings}
                        onChange={handleChange}
                        className="w-full border-gray-300 rounded-lg px-3 py-2"
                        required
                    />

                    {/* Picture */}
                    <div>
                        <label className="text-sm text-gray-600">Picture</label>
                        <input
                            type="file"
                            accept="image/*"
                            name="picture"
                            onChange={handleFileChange}
                            className="w-full"
                        />

                        {preview.picture && (
                            <img
                                src={preview.picture}
                                className="mt-2 w-full rounded-lg max-h-48 object-cover"
                            />
                        )}
                    </div>

                    {/* Video */}
                    <div>
                        <label className="text-sm text-gray-600">Video</label>
                        <input
                            type="file"
                            accept="video/*"
                            name="video"
                            onChange={handleFileChange}
                            className="w-full"
                        />

                        {preview.video && (
                            <video
                                src={preview.video}
                                controls
                                className="mt-2 w-full rounded-lg max-h-48"
                            />
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                        >
                            {loading
                                ? "Saving..."
                                : editingId
                                ? "Update"
                                : "Add"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-300 px-6 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {/* LIST */}
                <div className="mt-6">
                    {happeningsList.map((happening) => (
                        <div
                            key={happening.id}
                            className="flex justify-between bg-gray-100 p-3 rounded-lg mb-2"
                        >
                            <div className="flex gap-4 items-center">
                                {happening.picture && (
                                    <img
                                        src={happening.picture}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                )}

                                {happening.video && (
                                    <video
                                        src={happening.video}
                                        className="w-16 h-16 rounded"
                                        muted
                                        controls
                                    />
                                )}

                                <span>{happening.happenings}</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(happening)}
                                    className="text-blue-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(happening.id)}
                                    className="text-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BOA>
    );
}
