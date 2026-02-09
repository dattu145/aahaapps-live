import { useState, useEffect } from 'react';
import api from '../api';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const DesktopNav = () => {
    const [menus, setMenus] = useState([]);
    const [settings, setSettings] = useState({});

    // Animation States
    const [isHovered, setIsHovered] = useState(false);
    const [phase, setPhase] = useState('idle'); // idle -> width -> height

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [menuRes, settingRes] = await Promise.all([
                    api.get('/menus'),
                    api.get('/settings')
                ]);
                setMenus(menuRes.data.filter(m => m.is_active));
                setSettings(settingRes.data);
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, []);

    // Strict 2-Step Animation Logic (Forward and Reverse)
    useEffect(() => {
        let timer1, timer2;

        if (isHovered) {
            // OPEN SEQUENCE
            // 1. Expand Width immediately
            setPhase('width');

            // 2. Expand Height after 300ms
            timer1 = setTimeout(() => {
                setPhase('height');
            }, 300);

            // 3. Show Content after 600ms
            timer2 = setTimeout(() => {
                setPhase('content');
            }, 600);
        } else {
            // IGNORE if we are already idle/closing to prevent glitches, 
            // but assuming simple state machine here:

            // REVERSE SEQUENCE
            // 1. Hide Content (Instant or fast fade handled by CSS) & Shrink Height
            setPhase('width'); // Go back to width-only state (collapses height)

            // 2. Shrink Width after height collapses (300ms)
            timer1 = setTimeout(() => {
                setPhase('idle');
            }, 300);
        }

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [isHovered]);

    // Dimensions based on phase
    const getContainerStyle = () => {
        switch (phase) {
            case 'idle':
                // Initial Width INCREASED to 600px as requested
                return { width: '800px', height: '80px', borderRadius: '9999px' };
            case 'width':
                // Expanded width, but keeping pill height/radius mostly
                return { width: '1000px', height: '80px', borderRadius: '40px' };
            case 'height':
            case 'content':
                return { width: '1000px', height: '500px', borderRadius: '32px' };
            default:
                return { width: '800px', height: '80px', borderRadius: '9999px' };
        }
    };

    return (
        <div className="relative flex justify-center perspective-1000 h-[500px] -mb-[440px] z-50 pointer-events-none">
            <div
                className="bg-white shadow-2xl overflow-hidden mx-auto transition-all duration-300 ease-out relative border border-gray-100 pointer-events-auto"
                style={getContainerStyle()}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* 
                   HEADER CONTENT: Always Visible, Stable Position 
                   We position this absolute top-0 left-0 right-0 h-[60px] to ensure it never moves.
                */}
                <div className="absolute top-0 left-0 right-0 h-[80px] flex items-center justify-between px-6 z-20">

                    {/* Left: Menu Trigger */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer hover:bg-gray-50 transition">
                        <Menu size={20} className="text-black" />
                        <span className="font-bold text-black text-lg uppercase tracking-wide">Menu</span>
                    </div>

                    {/* Center: Logo from CMS */}
                    <div className="flex items-center justify-center h-full">
                        {settings.site_logo && (
                            <img
                                src={`/${settings.site_logo}`}
                                alt="Logo"
                                className="h-12 object-contain max-w-[200px]"
                            />
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4 pr-2">
                        <Link to="/contact" className="text-black font-semibold text-lg cursor-pointer hover:text-gray-600">Contact</Link>
                        <a
                            href="https://profile.aahaapps.com/login"
                            className="bg-[#1DBF57] text-white px-8 py-3 rounded-full text-lg font-bold shadow hover:bg-green-600 transition"
                        >
                            Login
                        </a>
                    </div>
                </div>

                {/* 
                    MEGA MENU CONTENT: Visible only in 'content' phase
                    Fade In Transition
                */}
                <div
                    className={`w-full h-full pt-[80px] px-8 pb-8 transition-opacity duration-300 flex flex-col
                        ${phase === 'content' ? 'opacity-100 delay-100' : 'opacity-0 duration-100'}
                    `}
                >
                    {/* Close Button Row (Optional redundant close, UX choice) */}


                    <div className="flex w-full h-full">
                        {/* Col 1: Main Menu */}
                        <div className="w-1/3 pr-8 border-r border-gray-100 flex flex-col gap-5">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Main Menu</h4>
                            {menus.slice(0, 5).map(item => (
                                <a key={item.id} href={item.url} className="text-2xl font-bold text-gray-800 hover:text-black">
                                    {item.label}
                                </a>
                            ))}
                        </div>

                        {/* Col 2: More */}
                        <div className="w-1/3 px-8 flex flex-col gap-5">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">More</h4>
                            {menus.slice(5).length > 0 ? menus.slice(5).map(item => (
                                <a key={item.id} href={item.url} className="text-xl font-bold text-gray-800 hover:text-black">
                                    {item.label}
                                </a>
                            )) : (
                                <>
                                    <a href="#" className="text-xl font-bold text-gray-800 hover:text-black">CRM</a>
                                    <a href="#" className="text-xl font-bold text-gray-800 hover:text-black">Blog</a>
                                </>
                            )}
                        </div>

                        {/* Col 3: Milestone Card */}
                        <div className="w-1/3 pl-8 flex flex-col justify-center pb-8">
                            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"></div>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-block backdrop-blur-sm">Milestone</span>
                                <h3 className="text-3xl font-black mb-8 leading-tight">We hit 1600 Members!</h3>
                                <button className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition shadow-lg w-full">
                                    Join Community
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopNav;
// Rebuild trigger
