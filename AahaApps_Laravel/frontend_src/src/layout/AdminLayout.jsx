import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Settings, Menu as MenuIcon, LogOut, ChevronDown, X } from 'lucide-react';

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Matching the image: Dashboard, Menus, Pages, Home Page Cards, Settings
    const navItems = [
        { label: 'Dashboard', path: '/admin', exact: true },
        { label: 'Menus', path: '/admin/menus' },
        { label: 'Pages', path: '/admin/pages' },
        { label: 'Home Page Cards', path: '/admin/cards' },
        { label: 'Banners', path: '/admin/banners' },
        { label: 'Settings', path: '/admin/settings' },
    ];

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
                {/* Left: Hamburger (Mobile) & Logo */}
                <div className="flex items-center gap-4">
                    {/* Hamburger Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="bg-black p-1.5 rounded-lg">
                            <LayoutDashboard className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 hidden md:block">Admin</span>
                    </div>
                </div>

                {/* Center: Desktop Navigation Links (Hidden on Mobile) */}
                <div className="hidden lg:flex items-center gap-8 h-full">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`h-full flex items-center px-1 border-b-2 text-sm font-medium transition-colors ${isActive(item.path, item.exact)
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Right: User Profile (Visible on all) */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md group relative">
                        <span className="text-sm font-medium text-gray-700 hidden md:block">Admin User</span>
                        <ChevronDown size={16} className="text-gray-500" />

                        {/* Dropdown for Logout */}
                        <div className="absolute top-full right-0 pt-2 w-48 hidden group-hover:block">
                            <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-1">
                                <Link
                                    to="/admin/profile"
                                    className="flex items-center gap-2 px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-50 text-left"
                                >
                                    <Settings size={16} /> {/* Reusing Settings icon or generic */}
                                    Profile
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-4 py-2 w-full text-sm text-red-600 hover:bg-red-50 text-left"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-20 top-16 bg-white animate-fade-in-down border-b border-gray-200 overflow-y-auto pb-4 shadow-xl">
                    <div className="flex flex-col p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center px-4 py-3 rounded-lg text-sm font-bold transition-colors ${isActive(item.path, item.exact)
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="border-t border-gray-100 my-2 pt-2">
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-3 w-full text-sm font-bold text-red-600 hover:bg-red-50 text-left rounded-lg"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 md:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
