import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import api from '../api';
import { Save, ArrowLeft } from 'lucide-react';

const PageForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const isEdit = !!id && id !== 'create';

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        is_active: true
    });

    useEffect(() => {
        if (isEdit) {
            const fetchPage = async () => {
                try {
                    const { data } = await api.get(`/pages/${id}`);
                    setFormData(data);
                } catch (error) {
                    console.error('Error fetching page:', error);
                }
            };
            fetchPage();
        }
    }, [id, isEdit]);

    // Custom Image Upload Handler for TinyMCE
    const handleImageUpload = (blobInfo, progress) => new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('image', blobInfo.blob(), blobInfo.filename());

        api.post('/pages/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
                progress(e.loaded / e.total * 100);
            }
        })
            .then(response => {
                // TinyMCE expects the LOCATION of the image
                resolve(response.data.url);
            })
            .catch(error => {
                console.error('Image upload failed', error);
                reject('Image upload failed: ' + error.message);
            });
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Get content from editor
            const content = editorRef.current ? editorRef.current.getContent() : formData.content;

            const payload = { ...formData, content };

            if (isEdit) {
                await api.put(`/pages/${id}`, payload);
            } else {
                await api.post('/pages', payload);
            }
            navigate('/admin/pages');
        } catch (error) {
            console.error('Error saving page:', error);
            alert('Failed to save page');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <button onClick={() => navigate('/admin/pages')} className="flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm">
                <ArrowLeft size={16} /> Back to Pages
            </button>

            <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Page' : 'Create Page'}</h2>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Slug</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-blue-600"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">URL: website.com/{formData.slug}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Content</label>
                        <div className="min-h-[500px] mb-8 border border-gray-200 rounded-lg overflow-hidden">
                            <Editor
                                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                                onInit={(evt, editor) => editorRef.current = editor}
                                value={formData.content}
                                onEditorChange={(newValue) => setFormData({ ...formData, content: newValue })}
                                init={{
                                    height: 500,
                                    menubar: false,
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                    ],
                                    toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                                        'bold italic forecolor | alignleft aligncenter ' +
                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                        'image media link code | removeformat | help',
                                    content_style: 'body { font-family:Inter,sans-serif; font-size:14px }',
                                    images_upload_handler: handleImageUpload,
                                    image_advtab: true, // Advanced image options
                                    image_class_list: [
                                        { title: 'None', value: '' },
                                        { title: 'Responsive', value: 'img-fluid' },
                                        { title: 'Rounded', value: 'rounded-lg' }
                                    ]
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm font-bold text-gray-700">Active</label>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <button type="submit" className="flex items-center gap-2 bg-[#1a1f2e] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition">
                            <Save size={16} />
                            {isEdit ? 'UPDATE' : 'CREATE'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PageForm;
