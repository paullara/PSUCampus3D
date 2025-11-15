import { Head, Link } from "@inertiajs/react";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="PSU Campus 3D Map" />
            <div className="bg-gradient-to-br from-blue-100 via-white to-blue-200 min-h-screen flex flex-col">
                <header className="flex justify-between items-center px-8 py-6">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/psu.png"
                            alt="PSU Logo"
                            className="h-10 w-10 rounded-full"
                        />
                        <span className="text-xl font-bold text-blue-900">
                            PSU Campus 3D Map
                        </span>
                    </div>
                    <nav className="flex gap-4">
                        {auth?.user ? (
                            <Link
                                href={route("dashboard")}
                                className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route("login")}
                                    className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="px-4 py-2 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
                    <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto py-12 md:py-24 gap-16">
                        {/* Left: Text */}
                        <div className="flex-1 text-center md:text-left z-10">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4 drop-shadow">
                                Explore PSU Campus in 3D
                            </h1>
                            <p className="text-lg md:text-xl text-blue-800 mb-8 max-w-xl">
                                Discover buildings, facilities, and events on an
                                interactive 3D map of Pangasinan State
                                University. Click on any building to view
                                details, happenings, and media.
                            </p>
                            <Link
                                href="/school/map"
                                className="inline-block px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded shadow hover:bg-blue-700 transition mb-8"
                            >
                                View 3D Map
                            </Link>
                            {/* Feature Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                                <div className="bg-white/90 rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-all duration-200 min-h-[170px]">
                                    <h2 className="text-lg font-semibold text-blue-900 mb-2">
                                        Interactive Buildings
                                    </h2>
                                    <p className="text-blue-800 text-center">
                                        Click on any building to see its
                                        information, events, and media.
                                    </p>
                                </div>
                                <div className="bg-white/90 rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-all duration-200 min-h-[170px]">
                                    <h2 className="text-lg font-semibold text-blue-900 mb-2">
                                        Campus Events
                                    </h2>
                                    <p className="text-blue-800 text-center">
                                        Stay updated with the latest happenings
                                        and announcements.
                                    </p>
                                </div>
                                <div className="bg-white/90 rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-all duration-200 min-h-[170px]">
                                    <h2 className="text-lg font-semibold text-blue-900 mb-2">
                                        Easy Navigation
                                    </h2>
                                    <p className="text-blue-800 text-center">
                                        Fly to any building and explore the
                                        campus from any angle.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Right: Image */}
                        <div className="flex-1 flex justify-center items-center relative z-10">
                            {/* Decorative blurred background behind the image */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[340px] bg-blue-200 opacity-40 rounded-3xl blur-2xl z-0"></div>
                            <img
                                src="/images/image.png"
                                alt="3D Campus Map"
                                className="relative w-full max-w-xl rounded-3xl shadow-2xl object-cover border-4 border-white"
                                style={{ aspectRatio: "16/9", minHeight: 320 }}
                            />
                        </div>
                    </div>
                </main>
                <footer className="py-6 text-center text-blue-900/70 text-sm">
                    &copy; {new Date().getFullYear()} Pangasinan State
                    University &mdash; Campus 3D Map
                </footer>
            </div>
        </>
    );
}
