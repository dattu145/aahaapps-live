import { useState, useEffect } from 'react';
import api from '../api';
import { Save, Upload } from 'lucide-react';

const SettingsManager = () => {
    const [settings, setSettings] = useState({});
    const [logoFile, setLogoFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            setSettings(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleTextChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };



    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setLogoFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Upload Logo if Selected
            if (logoFile) {
                const formData = new FormData();
                formData.append('key', 'site_logo');
                formData.append('file', logoFile);
                await api.post('/settings', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Save All Text Settings (Including explicit empty strings to clear)
            const textSettings = {
                logo_height: settings.logo_height || '200',
                logo_width: settings.logo_width || '200',
                logo_url: settings.logo_url || '',
                whatsapp_number: settings.whatsapp_number || '',
                email_address: settings.email_address || '',
                linkedin_url: settings.linkedin_url || '',
                website_url: settings.website_url || '',
                company_address: settings.company_address || '',
                company_font_size: settings.company_font_size || '16'
            };

            await api.put('/settings', textSettings);

            alert('Settings saved successfully!');
            fetchSettings();
            setLogoFile(null);
            setPreview(null);
        } catch (error) {
            console.error(error);
            alert('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">

            {/* Logo Management */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-gray-700 font-semibold mb-6">Logo Management</h3>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 flex flex-col items-center justify-center mb-6 relative hover:bg-gray-50 transition">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                        {/* Icon placeholder if needed, or just clean */}
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <p className="text-gray-400 text-sm">{preview ? 'New logo selected' : 'No new logo selected'}</p>
                    {preview && <img src={preview} alt="New" className="mt-4 h-20 object-contain" />}
                    <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Upload File</label>
                        <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded text-sm font-bold hover:bg-blue-100 transition w-full text-left relative">
                            {logoFile ? logoFile.name : 'Choose file'}
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                        </button>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Logo Height (px)</label>
                        <input name="logo_height" value={settings.logo_height || ''} onChange={handleTextChange} placeholder="200" className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Logo Width (px/auto)</label>
                        <input name="logo_width" value={settings.logo_width || ''} onChange={handleTextChange} placeholder="200" className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Or Image URL</label>
                    <input name="logo_url" value={settings.logo_url || ''} onChange={handleTextChange} placeholder="https://example.com/logo.png" className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>


            </div>

            {/* WhatsApp */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">WhatsApp Number</label>
                <input name="whatsapp_number" value={settings.whatsapp_number || ''} onChange={handleTextChange} placeholder="918888888888" className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <p className="text-xs text-gray-400 mt-1">Enter number with country code (without +)</p>
            </div>

            {/* Social Media & Contact */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-gray-700 font-semibold mb-6">Social Media & Contact</h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                        <input name="email_address" value={settings.email_address || ''} onChange={handleTextChange} className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">LinkedIn URL</label>
                            <input name="linkedin_url" value={settings.linkedin_url || ''} onChange={handleTextChange} className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Website URL</label>
                            <input name="website_url" value={settings.website_url || ''} onChange={handleTextChange} className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-3">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Company Address</label>
                            <textarea name="company_address" value={settings.company_address || ''} onChange={handleTextChange} rows="3" className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Font Size (px)</label>
                            <input name="company_font_size" value={settings.company_font_size || ''} onChange={handleTextChange} className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 text-center" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Active Logo */}
            {settings.site_logo && (
                <div className="bg-white p-8 rounded-lg shadow-sm">
                    <h3 className="text-gray-700 font-semibold mb-4">Current Active Logo</h3>
                    <div className="bg-[#1a1f2e] p-4 rounded inline-block">
                        <img src={`/${settings.site_logo}`} alt="Active Logo" className="h-16 object-contain" />
                    </div>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#1a1f2e] text-white px-8 py-3 rounded text-sm font-bold hover:bg-black transition flex items-center gap-2"
            >
                <Save size={16} />
                {loading ? 'SAVING...' : 'SAVE SETTINGS'}
            </button>
        </div>
    );
};

export default SettingsManager;
