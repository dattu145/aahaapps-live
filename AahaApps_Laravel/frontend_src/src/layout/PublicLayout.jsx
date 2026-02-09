import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DesktopNav from '../components/DesktopNav';
import MobileNav from '../components/MobileNav';

const PublicLayout = () => {
    return (
        <div className="relative min-h-screen text-gray-900 bg-white overflow-x-hidden">
            {/* Video Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-white/60 z-10" /> {/* Light Overlay */}
                <video
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                >
                    <source src="/demo_video.mp4" type="video/mp4" />
                    {/* Fallback if video missing */}
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Mobile Navigation - Moved outside content wrapper to ensure global Z-Index priority */}
            <div className="lg:hidden">
                <MobileNav />
            </div>

            {/* Content */}
            <div className="relative z-20 flex flex-col min-h-screen">
                {/* Navigation */}
                <div className="hidden lg:block fixed top-6 left-0 right-0 z-50 flex justify-center">
                    <DesktopNav />
                </div>

                {/* Main Page Content */}
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pt-32 pb-20 lg:pt-52 lg:pb-32">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PublicLayout;
