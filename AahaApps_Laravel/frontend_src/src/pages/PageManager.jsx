import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Edit, Trash, FileText } from 'lucide-react';

const PageManager = () => {
    const [pages, setPages] = useState([]);

    const fetchPages = async () => {
        try {
            const { data } = await api.get('/pages');
            setPages(data);
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this page?')) {
            try {
                await api.delete(`/pages/${id}`);
                fetchPages();
            } catch (error) {
                console.error('Error deleting page:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="text-blue-600" />
                    Pages
                </h2>
                <Link
                    to="/admin/pages/create"
                    className="flex items-center gap-2 bg-[#1a1f2e] text-white px-4 py-2 rounded-lg hover:bg-black transition text-sm font-bold shadow"
                >
                    <Plus size={16} />
                    CREATE NEW PAGE
                </Link>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Slug</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Active</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {pages.map((page) => (
                            <tr key={page.id} className="hover:bg-gray-50 transition">
                                <td className="py-4 px-6 font-bold text-gray-800">{page.title}</td>
                                <td className="py-4 px-6 font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">/{page.slug}</td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${page.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {page.is_active ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right space-x-4">
                                    <Link to={`/admin/pages/${page.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Edit</Link>
                                    <button onClick={() => handleDelete(page.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {pages.length === 0 && (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-400">No pages found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {pages.map((page) => (
                    <div key={page.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-800 text-lg">{page.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${page.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {page.is_active ? 'Active' : 'Hidden'}
                            </span>
                        </div>
                        <div className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mb-4">/{page.slug}</div>
                        <div className="flex gap-4 pt-3 border-t border-gray-50">
                            <Link to={`/admin/pages/${page.id}`} className="flex items-center gap-1 text-blue-600 font-bold text-xs uppercase"><Edit size={14} /> Edit</Link>
                            <button onClick={() => handleDelete(page.id)} className="flex items-center gap-1 text-red-500 font-bold text-xs uppercase"><Trash size={14} /> Delete</button>
                        </div>
                    </div>
                ))}
                {pages.length === 0 && (
                    <div className="py-8 text-center text-gray-400 bg-white rounded-lg border border-dashed">No pages found.</div>
                )}
            </div>
        </div>
    );
};

export default PageManager;
