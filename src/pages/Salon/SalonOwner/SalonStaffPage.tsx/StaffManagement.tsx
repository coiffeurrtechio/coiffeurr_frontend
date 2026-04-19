import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Plus,
    Search,
    Edit2,
    User,
    X,
    Check,
    Scissors
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
    const [activeTab, setActiveTab] = useState(t('staff.allStaff'));

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
            services: Array.isArray(staff.services) ? staff.services.map((s: any) => s.service_id) : [] // Map objects to IDs
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
        <div className="p-4 md:p-6 space-y-6">
            <DashboardLoader isVisible={loading || submitting} />

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 md:gap-4 bg-white p-1 rounded-xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                    {[t('staff.allStaff')].map((tab) => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === tab 
                                    ? 'bg-[#1E4D8C] text-white' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1E4D8C] text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">
                    <Plus size={18} /> {t('staff.addStaff')}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800">{t('staff.staffMembers')}</h2>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder={t('staff.searchStaff')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                    </div>
                </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 uppercase text-[10px] font-bold text-gray-400 tracking-wider">
                        <tr>
                            <th className="px-6 py-4">{t('staff.name')}</th>
                            <th className="px-6 py-4">{t('staff.specializedServices')}</th>
                            <th className="px-6 py-4 text-center">{t('staff.status')}</th>
                            <th className="px-6 py-4 text-right">{t('staff.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {staffList.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((staff) => (
                            <tr key={staff.staff_id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-6 py-5 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-gray-100">
                                        {staff.images?.[0] ? <img src={staff.images[0]} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-2 text-slate-400" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{staff.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase">{staff.role}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                                        {staff.services?.length > 0 ? staff.services.map((ser: any) => (
                                            <span key={ser.service_id} className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-bold uppercase">{ser.serviceName}</span>
                                        )) : <span className="text-[10px] text-gray-300 italic">{t('staff.noServicesLinked')}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase border ${staff.active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                        {staff.active ? t('staff.active') : t('staff.inactive')}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button onClick={() => handleEditClick(staff)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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

    const addSpec = () => {
        if (!newSpec.trim() || formData.expertise.includes(newSpec.trim())) return;
        setFormData({ ...formData, expertise: [...formData.expertise, newSpec.trim()] });
        setNewSpec("");
    };

    const toggleService = (id: string) => {
        const isSelected = formData.services.includes(id);
        const newIds = isSelected 
            ? formData.services.filter((sId: string) => sId !== id)
            : [...formData.services, id];
        setFormData({ ...formData, services: newIds });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
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
                            <input required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.role')}</label>
                            <input required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
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
                            <input type="email" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.phone')}</label>
                            <input required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.gender')}</label>
                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                <option value="Male">{t('staff.male')}</option>
                                <option value="Female">{t('staff.female')}</option>
                                <option value="Other">{t('staff.other')}</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                {t('staff.expYears')}
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.specializationKeywords')}</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder={t('staff.hitEnterToAdd')} value={newSpec} onChange={e => setNewSpec(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec())} />
                            <button type="button" onClick={addSpec} className="p-2 bg-blue-50 text-blue-600 rounded-xl">+</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {formData.expertise.map((item: string, i: number) => (
                                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-lg">{item} <X size={10} className="cursor-pointer" onClick={() => setFormData({...formData, expertise: formData.expertise.filter((_, idx) => idx !== i)})} /></span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">{t('staff.activeStatus')}</span>
                        <button type="button" onClick={() => setFormData({ ...formData, active: !formData.active })} className={`w-12 h-6 rounded-full relative transition-colors ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#1E4D8C] text-white rounded-xl font-bold shadow-lg disabled:opacity-70 active:scale-[0.98] transition-all">
                        {submitting ? t('staff.processing') : t('staff.saveStaff')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StaffManagement;