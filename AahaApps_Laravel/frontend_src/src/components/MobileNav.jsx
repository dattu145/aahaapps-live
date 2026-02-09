import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Menu as MenuIcon, X, Globe, Mail, Linkedin } from 'lucide-react'; // Added Linkedin
import { Link } from 'react-router-dom';

const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [settings, setSettings] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [menuRes, settingRes] = await Promise.all([
                    api.get('/menus'),
                    api.get('/settings')
                ]);
                setMenus(menuRes.data.filter(m => m.is_active));

                // Parse booleans
                const s = settingRes.data;
                s.show_menu = s.show_menu !== 'false';
                s.show_logo = s.show_logo !== 'false';

                setSettings(s);
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, []);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Use Portal to render outside of efficient React tree (directly in body) to avoid Stacking Context issues
    return createPortal(
        <>
            {/* Mobile Header Bar (Visible when menu closed) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-[9999] p-6 flex justify-between items-center bg-transparent pointer-events-none">
                {/* 
                    NOTE: Using pointer-events-none on container so clicks pass through to video/content if transparent.
                    But the buttons need pointer-events-auto.
                 */}
                <div className="pointer-events-auto">
                    {settings.site_logo && (
                        <img
                            src={`/${settings.site_logo}`}
                            alt="Logo"
                            className="h-10 object-contain drop-shadow-md"
                        />
                    )}
                </div>

                {/* Hamburger Trigger - Always Visible */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto bg-white/90 backdrop-blur shadow-sm p-3 rounded-full text-black hover:bg-black hover:text-white transition-colors"
                >
                    <MenuIcon size={24} />
                </button>
            </div>

            {/* Drawer Overlay (Backdrop) */}
            <div
                className={`lg:hidden fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Side Drawer Menu */}
            <div
                className={`lg:hidden fixed inset-y-0 left-0 z-[10000] w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Menu Title & Close */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    {settings.site_logo ? (
                        <img
                            src={`/${settings.site_logo}`}
                            alt="Logo"
                            className="h-10 object-contain"
                        />
                    ) : (
                        <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
                    )}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto flex flex-col p-6">
                    {/* Navigation Links */}
                    {/* Navigation Links - Grid Layout */}
                    <nav className="grid grid-cols-2 gap-4 mb-8">
                        {menus.map(item => (
                            <a
                                key={item.id}
                                href={item.url}
                                className="flex items-center justify-center text-center px-4 py-3 rounded-xl bg-gray-50 text-gray-800 font-bold hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100 shadow-sm text-sm"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Contact CTA */}
                    <div className="mt-auto">
                        <a
                            href="/contact"
                            className="block w-full text-white text-center font-bold py-4 rounded-xl text-lg shadow-lg mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-opacity"
                        >
                            Contact Us
                        </a>

                        {/* Footer: Icons & Address */}
                        <div className="flex flex-col items-center space-y-6">
                            {/* Icons Row */}
                            <div className="flex items-center gap-4">
                                {settings.email_address && (
                                    <a
                                        href={`mailto:${settings.email_address}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition border border-gray-100"
                                    >
                                        <Mail size={18} />
                                    </a>
                                )}
                                {settings.website_url && (
                                    <a
                                        href={settings.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition border border-gray-100"
                                    >
                                        <Globe size={18} />
                                    </a>
                                )}
                                {settings.linkedin_url && (
                                    <a
                                        href={settings.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition border border-gray-100"
                                    >
                                        <Linkedin size={18} />
                                    </a>
                                )}
                            </div>

                            {/* Address */}
                            {settings.company_address && (
                                <div className="text-center">
                                    <p
                                        className="text-gray-400 leading-relaxed max-w-xs mx-auto text-center"
                                        style={{ fontSize: `${settings.company_font_size || 12}px` }}
                                    >
                                        {settings.company_address}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default MobileNav;
