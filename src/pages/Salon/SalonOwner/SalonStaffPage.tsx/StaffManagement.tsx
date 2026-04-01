import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    User,
    X,
    Briefcase,
    Phone,
    Mail,
    Globe,
    Check
} from 'lucide-react';
import { useApi } from '../../../../API/SalonsAPIs/ALLSalonAPI';
import { Loader } from '../../../../components/ui_components/Loader';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { logoutUser } from '../../../../API/APIs';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const StaffManagement: React.FC = () => {
    const { apiRequest } = useApi();
    const { apiSalonPost, apiSalonPut } = useSalonApi();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All Services');

    // --- MODAL & FORM STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

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
        rating: {} as any
    });

    const [uploading, setUploading] = useState(false);
    useEffect(() => { fetchStaff(); }, []);


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];

            for (const file of Array.from(files)) {
                const user = localStorage.getItem("authState");
                const parsedUser = user ? JSON.parse(user) : null;
                // Fallback to match your fetchProfile logic
                const salonId = parsedUser?.user?.user?.salonId || parsedUser?.user?.salonId;

                const uploadData = new FormData();
                uploadData.append("files", file);
                uploadData.append("salon_id", salonId);

                // If your API needs upload_preset (like Cloudinary):
                // uploadData.append("upload_preset", "your_preset");

                // Replace with your actual image upload endpoint
                const res = await apiSalonPost<any>(`/upload/salon-images`, uploadData);
                console.log("res =",res?.data);
                
                if (res?.data?.data?.urls[0]) {
                    uploadedUrls.push(res?.data?.data?.urls[0]);
                }
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));
        } catch (error) {
            console.error("Image upload failed:", error);
        } finally {
            setUploading(false);
        }
    };


    const fetchStaff = async () => {
        setLoading(true);
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
            if (!salonId) {
                dispatch(logoutUser());
                // Then redirect
                navigate("/login");
                console.log("salonid not found");
                return;

            }
            const res = await apiRequest<any>(`/salons/${salonId}/staff`);
            if (res.data) setStaffList(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;

            if (!salonId) {
                navigate("/login");
                return;
            }

            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                gender: formData.gender,
                languages: formData.languages,
                expertise: formData.expertise,
                instagramHandle: formData.instagramHandle,
                experienceYears: Number(formData.experienceYears),
                active: formData.active,
                rating: { average: 5.0, reviewsCount: 0 },
                // FIX: Pass the actual uploaded images here
                images: formData.images,
                services: [],
                reviews: [],
                metadata: {
                    certifications: formData.certifications,
                    specializations: formData.specializations
                }
            };

            await apiSalonPost(`/salons/${salonId}/staff`, payload);
            setIsModalOpen(false);
            resetForm();
            fetchStaff();
        } catch (error) {
            console.error("Creation failed:", error);
        } finally {
            setSubmitting(false);
        }
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
            // Map metadata back to flat form fields
            certifications: Array.isArray(staff.metadata?.certifications) ? staff.metadata.certifications : [],
            specializations: Array.isArray(staff.metadata?.specializations) ? staff.metadata.specializations : [],
            images: Array.isArray(staff.images) ? staff.images : [],
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

            if (!salonId) return;

            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                gender: formData.gender,
                languages: formData.languages,
                expertise: formData.expertise,
                instagramHandle: formData.instagramHandle,
                experienceYears: Number(formData.experienceYears),
                active: formData.active,
                images: formData.images, // Include the current images (newly uploaded + existing)
                metadata: {
                    certifications: formData.certifications,
                    specializations: formData.specializations
                }
            };

            await apiSalonPut(`/salons/${salonId}/staff/${editingStaffId}`, payload);
            setIsEditModalOpen(false);
            resetForm();
            fetchStaff();
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "", email: "", phone: "", role: "Hair Stylist",
            gender: "Male", languages: [], expertise: [],
            instagramHandle: "", experienceYears: "", active: true,
            certifications: [], specializations: [], images: []
        });
        setEditingStaffId(null);
    };

    const filteredStaff = staffList.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
            <Loader isVisible={loading || submitting} />

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 md:gap-4 bg-white p-1 rounded-xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                    {['All Services'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#1E4D8C] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{tab}</button>
                    ))}
                </div>
                <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1E4D8C] text-white rounded-xl text-sm font-bold shadow-lg transition-all">
                    <Plus size={18} /> Add Staff
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800">Manage Staff ({filteredStaff.length})</h2>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 uppercase text-[10px] font-bold text-gray-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Specialization</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStaff.map((staff) => (
                                <tr key={staff.staff_id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-5 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={20} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{staff.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">{staff.role || 'Stylist'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1">
                                            {(staff.expertise || staff.expertise || [])?.map((e: string, i: number) => (
                                                <span key={i} className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-bold uppercase">{e}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center"><StatusBadge isActive={staff.active} /></td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEditClick(staff)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                                            {/* <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button> */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {(isModalOpen || isEditModalOpen) && (
                <StaffFormModal
                    title={isEditModalOpen ? "Update Staff" : "Add Staff"}
                    onClose={() => { setIsModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                    onSubmit={isEditModalOpen ? handleUpdateStaff : handleCreateStaff}
                    formData={formData}
                    setFormData={setFormData}
                    submitting={submitting}
                    uploading={uploading}
                    handleFileUpload={handleFileUpload}
                />
            )}
        </div>
    );
};

/* --- TAG INPUT MODAL --- */
const StaffFormModal = ({ title, onClose, onSubmit, formData, setFormData, submitting,uploading, handleFileUpload }: any) => {
    const [newSpec, setNewSpec] = useState("");

    const addSpec = () => {
        if (!newSpec.trim() || formData.expertise.includes(newSpec.trim())) return;
        setFormData({ ...formData, expertise: [...formData.expertise, newSpec.trim()] });
        setNewSpec("");
    };

    const removeSpec = (index: number) => {
        setFormData({ ...formData, expertise: formData.expertise.filter((_: any, i: number) => i !== index) });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                            <input required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</label>
                            <input required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                        </div>
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input required type="email" className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input required className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="+91..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Specialization List Builder */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Specialization</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="Type and hit +" value={newSpec} onChange={e => setNewSpec(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpec())} />
                            <button type="button" onClick={addSpec} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"><Plus size={20} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.expertise.map((item: string, i: number) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#1E4D8C] text-white rounded-full text-xs font-medium">
                                    {item} <X size={12} className="cursor-pointer hover:text-red-300" onClick={() => removeSpec(i)} />
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Staff Photos {uploading && "(Uploading...)"}
                        </label>

                        <div className="grid grid-cols-4 gap-2">
                            {/* Upload Button */}
                            <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                                <Plus size={20} className="text-gray-400" />
                                <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">Add</span>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>

                            {/* Image Previews */}
                            {formData.images.map((url: string, index: number) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                                    <img src={url} alt="Staff" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({
                                            ...formData,
                                            images: formData.images.filter((_, i) => i !== index)
                                        })}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Row: Gender & Instagram */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                            <select
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instagram</label>
                            <input
                                placeholder="@handle"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                                value={formData.instagramHandle}
                                onChange={e => setFormData({ ...formData, instagramHandle: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Languages Builder (Reusing your tag logic) */}
                    <TagInput
                        label="Languages Spoken"
                        placeholder="English, Hindi..."
                        tags={formData?.languages}
                        setTags={(tags: string[]) => setFormData({ ...formData, languages: tags })}
                    />

                    {/* Certifications (Metadata) */}
                    <TagInput
                        label="Certifications"
                        placeholder="e.g. L'Oreal Certified"
                        tags={formData?.certifications}
                        setTags={(tags: string[]) => setFormData({ ...formData, certifications: tags })}
                    />

                    <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">Experience:</span>
                            <input type="number" className="w-16 p-1 rounded border border-blue-200 text-sm font-bold text-center" value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: Number(e.target.value) })} />
                        </div>
                        <button type="button" onClick={() => setFormData({ ...formData, active: !formData.active })} className={`w-12 h-6 rounded-full relative transition-colors ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#1E4D8C] text-white rounded-xl font-bold shadow-lg disabled:opacity-70">
                        {submitting ? "Processing..." : "Save Staff Member"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase border ${isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
        {isActive ? 'Active' : 'Inactive'}
    </span>
);

const TagInput = ({ label, placeholder, tags, setTags }: any) => {
    const [val, setVal] = useState("");
    const add = () => {
        if (!val.trim() || tags.includes(val.trim())) return;
        setTags([...tags, val.trim()]);
        setVal("");
    };
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
            <div className="flex gap-2">
                <input
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    placeholder={placeholder}
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                />
                <button type="button" onClick={add} className="p-2 bg-blue-50 text-blue-600 rounded-xl">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags?.map((t: string, i: number) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-lg">
                        {t} <X size={10} className="cursor-pointer" onClick={() => setTags(tags.filter((_: any, idx: number) => idx !== i))} />
                    </span>
                ))}
            </div>
        </div>
    );
};
export default StaffManagement;