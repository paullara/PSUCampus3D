import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function IT({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transition-transform duration-300 
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} 
                    md:translate-x-0`}
            >
                <div className="p-6 flex items-center gap-2">
                    <ApplicationLogo className="h-9 w-auto text-blue-600" />
                    <span className="text-xl font-bold">
                        <span className="text-blue-700">PSU</span>
                        <span className="text-yellow-500">Campus</span>
                        <span className="text-blue-900">3D</span>
                    </span>
                </div>

                <nav className="flex flex-col gap-7 items-start p-9">
                    <NavLink
                        href={route("it.achievements")}
                        active={route().current("it.achievements")}
                    >
                        Achievements
                    </NavLink>
                    <NavLink
                        href={route("it.announcement")}
                        active={route().current("it.announcement")}
                    >
                        Announcement
                    </NavLink>
                    <NavLink
                        href={route("it.services")}
                        active={route().current("it.services")}
                    >
                        Services
                    </NavLink>
                    <NavLink
                        href={route("it.happenings")}
                        active={route().current("it.happenings")}
                    >
                        Happenings
                    </NavLink>

                    <NavLink
                        href={route("profile.edit")}
                        active={route().current("profile.edit")}
                    >
                        Profile
                    </NavLink>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex flex-col flex-1 md:ml-64">
                {/* HEADER — now sticky */}
                <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden text-gray-600"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <h1 className="text-lg font-semibold text-gray-900">
                        {header}
                    </h1>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border text-gray-700">
                                {user.name}
                                <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.1 1.02l-4.25 4.65a.75.75 0 01-1.1 0l-4.25-4.65a.75.75 0 01.02-1.06z" />
                                </svg>
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route("admin.posting")}>
                                Building Info
                            </Dropdown.Link>
                            <Dropdown.Link href={route("profile.edit")}>
                                Profile
                            </Dropdown.Link>
                            <Dropdown.Link
                                href={route("logout")}
                                method="post"
                                as="button"
                            >
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </header>

                {/* PAGE CONTENT */}
                <main className="p-6 max-w-5xl mx-auto w-full min-h-[calc(100vh-4rem)] overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
