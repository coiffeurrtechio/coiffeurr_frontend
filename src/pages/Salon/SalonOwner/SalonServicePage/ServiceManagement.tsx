import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Scissors,
    Clock,
    X,
    ImageIcon,
    Link as LinkIcon,
    Check,
    Box
} from 'lucide-react';
import { useApi } from '../../../../API/SalonsAPIs/ALLSalonAPI';
import { Loader } from '../../../../components/ui_components/Loader';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';

const ServiceManagement: React.FC = () => {
    const { apiRequest } = useApi();
    const { apiSalonPost, apiSalonPut } = useSalonApi();

    const [serviceList, setServiceList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        serviceName: "",
        description: "",
        price: 0,
        durationMinutes: 0,
        includedItems: [] as string[],
        imageUrl: "",
        active: true
    });

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
            const res = await apiRequest<any>(`/salons/${salonId}/services`);
            if (res.data) setServiceList(res.data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
            
            // Send complete object including includedItems array
            await apiSalonPost(`/salons/${salonId}/services`, formData);
            
            setIsModalOpen(false);
            resetForm();
            fetchServices();
        } finally { setSubmitting(false); }
    };

    const handleEditClick = (service: any) => {
        setEditingServiceId(service.service_id);
        setFormData({
            serviceName: service.serviceName,
            description: service.description,
            price: service.price,
            durationMinutes: service.durationMinutes,
            includedItems: Array.isArray(service.includedItems) ? service.includedItems : [],
            imageUrl: service.imageUrl || "",
            active: service.active ?? true
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;

            // Send payload with includedItems as requested
            const payload = {
                serviceName: formData.serviceName,
                description: formData.description,
                price: formData.price,
                durationMinutes: formData.durationMinutes,
                includedItems: formData.includedItems,
                imageUrl: formData.imageUrl,
                active: formData.active
            };

            await apiSalonPut(`/salons/${salonId}/services/${editingServiceId}`, payload);
            setIsEditModalOpen(false);
            resetForm();
            fetchServices();
        } finally { setSubmitting(false); }
    };

    const handleDeleteService = async (id: string) => {
        if (!window.confirm("Permanently delete this service?")) return;
        setLoading(true);
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.id || parsedAuth?.user?.salonId;
            // await apiSalonDelete(`/salons/${salonId}/services/${id}`);
            fetchServices();
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        setFormData({ serviceName: "", description: "", price: 0, durationMinutes: 0, includedItems: [], imageUrl: "", active: true });
        setEditingServiceId(null);
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <Loader isVisible={loading || submitting} />

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Services</h1>
                <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-[#1E4D8C] text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">
                    <Plus size={18} /> Add Service
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800">Service Catalogue</h2>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 uppercase text-[10px] font-bold text-gray-400 tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Service Details</th>
                                <th className="px-6 py-4">Includes</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {serviceList.filter(s => s.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())).map((service) => (
                                <tr key={service.service_id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-gray-100 shadow-sm">
                                                {service.imageUrl ? (
                                                    <img src={service.imageUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400"><Scissors size={20} /></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{service.serviceName}</p>
                                                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 font-medium"><Clock size={10} /> {service.durationMinutes} mins</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                                            {service.includedItems?.length > 0 ? (
                                                service.includedItems.map((item: string, i: number) => (
                                                    <span key={i} className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-bold uppercase">{item}</span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-300 italic">No items</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-sm font-black text-[#1E4D8C]">₹{service.price}</span></td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase border ${service.active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            {service.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEditClick(service)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                                            {/* <button onClick={() => handleDeleteService(service.service_id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button> */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- FORM MODAL --- */}
            {(isModalOpen || isEditModalOpen) && (
                <ServiceFormModal 
                    title={isEditModalOpen ? "Edit Service" : "Add Service"}
                    onClose={() => { setIsModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                    onSubmit={isEditModalOpen ? handleUpdateService : handleCreateService}
                    formData={formData}
                    setFormData={setFormData}
                    submitting={submitting}
                />
            )}
        </div>
    );
};

const ServiceFormModal = ({ title, onClose, onSubmit, formData, setFormData, submitting }: any) => {
    const [newItem, setNewItem] = useState("");

    const addInclude = () => {
        if (!newItem.trim()) return;
        if (formData.includedItems.includes(newItem.trim())) return;
        setFormData({ ...formData, includedItems: [...formData.includedItems, newItem.trim()] });
        setNewItem("");
    };

    const removeInclude = (index: number) => {
        setFormData({ ...formData, includedItems: formData.includedItems.filter((_: any, i: number) => i !== index) });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                    
                    {/* Image URL Section */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-16 h-16 rounded-lg bg-white border flex items-center justify-center overflow-hidden shrink-0">
                            {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-300" />}
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Image URL</label>
                            <input className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400" placeholder="Paste URL..." value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Service Name</label>
                        <input required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" value={formData.serviceName} onChange={e => setFormData({ ...formData, serviceName: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price (₹)</label>
                            <input type="number" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-blue-600" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration (Min)</label>
                            <input type="number" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })} />
                        </div>
                    </div>

                    {/* Included Items List Builder */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Included Items (Benefits)</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="e.g. Hairwash" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())} />
                            <button type="button" onClick={addInclude} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Plus size={20} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.includedItems.map((item: string, i: number) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#1E4D8C] text-white rounded-full text-[11px] font-bold">
                                    {item} <X size={12} className="cursor-pointer hover:text-red-300" onClick={() => removeInclude(i)} />
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                        <textarea rows={2} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Active Status</span>
                        <button type="button" onClick={() => setFormData({ ...formData, active: !formData.active })} className={`w-12 h-6 rounded-full relative transition-colors ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#1E4D8C] text-white rounded-xl font-bold shadow-lg disabled:opacity-70 active:scale-[0.98] transition-all">
                        {submitting ? "Processing..." : "Save Service"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ServiceManagement;