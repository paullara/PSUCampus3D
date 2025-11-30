import React, { useEffect, useState } from "react";
import BOA from "@/Layouts/BOA";
import axios from "axios";

export default function ServicesPosting() {
    const [servicesList, setServicesList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        services: "",
    });

    // Fetch services
    useEffect(() => {
        axios
            .get("/services/json")
            .then((res) => setServicesList(res.data.services || []))
            .catch((err) => console.error("Failed to fetch services", err));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const storeServices = async () => {
        const res = await axios.post("/services", form);
        setServicesList([res.data, ...servicesList]);
    };

    const updateServices = async () => {
        const res = await axios.post(`/services/${editingId}`, {
            ...form,
            _method: "PUT",
        });

        setServicesList((prev) =>
            prev.map((p) => (p.id === editingId ? res.data : p))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            editingId ? await updateServices() : await storeServices();

            setForm({ services: "" });
            setEditingId(null);
        } catch (err) {
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service) => {
        setForm({ services: service.services });
        setEditingId(service.id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this service?")) return;

        try {
            await axios.delete(`/services/${id}`);
            setServicesList(servicesList.filter((p) => p.id !== id));
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({ services: "" });
    };

    return (
        <BOA>
            <div className="p-6">
                {/* Page Title */}
                <h1 className="text-3xl font-semibold text-gray-800 text-center mb-10">
                    🛠 School Services
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FORM */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            {editingId ? "Edit Service" : "Add New Service"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter service name"
                                name="services"
                                value={form.services}
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
                            Existing Services
                        </h2>

                        <div className="space-y-3">
                            {servicesList.map((service) => (
                                <div
                                    key={service.id}
                                    className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between"
                                >
                                    <span className="font-medium text-gray-700">
                                        {service.services}
                                    </span>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="text-blue-600 font-medium text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(service.id)
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
        </BOA>
    );
}
