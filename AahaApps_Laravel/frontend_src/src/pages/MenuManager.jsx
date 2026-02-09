import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, GripVertical, Check, X, Edit } from 'lucide-react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Row for Desktop
const SortableMenuRow = ({ menu, editingId, formData, setFormData, handleSave, setEditingId, handleEdit, handleDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: menu.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative',
    };

    if (editingId === menu.id) {
        return (
            <div ref={setNodeRef} style={style} className="border-b last:border-0 bg-blue-50">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-1 flex justify-center text-gray-400">
                        <GripVertical size={20} className="opacity-30 cursor-not-allowed" />
                    </div>
                    <div className="col-span-5">
                        <input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full border rounded p-1" autoFocus />
                    </div>
                    <div className="col-span-4">
                        <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border rounded p-1" />
                    </div>
                    <div className="col-span-1 text-center">
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                    </div>
                    <div className="col-span-1 flex justify-end gap-2">
                        <button onClick={handleSave} className="text-green-600 p-1 hover:bg-white rounded"><Check size={20} /></button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 p-1 hover:bg-white rounded"><X size={20} /></button>
                    </div>
                </div>
                {/* Mobile Edit View */}
                <div className="md:hidden p-4 space-y-3">
                    <h4 className="font-bold text-blue-800 text-sm uppercase">Edit Item</h4>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Label</label>
                        <input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full border rounded p-2" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">URL</label>
                        <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border rounded p-2" />
                    </div>
                    <div className="flex items-center pt-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                            Active
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-500 hover:bg-white rounded font-bold text-sm">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded font-bold text-sm hover:bg-green-700">Save</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} className={`border-b last:border-0 hover:bg-gray-50 ${isDragging ? 'bg-gray-100 opacity-90' : ''}`}>
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                <div className="col-span-1 flex justify-center text-gray-400 cursor-move touch-none" {...attributes} {...listeners}>
                    <GripVertical size={20} />
                </div>
                <div className="col-span-5 font-medium">{menu.label}</div>
                <div className="col-span-4 text-gray-500 text-sm font-mono">{menu.url}</div>
                <div className="col-span-1 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${menu.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {menu.is_active ? 'Active' : 'Hidden'}
                    </span>
                </div>
                <div className="col-span-1 flex justify-end gap-2">
                    <button onClick={() => handleEdit(menu)} className="text-blue-600 hover:text-blue-800">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(menu.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-gray-400 cursor-move touch-none" {...attributes} {...listeners}>
                        <GripVertical size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-800">{menu.label}</div>
                        <div className="text-xs text-gray-500 font-mono">{menu.url}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${menu.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {menu.is_active ? 'Active' : 'Hidden'}
                    </span>
                    <button onClick={() => handleEdit(menu)} className="text-blue-600 p-1"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(menu.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                </div>
            </div>
        </div>
    );
};


const MenuManager = () => {
    const [menus, setMenus] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ label: '', url: '', is_active: true });
    const [isCreating, setIsCreating] = useState(false);

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

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        const { data } = await api.get('/menus');
        const sorted = data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        setMenus(sorted);
    };

    const handleEdit = (menu) => {
        setEditingId(menu.id);
        const { id, created_at, updated_at, sort_order, ...editableFields } = menu;
        setFormData(editableFields);
        setIsCreating(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this menu item?')) {
            await api.delete(`/menus/${id}`);
            fetchMenus();
        }
    };

    const handleSave = async () => {
        try {
            if (isCreating) {
                await api.post('/menus', { ...formData, sort_order: menus.length });
            } else {
                await api.put(`/menus/${editingId}`, formData);
            }
            setIsCreating(false);
            setEditingId(null);
            fetchMenus();
        } catch (error) {
            console.error(error);
        }
    };

    const startCreate = () => {
        setFormData({ label: '', url: '', is_active: true });
        setIsCreating(true);
        setEditingId(null);
    };

    const [activeId, setActiveId] = useState(null);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over.id) {
            setMenus((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                const updates = newOrder.map((menu, index) => ({
                    id: menu.id,
                    sort_order: index
                }));

                api.post('/menus/reorder', { order: updates })
                    .catch(err => {
                        console.error('Reorder failed', err);
                        fetchMenus();
                    });

                return newOrder;
            });
        }
    };

    const activeMenu = menus.find(m => m.id === activeId);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
                <button onClick={startCreate} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
                    <Plus size={20} /> Add Menu Item
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 font-semibold text-gray-600 border-b bg-gray-50">
                    <div className="col-span-1 text-center">Drag</div>
                    <div className="col-span-5">Label</div>
                    <div className="col-span-4">URL</div>
                    <div className="col-span-1 text-center">Active</div>
                    <div className="col-span-1 text-right">Action</div>
                </div>

                {isCreating && (
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center bg-blue-50 border-b">
                        <div className="col-span-1 text-center text-gray-300"><Plus size={20} className="mx-auto" /></div>
                        <div className="col-span-5">
                            <input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full border rounded p-1" placeholder="Label" autoFocus />
                        </div>
                        <div className="col-span-4">
                            <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border rounded p-1" placeholder="/url" />
                        </div>
                        <div className="col-span-1 text-center">
                            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                        </div>
                        <div className="col-span-1 flex justify-end gap-2">
                            <button onClick={handleSave} className="text-green-600 p-1 hover:bg-white rounded"><Check size={20} /></button>
                            <button onClick={() => setIsCreating(false)} className="text-gray-500 p-1 hover:bg-white rounded"><X size={20} /></button>
                        </div>
                    </div>
                )}

                {isCreating && (
                    <div className="md:hidden p-4 bg-blue-50 border-b space-y-3">
                        <h4 className="font-bold text-blue-800 text-sm uppercase">New Menu Item</h4>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Label</label>
                            <input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full border rounded p-2" placeholder="Label" autoFocus />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">URL</label>
                            <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border rounded p-2" placeholder="/url" />
                        </div>
                        <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                                Active
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-500 hover:bg-white rounded font-bold text-sm">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded font-bold text-sm hover:bg-green-700">Save</button>
                        </div>
                    </div>
                )}

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={menus.map(m => m.id)} strategy={verticalListSortingStrategy}>
                        {menus.map((menu) => (
                            <SortableMenuRow
                                key={menu.id}
                                menu={menu}
                                editingId={editingId}
                                formData={formData}
                                setFormData={setFormData}
                                handleSave={handleSave}
                                setEditingId={setEditingId}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </SortableContext>

                    <DragOverlay>
                        {activeId && activeMenu ? (
                            <div className="bg-white shadow-xl rounded-lg border border-blue-200 p-4 flex items-center justify-between opacity-95 w-full max-w-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="text-gray-400">
                                        <GripVertical size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{activeMenu.label}</div>
                                        <div className="text-xs text-gray-500 font-mono">{activeMenu.url}</div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-500`}>
                                    Moving
                                </span>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {menus.length === 0 && !isCreating && (
                    <div className="p-8 text-center text-gray-500">No menu items found.</div>
                )}
            </div>
        </div>
    );
};

export default MenuManager;
