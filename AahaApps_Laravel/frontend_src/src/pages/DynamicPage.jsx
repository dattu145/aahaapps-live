import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const DynamicPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await api.get(`/pages/${slug}`);
                setPage(data);
            } catch (err) {
                console.error(err);
                setError('Page not found');
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20">Loading...</div>;

    if (error) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 overflow-hidden">
            <div className="text-center">
                <svg className="w-64 h-64 mx-auto mb-8 text-indigo-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="text-9xl font-black text-gray-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 select-none">
                    404
                </h1>
                <h2 className="text-3xl font-bold text-gray-800 mb-4 relative z-10">Page Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto relative z-10">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <a href="/" className="relative z-10 inline-flex items-center gap-2 px-8 py-3 bg-[#1a1f2e] text-white rounded-full font-bold hover:bg-black transition transform hover:scale-105 shadow-lg">
                    <span>Go Home</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </a>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight">{page.title}</h1>
            <div
                className="prose prose-lg prose-blue max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: page.content }}
            />
        </div>
    );
};

export default DynamicPage;
