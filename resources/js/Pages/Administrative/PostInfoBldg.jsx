import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import Administrative from "@/Layouts/Administrative";

export default function PostInfoBldg({ users }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: "",
        name: "",
        information: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("info.buildings.store"), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <Administrative>
            <div className="max-w-3xl mx-auto mt-10 bg-white shadow p-6 rounded-xl">
                <h1 className="text-3xl font-bold mb-6">
                    Post Building Information
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Select User */}
                    <div>
                        <label className="block text-lg font-semibold mb-1">
                            Select User
                        </label>
                        <select
                            value={data.user_id}
                            onChange={(e) => setData("user_id", e.target.value)}
                            className="w-full border p-3 rounded-lg"
                        >
                            <option value="">-- Select User --</option>

                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>

                        {errors.user_id && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.user_id}
                            </p>
                        )}
                    </div>

                    {/* Building Name */}
                    <div>
                        <label className="block text-lg font-semibold mb-1">
                            Building Name
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="w-full border p-3 rounded-lg"
                            placeholder="Enter building name"
                        />

                        {errors.name && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-lg font-semibold mb-1">
                            Description
                        </label>
                        <textarea
                            value={data.information}
                            onChange={(e) =>
                                setData("information", e.target.value)
                            }
                            className="w-full border p-3 rounded-lg h-32"
                            placeholder="Describe the building..."
                        ></textarea>

                        {errors.information && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.information}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-5 py-3 rounded-lg"
                        >
                            {processing ? "Posting..." : "Post Info"}
                        </button>
                    </div>
                </form>
            </div>
        </Administrative>
    );
}
