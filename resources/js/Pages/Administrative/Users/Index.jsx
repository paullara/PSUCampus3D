import React from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, usePage } from "@inertiajs/react";
import Administrative from "@/Layouts/Administrative";

export default function Index() {
    const { users, flash } = usePage().props;

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this user?")) {
            Inertia.delete(route("accounts.destroy", id));
        }
    };

    return (
        <Administrative>
            <div className="p-6 h-screen w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Users</h1>
                    <Link
                        href={route("accounts.create")}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Create User
                    </Link>
                </div>

                <div className="overflow-x-auto bg-white shadow-lg rounded-2xl">
                    <table className="w-full min-w-max border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border-b px-6 py-3 text-left">
                                    Name
                                </th>
                                <th className="border-b px-6 py-3 text-left">
                                    Email
                                </th>
                                <th className="border-b px-6 py-3 text-left">
                                    Role
                                </th>
                                <th className="border-b px-6 py-3 text-left">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-gray-50 transition"
                                >
                                    <td className="border-b px-6 py-3">
                                        {user.name}
                                    </td>
                                    <td className="border-b px-6 py-3">
                                        {user.email}
                                    </td>
                                    <td className="border-b px-6 py-3">
                                        {user.role}
                                    </td>
                                    <td className="border-b px-6 py-3 flex gap-2">
                                        <Link
                                            href={route(
                                                "accounts.edit",
                                                user.id
                                            )}
                                            className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition font-semibold"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(user.id)
                                            }
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition font-semibold"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Administrative>
    );
}
