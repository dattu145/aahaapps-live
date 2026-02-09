import { useState, useEffect } from 'react';
import api from '../api';
import { Database, Upload, AlertCircle, CheckCircle, Server } from 'lucide-react';

const DatabaseManager = () => {
    const [config, setConfig] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/database/config');
                setConfig(data);
            } catch (err) {
                console.error("Failed to load db config", err);
            }
        };
        fetchConfig();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setMessage(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a SQL file first.");
            return;
        }

        if (!confirm("WARNING: This will execute the SQL script on your connected database. This operation cannot be undone. Are you sure?")) {
            return;
        }

        const formData = new FormData();
        formData.append('sqlFile', file);

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { data } = await api.post('/database/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(data.message);
            setFile(null); // Clear file input
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to upload and execute SQL.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Database className="text-blue-600" size={32} />
                    Database Management
                </h1>
            </div>

            {/* Config Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Server size={20} />
                    Current Connection
                </h2>
                {config ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="text-xs font-bold text-gray-400 uppercase">Host</span>
                            <p className="font-mono text-gray-800">{config.host}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="text-xs font-bold text-gray-400 uppercase">Database</span>
                            <p className="font-mono text-gray-800">{config.database}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="text-xs font-bold text-gray-400 uppercase">User</span>
                            <p className="font-mono text-gray-800">{config.user}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400">Loading configuration...</p>
                )}
            </div>

            {/* Upload Card */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Import SQL Data</h2>
                    <p className="text-gray-500">Upload a <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">.sql</code> file to execute it directly against the database. Use this for imports or restoration.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
                        <AlertCircle className="text-red-500 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-red-700">Error</h4>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {message && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 flex items-start gap-3">
                        <CheckCircle className="text-green-500 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-green-700">Success</h4>
                            <p className="text-green-600 text-sm">{message}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1 w-full">
                        <label className="block w-full cursor-pointer group">
                            <div className={`
                                border-2 border-dashed rounded-xl p-8 text-center transition-colors
                                ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                            `}>
                                <input
                                    type="file"
                                    accept=".sql"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Upload className={`mx-auto mb-3 ${file ? 'text-blue-600' : 'text-gray-400'}`} size={32} />
                                {file ? (
                                    <div>
                                        <p className="font-bold text-blue-700">{file.name}</p>
                                        <p className="text-sm text-blue-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-bold text-gray-600">Click to upload or drag and drop</p>
                                        <p className="text-sm text-gray-400">SQL files only</p>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || loading}
                        className={`
                            px-8 py-4 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all
                            ${!file || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1'}
                        `}
                    >
                        {loading ? 'Executing...' : 'Import SQL'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DatabaseManager;
