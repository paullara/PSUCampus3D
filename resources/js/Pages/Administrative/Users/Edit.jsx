import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, usePage } from "@inertiajs/react";
import Administrative from "@/Layouts/Administrative";

export default function Edit() {
    const { user, roles, errors } = usePage().props;

    const [form, setForm] = useState({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
        role: user.role,
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        Inertia.put(route("accounts.update", user.id), form);
    };

    return (
        <Administrative>
            <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-6">
                    <h1 className="text-2xl font-bold mb-6">Edit User</h1>

                    <Link
                        href={route("accounts.index")}
                        className="inline-block mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
                    >
                        ← Back
                    </Link>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block font-medium mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            {errors.name && (
                                <div className="text-red-500 mt-1 text-sm">
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block font-medium mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            {errors.email && (
                                <div className="text-red-500 mt-1 text-sm">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block font-medium mb-1">
                                Password (leave empty to keep current)
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            {errors.password && (
                                <div className="text-red-500 mt-1 text-sm">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block font-medium mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">
                                Role
                            </label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            >
                                <option value="">Select Role</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                            {errors.role && (
                                <div className="text-red-500 mt-1 text-sm">
                                    {errors.role}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
                        >
                            Update User
                        </button>
                    </form>
                </div>
            </div>
        </Administrative>
    );
}
