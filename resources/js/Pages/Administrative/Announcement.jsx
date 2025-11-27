import React, { useEffect, useState } from "react";
import Administrative from "@/Layouts/Administrative";
import axios from "axios";

export default function Announcement() {
    const [announcementList, setAnnouncementList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        announcement: "",
    });

    // Fetch services
    useEffect(() => {
        axios
            .get("/announcements/json")
            .then((res) => setAnnouncementList(res.data.announcements || []))
            .catch((err) => console.error("Failed to fetch services", err));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const storeAnnouncement = async () => {
        const res = await axios.post("/announcements", form);
        setAnnouncementList([res.data, ...announcementList]);
    };

    const updateAnnouncement = async () => {
        const res = await axios.post(`/announcements/${editingId}`, {
            ...form,
            _method: "PUT",
        });

        setAnnouncementList((prev) =>
            prev.map((p) => (p.id === editingId ? res.data : p))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            editingId ? await updateAnnouncement() : await storeAnnouncement();

            setForm({ announcement: "" });
            setEditingId(null);
        } catch (err) {
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (announcement) => {
        setForm({ announcement: announcement.announcement });
        setEditingId(announcement.id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this announcement?")) return;

        try {
            await axios.delete(`/announcements/${id}`);
            setAnnouncementList(announcementList.filter((p) => p.id !== id));
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({ announcement: "" });
    };

    return (
        <Administrative>
            <div className="p-6">
                {/* Page Title */}
                <h1 className="text-3xl font-semibold text-gray-800 text-center mb-10">
                    🛠 School Announcement
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FORM */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            {editingId
                                ? "Edit Announcement"
                                : "Add New Announcement"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter announcement"
                                name="announcement"
                                value={form.announcement}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium shadow-sm disabled:opacity-50"
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
                                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl text-sm font-medium shadow-sm"
                                        onClick={cancelEdit}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* SERVICES LIST */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">
                            Existing Announcement
                        </h2>

                        <div className="space-y-3">
                            {announcementList.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between"
                                >
                                    <span className="font-medium text-gray-700">
                                        {announcement.announcement}
                                    </span>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() =>
                                                handleEdit(announcement)
                                            }
                                            className="text-blue-600 font-medium text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(announcement.id)
                                            }
                                            className="text-red-600 font-medium text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Administrative>
    );
}
