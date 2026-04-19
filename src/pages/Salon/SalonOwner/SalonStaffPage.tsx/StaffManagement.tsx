import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Plus,
    Search,
    Edit2,
    User,
    X,
    Check,
    Scissors,
    Briefcase
} from 'lucide-react';
import { useApi } from '../../../../API/SalonsAPIs/ALLSalonAPI';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { useNavigate } from 'react-router-dom';
import { DashboardLoader } from '../../../../components/ui_components/DashboardLoader';

const StaffManagement: React.FC = () => {
    const { t } = useTranslation();
    const { apiRequest } = useApi();
    const { apiSalonPost, apiSalonPut } = useSalonApi();
    const navigate = useNavigate();

    const [staffList, setStaffList] = useState<any[]>([]);
    const [allServices, setAllServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "Hair Stylist",
        gender: "Male",
        languages: [] as string[],
        expertise: [] as string[],
        instagramHandle: "",
        experienceYears: "",
        active: true,
        certifications: [] as string[],
        specializations: [] as string[],
        images: [] as string[],
        services: [] as string[], // New: Array of selected Service IDs
    });

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchStaff(), fetchServices()]);
            setLoading(false);
        };
        init();
    }, []);

    const fetchStaff = async () => {
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
            if (!salonId) return navigate("/login");

            const res = await apiRequest<any>(`/salons/${salonId}/staff`);
            if (res.data) setStaffList(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchServices = async () => {
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
            if (!salonId) {
                console.error('salonId is undefined in fetchServices');
                return;
            }
            const res = await apiRequest<any>(`/salons/${salonId}/services`);
            if (res.data) setAllServices(res.data);
        } catch (error) { console.error(error); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;

            for (const file of Array.from(files)) {
                const uploadData = new FormData();
                uploadData.append("files", file);
                uploadData.append("salon_id", salonId);
                const res = await apiSalonPost<any>(`/upload/salon-images`, uploadData);
                if (res?.data?.data?.urls[0]) uploadedUrls.push(res.data.data.urls[0]);
            }
            setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        } catch (error) { console.error(error); } 
        finally { setUploading(false); }
    };

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;

            const payload = {
                ...formData,
                experienceYears: Number(formData.experienceYears),
                rating: { average: 5.0, reviewsCount: 0 },
                metadata: {
                    certifications: formData.certifications,
                    specializations: formData.specializations
                }
            };

            await apiSalonPost(`/salons/${salonId}/staff`, payload);
            setIsModalOpen(false);
            resetForm();
            fetchStaff();
        } finally { setSubmitting(false); }
    };

    const handleEditClick = (staff: any) => {
        setEditingStaffId(staff.staff_id);
        setFormData({
            name: staff.name || "",
            email: staff.email || "",
            phone: staff.phone || "",
            role: staff.role || "Hair Stylist",
            gender: staff.gender || "Male",
            languages: Array.isArray(staff.languages) ? staff.languages : [],
            expertise: Array.isArray(staff.expertise) ? staff.expertise : [],
            instagramHandle: staff.instagramHandle || "",
            experienceYears: staff.experienceYears?.toString() || "",
            active: staff.active ?? true,
            certifications: Array.isArray(staff.metadata?.certifications) ? staff.metadata.certifications : [],
            specializations: Array.isArray(staff.metadata?.specializations) ? staff.metadata.specializations : [],
            images: Array.isArray(staff.images) ? staff.images : [],
            services: Array.isArray(staff.services) 
                ? staff.services.map((s: any) => typeof s === 'string' ? s : s.service_id) 
                : []
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;

            const payload = {
                ...formData,
                experienceYears: Number(formData.experienceYears),
                metadata: {
                    certifications: formData.certifications,
                    specializations: formData.specializations
                }
            };

            await apiSalonPut(`/salons/${salonId}/staff/${editingStaffId}`, payload);
            setIsEditModalOpen(false);
            resetForm();
            fetchStaff();
        } finally { setSubmitting(false); }
    };

    const resetForm = () => {
        setFormData({
            name: "", email: "", phone: "", role: "Hair Stylist",
            gender: "Male", languages: [], expertise: [],
            instagramHandle: "", experienceYears: "", active: true,
            certifications: [], specializations: [], images: [], services: []
        });
        setEditingStaffId(null);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
            <DashboardLoader isVisible={loading || submitting} />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in slide-in-from-top duration-500">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Team Members</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your salon staff and their services</p>
                </div>
                <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E4D8C] to-[#2a5fa8] text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300">
                    <Plus size={18} /> {t('staff.addStaff')}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96 animate-in slide-in-from-top duration-500 delay-100">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder={t('staff.searchStaff')} 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm transition-all" 
                />
            </div>

            {/* Staff Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-500 delay-200">
                {staffList.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((staff) => (
                    <div 
                        key={staff.staff_id} 
                        className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50"
                    >
                        {/* Card Header with Image */}
                        <div className="relative h-32 bg-gradient-to-br from-[#1E4D8C] to-[#3a7bc8] overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBIMHY0MHptMjAgMjBWMjBIMHYyMGgyMHptMjAgMjBWMjBIMHYyMGgyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
                            <div className="absolute bottom-3 left-4">
                                <div className="w-24 h-24 rounded-xl bg-white shadow-lg overflow-hidden border-3 border-white">
                                    {staff.images?.[0] ? 
                                        <img src={staff.images[0]} className="w-full h-full object-cover" alt={staff.name} /> : 
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <User size={40} className="text-gray-400" />
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="absolute top-3 right-3">
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border-2 ${
                                    staff.active 
                                        ? 'text-white bg-[#1E4D8C] border-[#1E4D8C]' 
                                        : 'text-gray-600 bg-white border-gray-300'
                                }`}>
                                    {staff.active ? t('staff.active') : t('staff.inactive')}
                                </span>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="pt-10 pb-4 px-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-gray-800">{staff.name}</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{staff.role}</p>
                                </div>
                                {/* Experience & Rating on right */}
                                <div className="flex flex-col gap-1 items-end">
                                    {staff.experienceYears && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded bg-amber-50 flex items-center justify-center">
                                                <Briefcase size={8} className="text-amber-600" />
                                            </div>
                                            <span className="text-[9px] text-gray-600 font-medium">{staff.experienceYears}y</span>
                                        </div>
                                    )}
                                    {staff.rating?.average && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded bg-green-50 flex items-center justify-center">
                                                <span className="text-[7px]">★</span>
                                            </div>
                                            <span className="text-[9px] text-gray-600 font-medium">{staff.rating.average.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Services */}
                            <div className="mb-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {staff.services?.length > 0 ? staff.services.map((ser: any) => {
                                        const serviceId = typeof ser === 'string' ? ser : ser.service_id;
                                        const service = allServices.find((s: any) => s.service_id === serviceId);
                                        return service ? (
                                            <span key={serviceId} className="px-2.5 py-1 bg-gradient-to-r from-[#1E4D8C]/10 to-[#2a5fa8]/10 text-[#1E4D8C] rounded-lg text-[10px] font-semibold border border-[#1E4D8C]/20 shadow-sm">
                                                {service.serviceName}
                                            </span>
                                        ) : null;
                                    }) : <span className="text-[9px] text-gray-400 italic w-full text-center">{t('staff.noServicesLinked')}</span>}
                                </div>
                            </div>

                            {/* Contact Info Row */}
                            <div className="flex justify-between items-center mb-3 text-[9px] text-gray-500">
                                {staff.phone && (
                                    <span className="flex items-center gap-1">
                                        📞 {staff.phone}
                                    </span>
                                )}
                                {staff.instagramHandle && (
                                    <a 
                                        href={`https://instagram.com/${staff.instagramHandle.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 truncate max-w-[120px] text-blue-600 hover:text-blue-700"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#F58529"/>
                                                    <stop offset="25%" stopColor="#DD2A7F"/>
                                                    <stop offset="50%" stopColor="#8134AF"/>
                                                    <stop offset="75%" stopColor="#515BD4"/>
                                                </linearGradient>
                                            </defs>
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="url(#instagram-gradient)"/>
                                        </svg>
                                        {staff.instagramHandle}
                                    </a>
                                )}
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={() => handleEditClick(staff)}
                                className="w-full py-2 px-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-blue-700 rounded-lg text-[10px] font-semibold border border-gray-200 hover:border-blue-200 transition-all duration-300 flex items-center justify-center gap-1.5 group-hover:shadow-sm"
                            >
                                <Edit2 size={12} />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {(isModalOpen || isEditModalOpen) && (
                <StaffFormModal
                    title={isEditModalOpen ? t('staff.updateStaff') : t('staff.addStaffMember')}
                    onClose={() => { setIsModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                    onSubmit={isEditModalOpen ? handleUpdateStaff : handleCreateStaff}
                    formData={formData}
                    setFormData={setFormData}
                    allServices={allServices} // Pass services to modal
                    submitting={submitting}
                    uploading={uploading}
                    handleFileUpload={handleFileUpload}
                />
            )}
        </div>
    );
};

const StaffFormModal = ({ title, onClose, onSubmit, formData, setFormData, allServices, submitting, uploading, handleFileUpload }: any) => {
    const { t } = useTranslation();
    const [newSpec, setNewSpec] = useState("");
    const [newLang, setNewLang] = useState("");
    const [newCert, setNewCert] = useState("");
    const [newSpec2, setNewSpec2] = useState("");

    const addSpec = () => {
        if (!newSpec.trim() || formData.expertise.includes(newSpec.trim())) return;
        setFormData({ ...formData, expertise: [...formData.expertise, newSpec.trim()] });
        setNewSpec("");
    };

    const addLang = () => {
        if (!newLang.trim() || formData.languages.includes(newLang.trim())) return;
        setFormData({ ...formData, languages: [...formData.languages, newLang.trim()] });
        setNewLang("");
    };

    const addCert = () => {
        if (!newCert.trim() || formData.certifications.includes(newCert.trim())) return;
        setFormData({ ...formData, certifications: [...formData.certifications, newCert.trim()] });
        setNewCert("");
    };

    const addSpec2 = () => {
        if (!newSpec2.trim() || formData.specializations.includes(newSpec2.trim())) return;
        setFormData({ ...formData, specializations: [...formData.specializations, newSpec2.trim()] });
        setNewSpec2("");
    };

    const toggleService = (id: string) => {
        const isSelected = formData.services.includes(id);
        const newIds = isSelected 
            ? formData.services.filter((sId: string) => sId !== id)
            : [...formData.services, id];
        setFormData({ ...formData, services: newIds });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay">
            <div className="glass-modal w-full max-w-lg rounded-2xl overflow-hidden animate-md3-scale-in elevation-5">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Photos Upload */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.staffPhotos')} {uploading && t('staff.uploading')}</label>
                        <div className="grid grid-cols-4 gap-2">
                            <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                                <Plus size={20} className="text-gray-400" />
                                <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                            {formData.images.map((url: string, index: number) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                                    <img src={url} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setFormData({ ...formData, images: formData.images.filter((_: any, i: number) => i !== index) })} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.fullName')}</label>
                            <input required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-300 focus:elevation-2 transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.role')}</label>
                            <input required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-300 focus:elevation-2 transition-all" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                        </div>
                    </div>

                    {/* --- NEW: SERVICE SELECTION GRID --- */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Scissors size={12}/> {t('staff.assignedServices')}
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border border-gray-50 rounded-xl">
                            {allServices.map((service) => {
                                const isSelected = formData.services.includes(service.service_id);
                                return (
                                    <div 
                                        key={service.service_id}
                                        onClick={() => toggleService(service.service_id)}
                                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                                            isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                            {service.imageUrl && <img src={service.imageUrl} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[10px] font-bold truncate ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>{service.serviceName}</p>
                                            <p className="text-[8px] text-gray-400">₹{service.price}</p>
                                        </div>
                                        {isSelected && <Check size={12} className="text-blue-600" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.email')}</label>
                            <input type="email" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:elevation-2 transition-all" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.phone')}</label>
                            <input required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:elevation-2 transition-all" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instagram Handle</label>
                        <input className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-300 focus:elevation-2 transition-all" placeholder="@username" value={formData.instagramHandle} onChange={e => setFormData({ ...formData, instagramHandle: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Experience (Years)
                            </label>
                            <input 
                                type="number" 
                                required 
                                min="0"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" 
                                value={formData.experienceYears} 
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === "" || Number(val) >= 0) {
                                        setFormData({ ...formData, experienceYears: val });
                                    }
                                }} 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Specialization Keywords</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Hit Enter to add" value={newSpec} onChange={e => setNewSpec(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec())} />
                            <button type="button" onClick={addSpec} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {formData.expertise.map((item: string, i: number) => (
                                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-lg">{item} <X size={10} className="cursor-pointer" onClick={() => setFormData({...formData, expertise: formData.expertise.filter((_, idx) => idx !== i)})} /></span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Languages</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Hit Enter to add" value={newLang} onChange={e => setNewLang(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLang())} />
                            <button type="button" onClick={addLang} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {formData.languages.map((item: string, i: number) => (
                                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-lg">{item} <X size={10} className="cursor-pointer" onClick={() => setFormData({...formData, languages: formData.languages.filter((_, idx) => idx !== i)})} /></span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Certifications</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Hit Enter to add" value={newCert} onChange={e => setNewCert(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())} />
                            <button type="button" onClick={addCert} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {formData.certifications.map((item: string, i: number) => (
                                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-lg">{item} <X size={10} className="cursor-pointer" onClick={() => setFormData({...formData, certifications: formData.certifications.filter((_, idx) => idx !== i)})} /></span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Specializations</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Hit Enter to add" value={newSpec2} onChange={e => setNewSpec2(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec2())} />
                            <button type="button" onClick={addSpec2} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {formData.specializations.map((item: string, i: number) => (
                                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-lg">{item} <X size={10} className="cursor-pointer" onClick={() => setFormData({...formData, specializations: formData.specializations.filter((_, idx) => idx !== i)})} /></span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Active Status</span>
                        <button type="button" onClick={() => setFormData({ ...formData, active: !formData.active })} className={`w-12 h-6 rounded-full relative transition-colors ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#1E4D8C] text-white rounded-xl font-bold elevation-3 hover:elevation-4 disabled:opacity-70 active:scale-[0.98] transition-all ripple-container">
                        {submitting ? t('staff.processing') : t('staff.saveStaff')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StaffManagement;