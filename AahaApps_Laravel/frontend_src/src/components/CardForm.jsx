import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import api from '../api';
import { Editor } from '@tinymce/tinymce-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
const SortableThumbnail = ({ url, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: url });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group w-20 h-20 cursor-move">
            <img src={`/${url}`} alt="Thumbnail" className="w-full h-full object-cover rounded border border-gray-200" />
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking delete
                onClick={() => onRemove(url)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
            >
                <X size={12} />
            </button>
        </div>
    );
};

const CardForm = ({ initialData, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        enquiry_link: '',
        card_bg_color: '#ffffff',
        title_color: '#000000',
        desc_color: '#555555',
        buttons: [],
        section1_images: [],
        section2_image: null,
        section2_video: null,
        video_options: {
            autoplay: false,
            loop: false,
            muted: false,
            controls: true
        },
        thumbnail_width: 160,
        thumbnail_height: 104,
        sort_order: 0
    });

    const [section2Type, setSection2Type] = useState('image'); // 'image' or 'video'
    const [newSection2Image, setNewSection2Image] = useState(null);
    const [newSection2Video, setNewSection2Video] = useState(null);
    const [newSection1Images, setNewSection1Images] = useState([]);
    const [loading, setLoading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (initialData) {
            // Only switch to video if there's an actual video file path (not null, empty, or 'null' string)


            // Fix null descriptions
            const cleanDescription = (initialData.description === null ||
                initialData.description === 'null')
                ? ''
                : initialData.description;

            // Only switch to video if there's a valid video file path
            const hasVideo = initialData.section2_video &&
                initialData.section2_video !== 'null' &&
                initialData.section2_video !== 'DELETE' &&
                initialData.section2_video.trim() !== '';

            setFormData({
                ...initialData,
                description: cleanDescription,
                buttons: typeof initialData.buttons === 'string' ? JSON.parse(initialData.buttons) : (initialData.buttons || []),
                section1_images: typeof initialData.section1_images === 'string' ? JSON.parse(initialData.section1_images) : (initialData.section1_images || []),
                video_options: typeof initialData.video_options === 'string' ? JSON.parse(initialData.video_options) : (initialData.video_options || { autoplay: false, loop: false, muted: false, controls: true }),
                thumbnail_width: initialData.thumbnail_width || 160,
                thumbnail_height: initialData.thumbnail_height || 104,
                sort_order: initialData.sort_order || 0
            });

            if (hasVideo) {
                setSection2Type('video');
            } else {
                setSection2Type('image');
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Helper to auto-format links
    const formatLink = (url) => {
        if (!url) return '';
        if (url.startsWith('/')) return url; // Internal link
        if (url.startsWith('http://') || url.startsWith('https://')) return url; // Already valid
        return 'https://' + url; // Assume external and prepend https
    };

    const handleVideoOptionChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            video_options: {
                ...prev.video_options,
                [name]: checked
            }
        }));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFormData((prev) => {
                const oldIndex = prev.section1_images.indexOf(active.id);
                const newIndex = prev.section1_images.indexOf(over.id);
                return {
                    ...prev,
                    section1_images: arrayMove(prev.section1_images, oldIndex, newIndex),
                };
            });
        }
    };

    // Button Management
    const addButton = () => {
        setFormData(prev => ({
            ...prev,
            buttons: [...prev.buttons, {
                text: 'New Button',
                link: '#',
                type: 'link', // 'link' or 'popup'
                popup_content: '',
                bg_color: '#0000ff',
                text_color: '#ffffff',
                font_size: 15
            }]
        }));
    };

    const removeButton = (index) => {
        setFormData(prev => ({
            ...prev,
            buttons: prev.buttons.filter((_, i) => i !== index)
        }));
    };

    const updateButton = (index, field, value) => {
        const updatedButtons = [...formData.buttons];
        updatedButtons[index][field] = value;
        setFormData(prev => ({ ...prev, buttons: updatedButtons }));
    };

    // Image Handlers
    const handleSection2ImageChange = (e) => {
        if (e.target.files[0]) {
            setNewSection2Image(e.target.files[0]);
        }
    };

    const handleSection2VideoChange = (e) => {
        if (e.target.files[0]) {
            setNewSection2Video(e.target.files[0]);
        }
    };

    const handleSection1ImagesChange = (e) => {
        if (e.target.files) {
            setNewSection1Images(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeNewImage = (index) => {
        setNewSection1Images(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imagePath) => {
        setFormData(prev => ({
            ...prev,
            section1_images: prev.section1_images.filter(img => img !== imagePath)
        }));
    };

    // Custom Image Upload Handler for TinyMCE (Shared logic)
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
                resolve(response.data.url);
            })
            .catch(error => {
                console.error('Image upload failed', error);
                reject('Image upload failed: ' + error.message);
            });
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title || '');
        data.append('description', formData.description || '');

        // Apply link formatting
        data.append('enquiry_link', formatLink(formData.enquiry_link || ''));

        data.append('card_bg_color', formData.card_bg_color || '#ffffff');
        data.append('title_color', formData.title_color || '#000000');
        data.append('desc_color', formData.desc_color || '#555555');

        // Format button links too
        const formattedButtons = (formData.buttons || []).map(btn => ({
            ...btn,
            link: btn.type === 'link' ? formatLink(btn.link) : btn.link
        }));
        data.append('buttons', JSON.stringify(formattedButtons));

        data.append('section1_images', JSON.stringify(formData.section1_images || []));
        data.append('thumbnail_width', formData.thumbnail_width || 160);
        data.append('thumbnail_height', formData.thumbnail_height || 104);
        data.append('video_options', JSON.stringify(formData.video_options || {}));


        if (section2Type === 'image') {
            if (newSection2Image) {
                data.append('section2_image', newSection2Image);
            }
            // Explicitly signal to delete any existing video
            data.append('section2_video', 'DELETE');
        } else {
            // Main type is Video
            if (newSection2Video) {
                data.append('section2_video', newSection2Video);
            }
            // Explicitly signal to delete any existing image
            data.append('section2_image', 'DELETE');
        }

        newSection1Images.forEach(file => {
            data.append('section1_images[]', file);
        });

        try {
            if (initialData?.id) {
                // Laravel workaround: PUT with multipart/form-data doesn't work natively.
                // We must use POST and spoof the method.
                data.append('_method', 'PUT');
                await api.post(`/cards/${initialData.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/cards', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSuccess();
        } catch (error) {
            alert('Error saving card: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center pb-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Home Page Card' : 'Add New Home Page Card'}</h3>
                <button type="button" onClick={onCancel} className="text-gray-500 hover:text-black">
                    <X />
                </button>
            </div>

            {/* Section 1: Top Thumbnails */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 uppercase mb-4">Section 1: Top Thumbnails</h4>

                {formData.section1_images.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Current Thumbnails (Drag to Reorder)</label>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex flex-wrap gap-3 p-3 bg-white rounded-lg border border-dashed border-gray-300">
                                <SortableContext items={formData.section1_images} strategy={horizontalListSortingStrategy}>
                                    {formData.section1_images.map((img) => (
                                        <SortableThumbnail key={img} url={img} onRemove={removeExistingImage} />
                                    ))}
                                </SortableContext>
                            </div>
                        </DndContext>
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Add New Thumbnail Images</label>
                    <input type="file" multiple onChange={handleSection1ImagesChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border-gray-200 hover:file:bg-gray-100 border border-gray-200 rounded-lg bg-white p-1" />

                    {newSection1Images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {newSection1Images.map((file, idx) => (
                                <div key={`new-${idx}`} className="w-16 h-16 relative group">
                                    <img src={URL.createObjectURL(file)} alt="New upload" className="w-full h-full object-cover rounded border-2 border-green-400" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Thumbnail Width (px)</label>
                        <input
                            type="number"
                            name="thumbnail_width"
                            value={formData.thumbnail_width}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Thumbnail Height (px)</label>
                        <input
                            type="number"
                            name="thumbnail_height"
                            value={formData.thumbnail_height}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Main Content */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 uppercase mb-4">Section 2: Main Content</h4>

                {/* Content Type Toggle */}
                <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={section2Type === 'image'} onChange={() => setSection2Type('image')} className="text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-semibold text-gray-700">Image</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={section2Type === 'video'} onChange={() => setSection2Type('video')} className="text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-semibold text-gray-700">Video</span>
                    </label>
                </div>

                {section2Type === 'image' && (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Main Image</label>
                        <input type="file" onChange={handleSection2ImageChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border-gray-200 hover:file:bg-gray-100 border border-gray-200 rounded-lg bg-white p-1" />

                        {(newSection2Image || formData.section2_image) && (
                            <div className="mt-4 h-48 w-full bg-white rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                                <img
                                    src={newSection2Image ? URL.createObjectURL(newSection2Image) : `/${formData.section2_image}`}
                                    alt="Preview"
                                    className="h-full object-contain"
                                />
                            </div>
                        )}
                    </div>
                )}

                {section2Type === 'video' && (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Main Video (MP4, WebM)</label>
                        <input type="file" onChange={handleSection2VideoChange} accept="video/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border-gray-200 hover:file:bg-gray-100 border border-gray-200 rounded-lg bg-white p-1" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" name="autoplay" checked={formData.video_options?.autoplay} onChange={handleVideoOptionChange} />
                                Autoplay
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" name="loop" checked={formData.video_options?.loop} onChange={handleVideoOptionChange} />
                                Loop
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" name="muted" checked={formData.video_options?.muted} onChange={handleVideoOptionChange} />
                                Muted
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" name="controls" checked={formData.video_options?.controls} onChange={handleVideoOptionChange} />
                                Controls
                            </label>
                        </div>

                        {(newSection2Video || formData.section2_video) && (
                            <div className="mt-4 h-48 w-full bg-white rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                                <video
                                    src={newSection2Video ? URL.createObjectURL(newSection2Video) : `/${formData.section2_video}`}
                                    controls={true}
                                    className="h-full max-w-full"
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Description</label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <Editor
                                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                                value={formData.description}
                                onEditorChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                                init={{
                                    height: 300,
                                    menubar: false,
                                    plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'code', 'help', 'wordcount'],
                                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic | alignleft aligncenter alignright | bullist numlist | link image code',
                                    content_style: 'body { font-family:Inter,sans-serif; font-size:14px }',
                                    images_upload_handler: handleImageUpload
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Enquiry Button Link</label>
                        <input name="enquiry_link" value={formData.enquiry_link} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none" placeholder="/contact or https://..." />
                        <p className="text-[10px] text-gray-400 mt-1">This link will be used for the "Enquiry" button (common for all cards)</p>
                    </div>

                </div>
            </div>

            {/* Section 3: Buttons */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-800 uppercase">Section 3: Buttons</h4>
                    <button type="button" onClick={addButton} className="flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition">
                        <Plus size={14} /> Add Button
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.buttons.map((btn, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 relative">
                            <button type="button" onClick={() => removeButton(index)} className="absolute top-4 right-4 text-red-500 text-xs font-bold hover:underline">
                                Remove
                            </button>
                            <h5 className="text-xs font-bold text-gray-600 mb-3">Button {index + 1}</h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Button Text</label>
                                    <input value={btn.text} onChange={(e) => updateButton(index, 'text', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Type</label>
                                    <select
                                        value={btn.type || 'link'}
                                        onChange={(e) => updateButton(index, 'type', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                                    >
                                        <option value="link">Link</option>
                                        <option value="popup">Popup</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                {btn.type === 'popup' ? (
                                    <div className="h-64">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Popup Content</label>

                                        <div className="border border-gray-300 rounded overflow-hidden">
                                            <Editor
                                                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                                                value={btn.popup_content || ''}
                                                onEditorChange={(content) => updateButton(index, 'popup_content', content)}
                                                init={{
                                                    height: 200,
                                                    menubar: false,
                                                    plugins: ['lists', 'link', 'image', 'code'],
                                                    toolbar: 'bold italic fontfamily fontsize | bullist numlist | link image code',
                                                    content_style: 'body { font-family:Inter,sans-serif; font-size:12px }',
                                                    images_upload_handler: handleImageUpload
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Link URL</label>
                                        <input value={btn.link} onChange={(e) => updateButton(index, 'link', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">BG Color</label>
                                    <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1 bg-white">
                                        <input type="color" value={btn.bg_color} onChange={(e) => updateButton(index, 'bg_color', e.target.value)} className="w-6 h-6 border-none p-0 cursor-pointer" />
                                        <span className="text-xs text-gray-500 font-mono">{btn.bg_color}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Text Color</label>
                                    <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1 bg-white">
                                        <input type="color" value={btn.text_color} onChange={(e) => updateButton(index, 'text_color', e.target.value)} className="w-6 h-6 border-none p-0 cursor-pointer" />
                                        <span className="text-xs text-gray-500 font-mono">{btn.text_color}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Font Size (px)</label>
                                    <input
                                        type="number"
                                        value={btn.font_size || 15}
                                        onChange={(e) => updateButton(index, 'font_size', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.buttons.length === 0 && <p className="text-sm text-gray-400 italic">No buttons added.</p>}
                </div>
            </div>

            {/* Color Overrides */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 uppercase mb-4">Color Overrides (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Card Background Color</label>
                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                            <input type="color" name="card_bg_color" value={formData.card_bg_color} onChange={handleChange} className="h-8 w-10 p-0 border rounded" />
                            <input type="text" name="card_bg_color" value={formData.card_bg_color} onChange={handleChange} className="flex-1 text-xs font-mono outline-none uppercase" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Override global card background</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Title Text Color</label>
                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                            <input type="color" name="title_color" value={formData.title_color} onChange={handleChange} className="h-8 w-10 p-0 border rounded" />
                            <input type="text" name="title_color" value={formData.title_color} onChange={handleChange} className="flex-1 text-xs font-mono outline-none uppercase" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Override global title color</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Description Text Color</label>
                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                            <input type="color" name="desc_color" value={formData.desc_color} onChange={handleChange} className="h-8 w-10 p-0 border rounded" />
                            <input type="text" name="desc_color" value={formData.desc_color} onChange={handleChange} className="flex-1 text-xs font-mono outline-none uppercase" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Override global description color</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-bold text-sm">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#1a1f2e] text-white rounded-lg hover:bg-black font-bold text-sm disabled:opacity-50 shadow-lg transition-transform transform hover:scale-105">
                    {loading ? 'SAVING...' : (initialData ? 'UPDATE CARD' : 'CREATE CARD')}
                </button>
            </div>
        </form>
    );
};

export default CardForm;
