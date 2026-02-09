import { useState, useEffect } from 'react';
import api from '../api';
import CardForm from '../components/CardForm';
import { Plus, Edit, Trash, GripVertical } from 'lucide-react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Row for Desktop Table (DIV BASED)
const SortableRow = ({ card, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} className={`grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition ${isDragging ? 'bg-gray-100 opacity-90' : ''}`}>
            {/* Drag Handle - 1 Col */}
            <div className="col-span-1 flex justify-center text-gray-400 cursor-move touch-none select-none" {...attributes} {...listeners}>
                <GripVertical size={20} />
            </div>

            {/* Preview Image - 1 Col */}
            <div className="col-span-1">
                <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden border border-gray-200">
                    {card.section2_video ? (
                        <video src={`/${card.section2_video}`} className="w-full h-full object-cover" muted />
                    ) : card.section2_image ? (
                        <img src={`/${card.section2_image}`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                    )}
                </div>
            </div>

            {/* Title - 3 Cols */}
            <div className="col-span-3 font-bold text-gray-800 truncate px-2">
                {card.title}
            </div>

            {/* Description - 4 Cols */}
            <div className="col-span-4 text-sm text-gray-500 truncate px-2">
                {card.description}
            </div>

            {/* Status - 1 Col */}
            <div className="col-span-1 text-center">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Active</span>
            </div>

            {/* Actions - 2 Cols */}
            <div className="col-span-2 text-right space-x-4 pr-2">
                <button onClick={() => onEdit(card)} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Edit</button>
                <button onClick={() => onDelete(card.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">Delete</button>
            </div>
        </div>
    );
};

// Sortable Item for Mobile View
const SortableMobileItem = ({ card, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 items-center ${isDragging ? 'opacity-90 bg-gray-50' : ''}`}>
            <div className="text-gray-400 cursor-move touch-none select-none" {...attributes} {...listeners}>
                <GripVertical size={24} />
            </div>
            <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden border border-gray-200 flex-shrink-0">
                {card.section2_video ? (
                    <video src={`/${card.section2_video}`} className="w-full h-full object-cover" muted />
                ) : card.section2_image ? (
                    <img src={`/${card.section2_image}`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800 truncate">{card.title}</h4>
                    <div className="flex gap-2">
                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Active</span>
                    </div>
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">{card.description}</p>
                <div className="flex gap-4 mt-3">
                    <button onClick={() => onEdit(card)} className="text-blue-600 font-bold text-xs uppercase flex items-center gap-1"><Edit size={12} /> Edit</button>
                    <button onClick={() => onDelete(card.id)} className="text-red-500 font-bold text-xs uppercase flex items-center gap-1"><Trash size={12} /> Delete</button>
                </div>
            </div>
        </div>
    );
};


const CardManager = () => {
    const [cards, setCards] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCard, setCurrentCard] = useState(null);
    const [settings, setSettings] = useState({ card_radius: '16', card_scroll_speed: '0.8' });
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchData = async () => {
        try {
            const [cardsRes, settingsRes] = await Promise.all([
                api.get('/cards'),
                api.get('/settings')
            ]);

            const sorted = cardsRes.data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            setCards(sorted);

            if (settingsRes.data) {
                setSettings({
                    card_radius: settingsRes.data.card_radius || '16',
                    card_scroll_speed: settingsRes.data.card_scroll_speed || '0.8'
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateSettings = async () => {
        try {
            await api.put('/settings', settings);
            alert('Card settings updated successfully!');
        } catch (err) {
            console.error('Error saving settings:', err);
            alert('Failed to update settings');
        }
    };

    // ... (keep creating/deleting handlers)

    const handleEdit = (card) => {
        setCurrentCard(card);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentCard(null);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            try {
                await api.delete(`/cards/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting card:', error);
            }
        }
    };

    const handleSuccess = () => {
        setIsEditing(false);
        fetchData();
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over.id) {
            setCards((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                const updates = newOrder.map((card, index) => ({
                    id: card.id,
                    sort_order: index
                }));

                api.post('/cards/reorder', { order: updates })
                    .catch(err => {
                        console.error('Failed to save order', err);
                        fetchData();
                    });

                return newOrder;
            });
        }
    };

    const activeCard = cards.find(c => c.id === activeId);

    if (isEditing) {
        return (
            <div className="max-w-4xl mx-auto">
                <CardForm
                    initialData={currentCard}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div>
            {/* Phase 6: Dimensions UI Upgrade */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Card Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Border Radius (px)</label>
                        <input
                            type="number"
                            value={settings.card_radius}
                            onChange={(e) => setSettings({ ...settings, card_radius: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Default: 16px</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Image Scroll Speed (pixel/frame)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={settings.card_scroll_speed}
                            onChange={(e) => setSettings({ ...settings, card_scroll_speed: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Default: 0.8 (Higher is faster)</p>
                    </div>
                </div>
                <div className="mt-8">
                    <p className="text-xs text-gray-500 mb-4">* These settings apply to all cards on the homepage</p>
                    <button
                        onClick={handleUpdateSettings}
                        className="bg-[#1a1f2e] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-black transition"
                    >
                        UPDATE SETTINGS
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-700 uppercase tracking-wider">Home Page Cards List</h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[#1a1f2e] text-white px-4 py-2 rounded-lg hover:bg-black transition text-sm font-bold shadow"
                >
                    <Plus size={16} />
                    ADD NEW CARD
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Desktop DIV-BASED List View (Replacing Table) */}
                <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50">
                        <div className="col-span-1 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Drag</div>
                        <div className="col-span-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Preview</div>
                        <div className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Title</div>
                        <div className="col-span-4 text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Description</div>
                        <div className="col-span-1 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</div>
                        <div className="col-span-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider pr-2">Actions</div>
                    </div>

                    {/* Draggable Rows */}
                    <div className="divide-y divide-gray-50">
                        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            {cards.map((card) => (
                                <SortableRow key={card.id} card={card} onEdit={handleEdit} onDelete={handleDelete} />
                            ))}
                        </SortableContext>
                        {cards.length === 0 && (
                            <div className="py-8 text-center text-gray-400">No cards found.</div>
                        )}
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {cards.map((card) => (
                            <SortableMobileItem key={card.id} card={card} onEdit={handleEdit} onDelete={handleDelete} />
                        ))}
                    </SortableContext>
                    {cards.length === 0 && (
                        <div className="py-8 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">No cards found.</div>
                    )}
                </div>

                <DragOverlay>
                    {activeId && activeCard ? (
                        <div className="bg-white shadow-xl rounded-lg border border-blue-200 p-4 flex items-center gap-4 opacity-95">
                            <div className="text-gray-400">
                                <GripVertical size={20} />
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden border border-gray-200 flex-shrink-0">
                                {activeCard.section2_video ? (
                                    <video src={`/${activeCard.section2_video}`} className="w-full h-full object-cover" muted />
                                ) : activeCard.section2_image ? (
                                    <img src={`/${activeCard.section2_image}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                                )}
                            </div>
                            <div className="font-bold text-gray-800 truncate w-32">{activeCard.title}</div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default CardManager;
