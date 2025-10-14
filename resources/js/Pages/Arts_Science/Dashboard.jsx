import React, { useEffect, useState } from "react";
import ArtsAndScience from "@/Layouts/ArtsAndScience";
import { Head } from "@inertiajs/react";
import axios from "axios";

export default function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [form, setForm] = useState({
        name: "",
        information: "",
        happenings: "",
        picture: null,
        video: null,
    });
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("information", form.information);
        formData.append("happenings", form.happenings);
        if (form.picture) formData.append("picture", form.picture);
        if (form.video) formData.append("video", form.video);

        axios
            .post("/info-buildings", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
                setPosts([res.data, ...posts]);
                setForm({
                    name: "",
                    information: "",
                    happenings: "",
                    picture: null,
                    video: null,
                });
            })
            .catch((err) => {
                alert("Failed to create post");
            })
            .finally(() => setLoading(false));
    };

    return (
        <ArtsAndScience>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            You're logged in! Arts and Science
                            {/* Add Post Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="mb-6 mt-4"
                                encType="multipart/form-data"
                            >
                                <h3 className="font-bold mb-2">
                                    Add Building Info Post
                                </h3>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Building Name"
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                    />
                                </div>
                                <div className="mb-2">
                                    <textarea
                                        name="information"
                                        value={form.information}
                                        onChange={handleChange}
                                        placeholder="Information"
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        name="happenings"
                                        value={form.happenings}
                                        onChange={handleChange}
                                        placeholder="Happenings"
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="file"
                                        name="picture"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                picture: e.target.files[0],
                                            })
                                        }
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="file"
                                        name="video"
                                        accept="video/*"
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                video: e.target.files[0],
                                            })
                                        }
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-1 rounded"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Add Post"}
                                </button>
                            </form>
                            {/* Posts List */}
                            <div className="mt-4">
                                <h3 className="font-bold mb-2">
                                    Your Building Info Posts:
                                </h3>
                                {posts.length === 0 ? (
                                    <div>No posts found.</div>
                                ) : (
                                    <ul>
                                        {posts.map((post) => (
                                            <li key={post.id}>
                                                <strong>{post.name}</strong>:{" "}
                                                {post.information}
                                                {post.picture && (
                                                    <div>
                                                        <img
                                                            src={post.picture}
                                                            alt="Building"
                                                            style={{
                                                                maxWidth: 120,
                                                                marginTop: 4,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                {post.video && (
                                                    <div>
                                                        <video
                                                            src={post.video}
                                                            controls
                                                            style={{
                                                                maxWidth: 180,
                                                                marginTop: 4,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ArtsAndScience>
    );
}
