import React, { useEffect, useState } from "react";
import CED from "@/Layouts/CED";
import axios from "axios";

export default function AchievementPosting() {
    const [achievementsList, setAchievementsList] = useState([]);
    const [preview, setPreview] = useState({ picture: null });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        achievements: "",
        achievement_pic: null,
    });

    useEffect(() => {
        axios
            .get("/achievements/json")
            .then((res) => {
                setAchievementsList(res.data.achievements || []);
            })
            .catch((err) => console.error("Failed to fetch achievements", err));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        setForm({ ...form, [name]: file });

        if (file && name === "achievement_pic") {
            setPreview({ picture: URL.createObjectURL(file) });
        }
    };

    const storeAchievement = async () => {
        const formData = new FormData();
        formData.append("achievements", form.achievements);
        if (form.achievement_pic)
            formData.append("achievement_pic", form.achievement_pic);

        const res = await axios.post("/achievements", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        setAchievementsList([res.data, ...achievementsList]);
    };

    const updateAchievement = async () => {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("achievements", form.achievements);
        if (form.achievement_pic)
            formData.append("achievement_pic", form.achievement_pic);

        const res = await axios.post(`/achievements/${editingId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        setAchievementsList((prev) =>
            prev.map((p) => (p.id === editingId ? res.data : p))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                await updateAchievement();
            } else {
                await storeAchievement();
            }

            setForm({ achievements: "", achievement_pic: null });
            setPreview({ picture: null });
            setEditingId(null);
        } catch (err) {
            console.error("Failed to submit form", err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (achievement) => {
        setForm({
            achievements: achievement.achievements,
            achievement_pic: null,
        });
        setPreview({
            picture: achievement.achievement_pic || null,
        });
        setEditingId(achievement.id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this achievement?"))
            return;
        try {
            await axios.delete(`/achievements/${id}`);
            setAchievementsList(achievementsList.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete achievement.");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({ achievements: "", achievement_pic: null });
        setPreview({ picture: null });
    };

    return (
        <CED>
            <div className="max-w-5xl mx-auto p-6 space-y-10">
                {/* FORM CARD */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                        {editingId ? "Edit Achievement" : "Add Achievement"}
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        encType="multipart/form-data"
                        className="space-y-6"
                    >
                        {/* TITLE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Achievement Title
                            </label>
                            <input
                                type="text"
                                name="achievements"
                                placeholder="Achievement Title"
                                value={form.achievements}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        {/* PICTURE UPLOAD */}
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Achievement Picture
                            </label>

                            <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                {preview.picture ? (
                                    <img
                                        src={preview.picture}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-sm">
                                        No image selected
                                    </span>
                                )}
                            </div>

                            <input
                                type="file"
                                name="achievement_pic"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-3 text-sm"
                            />
                        </div>

                        {/* BUTTONS */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow disabled:opacity-50"
                            >
                                {loading
                                    ? "Saving..."
                                    : editingId
                                    ? "Update"
                                    : "Save"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl shadow"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* ACHIEVEMENT DISPLAY GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {achievementsList.map((ach) => (
                        <div
                            key={ach.id}
                            className="bg-white rounded-2xl shadow p-4 flex flex-col overflow-hidden"
                        >
                            {ach.achievement_pic && (
                                <img
                                    src={ach.achievement_pic}
                                    className="w-full h-40 object-cover rounded-xl"
                                    alt=""
                                />
                            )}

                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-800">
                                    {ach.achievements}
                                </h3>
                            </div>

                            <div className="flex justify-end mt-4 gap-3 text-sm">
                                <button
                                    onClick={() => handleEdit(ach)}
                                    className="text-blue-600 font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(ach.id)}
                                    className="text-red-600 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CED>
    );
}
