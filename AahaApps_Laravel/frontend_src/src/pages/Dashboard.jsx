import { useEffect, useState } from 'react';
import api from '../api';
import { Layers, Menu, Settings, FileText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({ cards: 0, menus: 0 });
    const [recentCards, setRecentCards] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cardsRes, menusRes] = await Promise.all([
                    api.get('/cards'),
                    api.get('/menus')
                ]);
                setStats({
                    cards: cardsRes.data.length,
                    menus: menusRes.data.length
                });
                // Take last 5 cards for "Recent"
                setRecentCards(cardsRes.data.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        }
        fetchData();
    }, []);

    const statCards = [
        {
            title: 'Total Cards',
            value: stats.cards,
            link: '/admin/cards',
            icon: <Layers size={24} className="text-blue-600" />,
            bg: 'bg-blue-50',
            labelColor: 'text-blue-600'
        },
        {
            title: 'Total Pages',
            value: 7, // Placeholder as per image
            link: '#',
            icon: <FileText size={24} className="text-green-600" />,
            bg: 'bg-green-50',
            labelColor: 'text-green-600'
        },
        {
            title: 'Menu Items',
            value: stats.menus,
            link: '/admin/menus',
            icon: <Menu size={24} className="text-yellow-600" />,
            bg: 'bg-yellow-50',
            labelColor: 'text-yellow-600'
        },
        {
            title: 'Site Settings',
            value: 'Configure',
            link: '/admin/settings',
            icon: <Settings size={24} className="text-gray-600" />,
            bg: 'bg-gray-50',
            labelColor: 'text-gray-600'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            </div>

            {/* Overview Cards */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-6">Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {statCards.map((card, index) => (
                        <div key={index} className={`p-6 rounded-xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow ${card.bg}`}>
                            <div>
                                <p className={`text-sm font-semibold mb-1 ${card.labelColor}`}>{card.title}</p>
                                <h4 className="text-3xl font-bold text-gray-800">{card.value}</h4>
                                <Link to={card.link} className="text-xs text-gray-500 hover:text-gray-800 mt-2 inline-block">
                                    Manage {card.title} →
                                </Link>
                            </div>
                            <div className="bg-white p-3 rounded-full shadow-sm">
                                {card.icon}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Cards Table */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-6">Recent Cards</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                <th className="py-3 font-medium">Title</th>
                                <th className="py-3 font-medium">Date Added</th>
                                <th className="py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentCards.length > 0 ? recentCards.map((card) => (
                                <tr key={card.id}>
                                    <td className="py-4 text-gray-800 font-medium">{card.title}</td>
                                    <td className="py-4 text-gray-500 text-sm">
                                        {new Date(card.createdAt || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 text-right">
                                        <Link
                                            to={`/admin/cards/${card.id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="py-8 text-center text-gray-400">No cards found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
