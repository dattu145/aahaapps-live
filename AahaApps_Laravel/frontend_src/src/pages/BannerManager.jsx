import { useState, useEffect } from 'react';
import api from '../api';
import BannerForm from '../components/BannerForm';
import { Plus, Edit, Trash, Eye, EyeOff } from 'lucide-react';

const BannerManager = () => {
    const [banners, setBanners] = useState([]);
    const [cards, setCards] = useState([]); // Needed for relative placement
    const [isEditing, setIsEditing] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bannersRes, cardsRes] = await Promise.all([
                api.get('/banners'),
                api.get('/cards')
            ]);
            setBanners(bannersRes.data);
            setCards(cardsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setCurrentBanner(null);
        setIsEditing(true);
    };

    const handleEdit = (banner) => {
        setCurrentBanner(banner);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await api.delete(`/banners/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting banner:', error);
            }
        }
    };

    const handleSuccess = () => {
        setIsEditing(false);
        fetchData();
    };

    if (isEditing) {
        return (
            <div className="max-w-4xl mx-auto">
                <BannerForm
                    initialData={currentBanner}
                    cards={cards}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Banners Manager</h2>
                    <p className="text-sm text-gray-500">Create scrolling banners with images and videos.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[#1a1f2e] text-white px-4 py-2 rounded-lg hover:bg-black transition text-sm font-bold shadow w-full md:w-auto justify-center"
                >
                    <Plus size={16} />
                    CREATE BANNER
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading...</div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Placement</th>
                                    <th className="p-4">Items</th>
                                    <th className="p-4">Height</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {banners.length > 0 ? banners.map((banner) => (
                                    <tr key={banner.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-bold text-gray-700">{banner.name}</td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {banner.placement === 'relative'
                                                ? `Relative (${banner.relative_position} Card ${banner.target_card_id})`
                                                : banner.placement.toUpperCase()}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {banner.media_items?.length || 0} items
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {banner.height || 400}px
                                        </td>
                                        <td className="p-4 text-center">
                                            {banner.is_active ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right space-x-4">
                                            <button onClick={() => handleEdit(banner)} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Edit</button>
                                            <button onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase ml-4">Delete</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-400">No banners found. Create one to get started.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {banners.length > 0 ? banners.map((banner) => (
                            <div key={banner.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{banner.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {banner.placement === 'relative'
                                                ? `Relative (${banner.relative_position} Card ${banner.target_card_id})`
                                                : banner.placement.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {banner.is_active ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-600 mb-4 border-t border-b border-gray-50 py-2">
                                    <span>{banner.media_items?.length || 0} items</span>
                                    <span>{banner.height || 400}px Height</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(banner)}
                                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-blue-600 font-bold py-2 rounded-lg text-sm transition"
                                    >
                                        EDIT
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg text-sm transition"
                                    >
                                        DELETE
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                No banners found.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default BannerManager;
