import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div 
            className="relative flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-0 bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: 'url(/images/psusc.jpg)',
            }}
        >
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Logo - Larger and responsive */}
            <div className="relative z-10 mb-6 sm:mb-8">
                <Link href="/" className="block">
                    <ApplicationLogo className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 fill-current text-white drop-shadow-lg transition-transform hover:scale-105" />
                </Link>
            </div>

            {/* Glass/Frosted effect login form */}
            <div className="relative z-10 w-full max-w-md overflow-hidden bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl px-6 py-6 sm:px-8 sm:py-8">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none"></div>
                
                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
