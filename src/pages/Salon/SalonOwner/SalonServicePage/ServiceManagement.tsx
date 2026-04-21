import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Scissors,
    Clock,
    X,
    ImageIcon,
    Check,
    Box,
    Users
} from 'lucide-react';
import { useApi } from '../../../../API/SalonsAPIs/ALLSalonAPI';
import { Loader } from '../../../../components/ui_components/Loader';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { logoutUser } from '../../../../API/APIs';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DashboardLoader } from '../../../../components/ui_components/DashboardLoader';

const ServiceManagement: React.FC = () => {
    const { t } = useTranslation();
    const { apiRequest } = useApi();
    const { apiSalonPost, apiSalonPut } = useSalonApi();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [serviceList, setServiceList] = useState<any[]>([]);
    const [allStaff, setAllStaff] = useState<any[]>([]); // Staff List State
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        serviceName: "",
        description: "",
        price: "", // Default 0
        durationMinutes: "", // Default 0
        includedItems: [] as string[],
        imageUrl: "",
        active: true,
        staff_ids: [] as string[] // Selected Staff IDs
    });

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchServices(), fetchStaff()]);
            setLoading(false);
        };
        init();
    }, []);

    const fetchStaff = async () => {
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
            const res = await apiRequest<any>(`/salons/${salonId}/staff`);
            if (res.data) setAllStaff(res.data);
        } catch (e) { console.error("Staff fetch failed", e); }
    };

    const fetchServices = async () => {
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
            if (!salonId) {
                dispatch(logoutUser());
                navigate("/login");
                return;
            }
            const res = await apiRequest<any>(`/salons/${salonId}/services`);
            if (res.data) setServiceList(res.data);
        } catch (error) { console.error("Fetch error:", error); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
            const uploadData = new FormData();
            uploadData.append("files", file);
            uploadData.append("salon_id", salonId);
            const res = await apiSalonPost<any>(`/upload/salon-images`, uploadData);
            if (res?.data?.data?.urls[0]) {
                setFormData(prev => ({ ...prev, imageUrl: res.data.data.urls[0] }));
            }
        } catch (error) { console.error("Upload failed", error); }
        finally { setUploading(false); }
    };

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
            await apiSalonPost(`/salons/${salonId}/services`, formData);
            setIsModalOpen(false);
            resetForm();
            fetchServices();
        } finally { setSubmitting(false); }
    };

    const handleEditClick = (service: any) => {
        setEditingServiceId(service.service_id);
        setFormData({
            serviceName: service.serviceName || "",
            description: service.description || "",
            price: service.price ?? "",
            durationMinutes: service.durationMinutes ?? "",
            includedItems: Array.isArray(service.includedItems) ? service.includedItems : [],
            imageUrl: service.imageUrl || "",
            active: service.active ?? true,
            staff_ids: Array.isArray(service.staff_ids) ? service.staff_ids : []
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
            await apiSalonPut(`/salons/${salonId}/services/${editingServiceId}`, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchServices();
        } finally { setSubmitting(false); }
    };

    const resetForm = () => {
        setFormData({
            serviceName: "", description: "", price: "",
            durationMinutes: "", includedItems: [],
            imageUrl: "", active: true, staff_ids: []
        });
        setEditingServiceId(null);
    };

    return (
        <div className="min-h-screen p-6 animate-in fade-in duration-500" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--soft-ivory)' }}>
            <DashboardLoader isVisible={loading || submitting} />

            {/* Main Stage Container */}
            <div className="main-stage p-6 space-y-6">
                {/* Fixed Header Strip */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4" style={{ borderBottom: '1px solid var(--light-greige)' }}>
                    <div>
                        <h1 className="font-semibold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: 'var(--deep-charcoal)' }}>{t('services.title')}</h1>
                        <p className="typography-label-light" style={{ fontSize: '14px' }}>{t('services.manageServices')}</p>
                    </div>
                    <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 text-white rounded-2xl text-sm font-semibold transition-all duration-300" style={{ backgroundColor: 'var(--muted-gold)', height: '44px' }}>
                        <Plus size={18} /> {t('services.addService')}
                    </button>
                </div>

                {/* Search Bar - Integrated in Header Strip */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: '#666' }} />
                    <input 
                        type="text" 
                        placeholder={t('services.search')} 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full pl-12 pr-4 rounded-2xl text-sm outline-none transition-all typography-label-light" 
                        style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
                    />
                </div>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-500 delay-200 mt-6">
                {serviceList.filter(s => s.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())).map((service) => (
                    <div 
                        key={service.service_id} 
                        className="floating-tile overflow-hidden hover-lift"
                    >
                        {/* Card Header with Image */}
                        <div className="relative h-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--muted-gold) 0%, var(--deep-charcoal) 100%)' }}>
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBIMHY0MHptMjAgMjBWMjBIMHYyMGgyMHptMjAgMjBWMjBIMHYyMGgyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
                            <div className="absolute bottom-3 left-4">
                                <div className="w-24 h-24 rounded-xl bg-white shadow-lg overflow-hidden border-3 border-white">
                                    {service.imageUrl ? (
                                        <img src={service.imageUrl} className="w-full h-full object-cover" alt={service.serviceName} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--light-greige)' }}>
                                            <Scissors size={32} style={{ color: '#666' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute top-3 right-3">
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border-2 ${
                                    service.active 
                                        ? 'text-white' 
                                        : 'text-gray-600 bg-white'
                                }`} style={service.active ? { backgroundColor: 'var(--sage-green)', borderColor: 'var(--sage-green)' } : { borderColor: 'var(--light-greige)' }}>
                                    {service.active ? t('services.active') : t('services.inactive')}
                                </span>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="pt-10 pb-4 px-4">
                            <div className="mb-3">
                                <h3 className="typography-label" style={{ fontSize: '16px', color: 'var(--deep-charcoal)' }}>{service.serviceName}</h3>
                                <p className="typography-label-light flex items-center gap-1 mt-0.5" style={{ fontSize: '10px' }}>
                                    <Clock size={10} /> {service.durationMinutes} {t('services.mins')}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="mb-3">
                                <span className="typography-number" style={{ fontSize: '20px', color: 'var(--muted-gold)' }}>₹{service.price}</span>
                            </div>

                            {/* Linked Staff */}
                            <div className="mb-3">
                                <p className="typography-label-light uppercase tracking-wider mb-1.5" style={{ fontSize: '9px' }}>Assigned Staff</p>
                                <div className="flex -space-x-2 overflow-hidden">
                                    {service.staff?.length > 0 ? (
                                        service.staff.slice(0, 3).map((s: any) => (
                                            <div key={s.staff_id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 overflow-hidden" title={s?.name}>
                                                <img src={s?.image_url || '/placeholder.png'} className="h-full w-full object-cover" alt="" />
                                            </div>
                                        ))
                                    ) : <span className="text-[9px] text-gray-400 italic">{t('services.noStaffAssigned')}</span>}
                                    {service.staff?.length > 3 && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full typography-label-light ring-2 ring-white" style={{ backgroundColor: 'var(--light-greige)', fontSize: '9px' }}>
                                            +{service.staff.length - 3}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={() => handleEditClick(service)}
                                className="w-full py-2 px-3 rounded-lg text-[10px] font-semibold border transition-all duration-300 flex items-center justify-center gap-1.5 group-hover:shadow-sm typography-label-light"
                                style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)', color: 'var(--deep-charcoal)' }}
                            >
                                <Edit2 size={12} />
                                Edit Service
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {(isModalOpen || isEditModalOpen) && (
                <ServiceFormModal
                    title={isEditModalOpen ? t('services.editService') : t('services.addService')}
                    onClose={() => { setIsModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                    onSubmit={isEditModalOpen ? handleUpdateService : handleCreateService}
                    formData={formData}
                    setFormData={setFormData}
                    allStaff={allStaff}
                    submitting={submitting}
                    uploading={uploading}
                    handleFileUpload={handleFileUpload}
                />
            )}
        </div>
    );
};

const ServiceFormModal = ({ title, onClose, onSubmit, formData, setFormData, allStaff, submitting, uploading, handleFileUpload }: any) => {
    const { t } = useTranslation();
    const [newItem, setNewItem] = useState("");

    const addInclude = () => {
        if (!newItem.trim() || formData.includedItems.includes(newItem.trim())) return;
        setFormData({ ...formData, includedItems: [...formData.includedItems, newItem.trim()] });
        setNewItem("");
    };

    const toggleStaff = (id: string) => {
        const isSelected = formData.staff_ids.includes(id);
        const newIds = isSelected
            ? formData.staff_ids.filter((sId: string) => sId !== id)
            : [...formData.staff_ids, id];
        setFormData({ ...formData, staff_ids: newIds });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">

                    {/* Image Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{t('services.serviceBanner')}</label>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="relative w-20 h-20 rounded-xl bg-white border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <ImageIcon size={24} className="text-gray-300" />
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-[#1E4D8C] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="inline-block">
                                    <span className="cursor-pointer px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all">
                                        {formData.imageUrl ? t('services.changePhoto') : t('services.uploadPhoto')}
                                    </span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                </label>
                                <p className="text-[9px] text-gray-400 font-medium">{t('services.clickToUpload')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('services.serviceName')}</label>
                        <input required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.serviceName} onChange={e => setFormData({ ...formData, serviceName: e.target.value })} />
                    </div>

                    {/* Assigned Staff Grid */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Users size={12} /> {t('services.assignProfessionalStaff')}
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                            {allStaff.length > 0 ? allStaff.map((staff) => {
                                const isSelected = formData.staff_ids.includes(staff.staff_id);
                                return (
                                    <div
                                        key={staff.staff_id}
                                        onClick={() => toggleStaff(staff.staff_id)}
                                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-white border-gray-100 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-white">
                                            <img src={staff.images?.[0] || '/placeholder.png'} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                                            {staff.name}
                                        </span>
                                        {isSelected && <Check size={12} className="ml-auto text-blue-600" />}
                                    </div>
                                );
                            }) : <p className="text-[10px] text-gray-400 italic col-span-2">{t('services.noStaffFound')}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('services.priceRupee')}</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-blue-600"
                                value={formData.price}
                                min="0"
                                // onChange={e => setFormData({ ...formData, price: e.target.value })} 
                                onChange={e => {
                                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                                    setFormData({ ...formData, price: Math.max(0, val) });
                                }}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('services.durationMin')}</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                value={formData.durationMinutes}
                                min="0"
                                onChange={e => {
                                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                                    setFormData({ ...formData, durationMinutes: Math.max(0, val) });
                                }}
                            // onChange={e => setFormData({ ...formData, durationMinutes: (e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('services.includedBenefits')}</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder={t('services.benefitPlaceholder')} value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())} />
                            <button type="button" onClick={addInclude} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Plus size={20} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.includedItems.map((item: string, i: number) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#1E4D8C] text-white rounded-full text-[10px] font-bold">
                                    {item} <X size={10} className="cursor-pointer hover:text-red-300" onClick={() => setFormData({ ...formData, includedItems: formData.includedItems.filter((_: any, idx: number) => idx !== i) })} />
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">{t('services.activeStatus')}</span>
                        <button type="button" onClick={() => setFormData({ ...formData, active: !formData.active })} className={`w-12 h-6 rounded-full relative transition-colors ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#1E4D8C] text-white rounded-xl font-bold shadow-lg disabled:opacity-70 active:scale-[0.98] transition-all">
                        {submitting ? t('services.processing') : t('services.saveService')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ServiceManagement;