import React, { useEffect, useState } from "react";
import Admin from "@/Layouts/Admin";
import { Head } from "@inertiajs/react";
import axios from "axios";

export default function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [preview, setPreview] = useState({ picture: null, video: null });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        information: "",
    });

    useEffect(() => {
        axios
            .get("/information/json")
            .then((res) => {
                setPosts(res.data.post || []);
            })
            .catch((err) => {
                console.error("Failed to fetch posts", err);
            });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        setForm({ ...form, [name]: file });
    };

    const storePost = async () => {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("information", form.information);

        const res = await axios.post("/info-buildings", formData);

        setPosts([res.data, ...posts]);
    };

    const updatePost = async () => {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("name", form.name);
        formData.append("information", form.information);

        const res = await axios.post(`/info-buildings/${editingId}`, formData);

        setPosts((prev) =>
            prev.map((p) => (p.id === editingId ? res.data : p))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                await updatePost();
            } else {
                await storePost();
            }

            setForm({
                name: "",
                information: "",
            });

            setEditingId(null);
        } catch (err) {
            console.error("Failed to submit form", err);
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (post) => {
        setForm({
            name: post.name,
            information: post.information,
        });

        setEditingId(post.id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await axios.delete(`/info-buildings/${id}`);
            setPosts(posts.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete post");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({
            name: "",
            information: "",
        });
    };

    return (
        <Admin>
            <Head title="Dashboard" />
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row gap-8">
                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow p-6 md:w-1/2">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                            {editingId
                                ? "Edit Building Information"
                                : "Add Building Information"}
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                            encType="multipart/form-data"
                        >
                            <input
                                type="text"
                                placeholder="Name"
                                value={form.name}
                                onChange={handleChange}
                                name="name"
                                required
                                className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                            <textarea
                                name="information"
                                value={form.information}
                                onChange={handleChange}
                                placeholder="Information"
                                rows="3"
                                className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md disabled:opacity-50"
                                >
                                    {loading
                                        ? "Saving..."
                                        : editingId
                                        ? "Update Information"
                                        : "Add Information"}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg text-sm font-medium shadow-md"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Posts Card */}
                    <div className="bg-white rounded-2xl shadow p-6 md:w-1/2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Building Info Posts
                        </h3>
                        {posts.length === 0 ? (
                            <p className="text-gray-500 text-sm">
                                No posts found.
                            </p>
                        ) : (
                            <div className="space-y-6 overflow-y-auto max-h-[75vh] pr-2">
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative"
                                    >
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <button
                                                onClick={() => handleEdit(post)}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(post.id)
                                                }
                                                className="text-sm text-red-500 hover:text-red-700"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <h4 className="font-semibold text-lg text-gray-800">
                                            {post.name}
                                        </h4>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {post.information}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Admin>
    );
}
