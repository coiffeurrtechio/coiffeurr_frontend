import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Scissors, Check, MoreHorizontal, Save, Download, Mail, Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, Search, Filter, RefreshCw, UserCheck, ImageIcon, Briefcase, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { useApi } from "../../../../API/SalonsAPIs/ALLSalonAPI";
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
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [staffReviews, setStaffReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "Hair Stylist",
        gender: "Male",
        languages: [] as string[],
        expertise: [] as string[],
        instagramHandle: "",
        facebookHandle: "",
        otherLinks: "",
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
            setShowSuccessPopup(true);
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
            facebookHandle: staff.facebookHandle || "",
            otherLinks: staff.otherLinks || "",
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
            setShowSuccessPopup(true);
        } finally { setSubmitting(false); }
    };

    // Auto-hide success popup after 3 seconds
    useEffect(() => {
        if (showSuccessPopup) {
            const timer = setTimeout(() => {
                setShowSuccessPopup(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessPopup]);

    const resetForm = () => {
        setFormData({
            name: "", email: "", phone: "", role: "Hair Stylist",
            gender: "Male", languages: [], expertise: [],
            instagramHandle: "", facebookHandle: "", otherLinks: "", experienceYears: "", active: true,
            certifications: [], specializations: [], images: [], services: []
        });
        setEditingStaffId(null);
    };

    const handleViewReviews = async (staff: any) => {
        setSelectedStaff(staff);
        setIsReviewsModalOpen(true);
        setLoadingReviews(true);
        try {
            const res = await apiRequest<any>(`/reviews/reviews/STAFF/${staff.staff_id}?page=1&limit=20`);
            if (res.data) setStaffReviews(res.data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setStaffReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };

    return (
        <div className="min-h-screen p-6 animate-in fade-in duration-500" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--soft-ivory)' }}>
            <DashboardLoader isVisible={loading || submitting} />

            {/* Main Stage Container */}
            <div className="main-stage p-6 space-y-6">
                {/* Fixed Header Strip */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4" style={{ borderBottom: '1px solid var(--light-greige)' }}>
                    <div>
                        <h1 className="font-semibold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: 'var(--deep-charcoal)' }}>Team Members</h1>
                        <p className="typography-label-light" style={{ fontSize: '14px' }}>Manage your salon staff and their services</p>
                    </div>
                    <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 text-white rounded-2xl text-sm font-semibold transition-all duration-300" style={{ backgroundColor: 'var(--muted-gold)', height: '44px' }}>
                    <Plus size={18} /> {t('staff.addStaff')}
                </button>
            </div>

                {/* Search Bar - Integrated in Header Strip */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: '#666' }} />
                    <input 
                        type="text" 
                        placeholder={t('staff.searchStaff')} 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full pl-12 pr-4 rounded-2xl text-sm outline-none transition-all typography-label-light" 
                        style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
                    />
                </div>
            </div>

            {/* Staff Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-500 delay-200 mt-6">
                {staffList.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((staff) => (
                    <div 
                        key={staff.staff_id} 
                        className="floating-tile overflow-hidden hover-lift"
                    >
                        {/* Card Header with Image */}
                        <div className="relative h-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--muted-gold) 0%, var(--deep-charcoal) 100%)' }}>
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBIMHY0MHptMjAgMjBWMjBIMHYyMGgyMHptMjAgMjBWMjBIMHYyMGgyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
                            <div className="absolute bottom-3 left-4">
                                <div className="w-24 h-24 rounded-xl bg-white shadow-lg overflow-hidden border-3 border-white">
                                    {staff.images?.[0] ? 
                                        <img src={staff.images[0]} className="w-full h-full object-cover" alt={staff.name} /> : 
                                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--light-greige)' }}>
                                            <User size={40} style={{ color: '#666' }} />
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="absolute top-3 right-3">
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border-2 ${
                                    staff.active 
                                        ? 'text-white' 
                                        : 'text-gray-600 bg-white'
                                }`} style={staff.active ? { backgroundColor: 'var(--sage-green)', borderColor: 'var(--sage-green)' } : { borderColor: 'var(--light-greige)' }}>
                                    {staff.active ? t('staff.active') : t('staff.inactive')}
                                </span>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="pt-10 pb-4 px-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="typography-label" style={{ fontSize: '16px', color: 'var(--deep-charcoal)' }}>{staff.name}</h3>
                                    <p className="typography-label-light" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>{staff.role}</p>
                                </div>
                                {/* Experience & Rating on right */}
                                <div className="flex flex-col gap-1 items-end">
                                    {staff.experienceYears && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--light-greige)' }}>
                                                <Briefcase size={8} style={{ color: 'var(--muted-gold)' }} />
                                            </div>
                                            <span className="typography-label-light font-semibold" style={{ fontSize: '11px' }}>{staff.experienceYears}y</span>
                                        </div>
                                    )}
                                    {staff.rating?.average && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--light-greige)' }}>
                                                <span style={{ fontSize: '7px', color: 'var(--muted-gold)' }}>★</span>
                                            </div>
                                            <span className="typography-label-light font-semibold" style={{ fontSize: '11px' }}>{staff.rating.average.toFixed(1)}</span>
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
                                            <span key={serviceId} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border typography-label-light" style={{ backgroundColor: 'var(--light-greige)', color: 'var(--deep-charcoal)', borderColor: 'var(--light-greige)' }}>
                                                {service.serviceName}
                                            </span>
                                        ) : null;
                                    }) : <span className="typography-label-light italic w-full text-center" style={{ fontSize: '9px' }}>{t('staff.noServicesLinked')}</span>}
                                </div>
                            </div>

                            {/* Contact Info Row */}
                            <div className="flex flex-wrap gap-2 mb-3 typography-label-light" style={{ fontSize: '9px' }}>
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
                                {staff.facebookHandle && (
                                    <a 
                                        href={`https://facebook.com/${staff.facebookHandle.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 truncate max-w-[120px] text-blue-600 hover:text-blue-700"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                                        </svg>
                                        {staff.facebookHandle}
                                    </a>
                                )}
                                {staff.otherLinks && (
                                    <a 
                                        href={staff.otherLinks}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 truncate max-w-[120px] text-blue-600 hover:text-blue-700"
                                    >
                                        🔗 {staff.otherLinks}
                                    </a>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleViewReviews(staff)}
                                    className="flex-1 py-2 px-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-amber-50 hover:to-yellow-50 text-gray-700 hover:text-amber-700 rounded-lg text-[10px] font-semibold border border-gray-200 hover:border-amber-200 transition-all duration-300 flex items-center justify-center gap-1.5"
                                >
                                    <MessageSquare size={12} />
                                    Reviews
                                </button>
                                <button 
                                    onClick={() => handleEditClick(staff)}
                                    className="flex-1 py-2 px-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-blue-700 rounded-lg text-[10px] font-semibold border border-gray-200 hover:border-blue-200 transition-all duration-300 flex items-center justify-center gap-1.5"
                                >
                                    <Edit2 size={12} />
                                    Edit
                                </button>
                            </div>
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

            {/* Reviews Modal */}
            {isReviewsModalOpen && selectedStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300" style={{
                        borderRadius: '20px',
                        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)',
                        background: '#FFFFFF',
                        border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}>
                        {/* Modal Header */}
                        <div className="p-8 pb-6" style={{ 
                            background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%)',
                            borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
                        }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    {selectedStaff.images?.[0] ? (
                                        <div className="relative">
                                            <img src={selectedStaff.images[0]} className="w-20 h-20 rounded-2xl object-cover" alt={selectedStaff.name} style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }} />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D4AF37', boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)' }}>
                                                <Star size={12} fill="white" style={{ color: 'white' }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative" style={{ backgroundColor: 'var(--light-greige)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}>
                                            <User size={36} style={{ color: '#999' }} />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D4AF37', boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)' }}>
                                                <Star size={12} fill="white" style={{ color: 'white' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--deep-charcoal)', letterSpacing: '-0.02em' }}>{selectedStaff.name}</h3>
                                        <p className="text-sm font-medium mb-2" style={{ color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px' }}>{selectedStaff.role}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                                                <Star size={14} fill="#D4AF37" style={{ color: '#D4AF37' }} />
                                                <span className="text-sm font-bold" style={{ color: '#D4AF37' }}>{selectedStaff.rating?.average?.toFixed(1) || 'N/A'}</span>
                                            </div>
                                            <span className="text-xs font-medium" style={{ color: '#999' }}>{staffReviews.length} review{staffReviews.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsReviewsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200" style={{ backgroundColor: 'transparent' }}>
                                    <X size={22} style={{ color: '#666' }} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 max-h-[55vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E8E4DE transparent' }}>
                            {loadingReviews ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
                                        <p className="text-sm font-medium" style={{ color: '#666' }}>Loading reviews...</p>
                                    </div>
                                </div>
                            ) : staffReviews.length > 0 ? (
                                <div className="space-y-5">
                                    {staffReviews.map((review, index) => (
                                        <div key={index} className="p-5 rounded-2xl transition-all duration-300 hover:shadow-lg" style={{ 
                                            backgroundColor: '#FAFAFA',
                                            border: '1px solid #E8E4DE',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                                        }}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold" style={{ 
                                                        backgroundColor: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
                                                        color: 'white',
                                                        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                                                    }}>
                                                        {review.userName?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-base mb-0.5" style={{ color: 'var(--deep-charcoal)', fontFamily: 'Playfair Display, serif' }}>{review.userName || 'Customer'}</p>
                                                        <p className="text-xs font-medium" style={{ color: '#999', letterSpacing: '0.05em' }}>
                                                            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} size={14} className={star <= review.rating ? "fill-[#D4AF37]" : "text-gray-200"} style={{ color: star <= review.rating ? '#D4AF37' : '#E5E7EB' }} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-base leading-relaxed italic" style={{ color: '#333', fontFamily: 'Georgia, serif', lineHeight: '1.7' }}>"{review.reviewText}"</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                                        <MessageSquare size={36} style={{ color: '#D4AF37' }} />
                                    </div>
                                    <p className="text-base font-medium mb-2" style={{ color: '#666', fontFamily: 'Playfair Display, serif' }}>No reviews yet</p>
                                    <p className="text-sm" style={{ color: '#999' }}>Be the first to share your experience</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Popup */}
            <AnimatePresence>
                {showSuccessPopup && (
                    <div className="fixed inset-0 flex items-center justify-center z-[200] animate-in fade-in duration-300">
                        <motion.div
                            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl px-8 py-6 border border-white/40 flex items-center gap-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: '#D4AF37' }}
                            >
                                <Check size={24} className="text-white" />
                            </motion.div>
                            <div>
                                <p className="text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>Staff Updated</p>
                                <p className="text-xs font-semibold text-gray-500">Changes saved successfully</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/60 backdrop-blur-sm">
            <motion.div 
                className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-r from-gray-50/80 to-white/80">
                    <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>{title}</h3>
                    <motion.button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100/50 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <X size={20} />
                    </motion.button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Photos Upload */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{t('staff.staffPhotos')} {uploading && t('staff.uploading')}</label>
                        <div className="grid grid-cols-4 gap-2">
                            <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all bg-white/60 backdrop-blur-sm">
                                <Plus size={20} className="text-gray-400" />
                                <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                            {formData.images.map((url: string, index: number) => (
                                <motion.div 
                                    key={index} 
                                    className="relative aspect-square rounded-2xl overflow-hidden group bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <img src={url} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setFormData({ ...formData, images: formData.images.filter((_: any, i: number) => i !== index) })} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.fullName')}</label>
                            <input required className="w-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.role')}</label>
                            <input required className="w-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                        </div>
                    </div>

                    {/* --- NEW: SERVICE SELECTION GRID --- */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Scissors size={12}/> {t('staff.assignedServices')}
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                            {allServices.map((service) => {
                                const isSelected = formData.services.includes(service.service_id);
                                return (
                                    <motion.div
                                        key={service.service_id}
                                        onClick={() => toggleService(service.service_id)}
                                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all shadow-sm ${isSelected ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 ring-1 ring-[#D4AF37]/20' : 'bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80'}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-white shadow-sm">
                                            {service.imageUrl && <img src={service.imageUrl} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[10px] font-bold truncate ${isSelected ? 'text-[#D4AF37]' : 'text-gray-600'}`}>{service.serviceName}</p>
                                            <p className="text-[8px] text-gray-400">₹{service.price}</p>
                                        </div>
                                        {isSelected && <Check size={12} className="ml-auto text-[#D4AF37]" />}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.email')}</label>
                            <input type="email" required className="w-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('staff.phone')}</label>
                            <input required className="w-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instagram Handle</label>
                        <input className="w-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" placeholder="@username" value={formData.instagramHandle} onChange={e => setFormData({ ...formData, instagramHandle: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Facebook Handle</label>
                        <input className="w-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" placeholder="@username" value={formData.facebookHandle} onChange={e => setFormData({ ...formData, facebookHandle: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Other Links</label>
                        <input className="w-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" placeholder="https://..." value={formData.otherLinks} onChange={e => setFormData({ ...formData, otherLinks: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                            <select className="w-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
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
                                className="w-full px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm"
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
                            <input className="flex-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" placeholder="Hit Enter to add" value={newSpec} onChange={e => setNewSpec(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec())} />
                            <motion.button 
                                type="button" 
                                onClick={addSpec} 
                                className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/20 transition-all shadow-sm text-xs font-bold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Add
                            </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.expertise.map((item: string, i: number) => (
                                <motion.span 
                                    key={i} 
                                    className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-full text-[10px] font-bold shadow-sm"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item} <X size={10} className="cursor-pointer hover:text-white/70 transition-colors" onClick={() => setFormData({...formData, expertise: formData.expertise.filter((_, idx) => idx !== i)})} />
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Languages</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" placeholder="Hit Enter to add" value={newLang} onChange={e => setNewLang(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLang())} />
                            <motion.button 
                                type="button" 
                                onClick={addLang} 
                                className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/20 transition-all shadow-sm text-xs font-bold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Add
                            </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.languages.map((item: string, i: number) => (
                                <motion.span 
                                    key={i} 
                                    className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-full text-[10px] font-bold shadow-sm"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item} <X size={10} className="cursor-pointer hover:text-white/70 transition-colors" onClick={() => setFormData({...formData, languages: formData.languages.filter((_, idx) => idx !== i)})} />
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Certifications</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" placeholder="Hit Enter to add" value={newCert} onChange={e => setNewCert(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())} />
                            <motion.button 
                                type="button" 
                                onClick={addCert} 
                                className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/20 transition-all shadow-sm text-xs font-bold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Add
                            </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.certifications.map((item: string, i: number) => (
                                <motion.span 
                                    key={i} 
                                    className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-full text-[10px] font-bold shadow-sm"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item} <X size={10} className="cursor-pointer hover:text-white/70 transition-colors" onClick={() => setFormData({...formData, certifications: formData.certifications.filter((_, idx) => idx !== i)})} />
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Specializations</label>
                        <div className="flex gap-2">
                            <input className="flex-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all shadow-sm" placeholder="Hit Enter to add" value={newSpec2} onChange={e => setNewSpec2(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec2())} />
                            <motion.button 
                                type="button" 
                                onClick={addSpec2} 
                                className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/20 transition-all shadow-sm text-xs font-bold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Add
                            </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.specializations.map((item: string, i: number) => (
                                <motion.span 
                                    key={i} 
                                    className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-full text-[10px] font-bold shadow-sm"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item} <X size={10} className="cursor-pointer hover:text-white/70 transition-colors" onClick={() => setFormData({...formData, specializations: formData.specializations.filter((_, idx) => idx !== i)})} />
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 shadow-sm">
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Active Status</span>
                        <motion.button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, active: !formData.active })} 
                            className={`w-12 h-6 rounded-full relative transition-colors shadow-sm ${formData.active ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.active ? 'left-7' : 'left-1'}`} />
                        </motion.button>
                    </div>

                    <motion.button 
                        type="submit" 
                        disabled={submitting} 
                        className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl font-bold shadow-lg shadow-[#D4AF37]/20 disabled:opacity-70 transition-all"
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 30px -10px rgba(212, 175, 55, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {submitting ? t('staff.processing') : t('staff.saveStaff')}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default StaffManagement;