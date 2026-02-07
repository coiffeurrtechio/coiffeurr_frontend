import React, { useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Clock,
    User,
    MoreVertical
} from 'lucide-react';

interface StaffMember {
    id: string;
    name: string;
    role: string;
    operation: string;
    timing: string;
    price: string;
    status: 'Active' | 'On Leave' | 'Inactive';
    avatar: string;
}

const StaffManagement: React.FC = () => {
    const [staffList] = useState<StaffMember[]>([
        { id: '1', name: 'Rahul Sharma', role: 'Senior Stylist', operation: 'Haircut', timing: '30 min', price: '₹299', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=rahul' },
        { id: '2', name: 'Priya Verma', role: 'Beautician', operation: 'Beard Trim', timing: '15 min', price: '₹159', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=priya' },
        { id: '3', name: 'Aman Varma', role: 'Stylist', operation: 'Facial', timing: '45 min', price: '₹499', status: 'Inactive', avatar: 'https://i.pravatar.cc/150?u=aman' }
    ]);

    const [activeTab, setActiveTab] = useState('All Services');

    return (
        <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">

            {/* 1. RESPONSIVE NAVIGATION TABS */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                {/* 1. TABS: Scrollable on mobile, fixed on desktop */}
                <div className="flex items-center gap-2 md:gap-4 bg-white p-1 md:p-2 rounded-xl border border-gray-100 shadow-sm w-full md:w-fit overflow-x-auto no-scrollbar">
                    {['All Services', 'Attendance', 'Schedules'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-[#1E4D8C] text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 active:scale-95'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 2. ADD STAFF BUTTON: Primary action style */}
                <button
                    onClick={() => { /* Open Modal or Navigate */ }}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1E4D8C] text-white rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-[#153a6b] transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add Staff</span>
                </button>
            </div>



            {/* 2. MAIN CONTAINER */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* HEADER & SEARCH */}
                <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Manage Staff</h2>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>
                </div>

                {/* 3. TABLE VIEW (Hidden on Mobile) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr className="text-[11px] uppercase text-gray-400 font-bold tracking-widest">
                                <th className="px-6 py-4">Staff Member</th>
                                <th className="px-6 py-4">Operation</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staffList.map((staff) => (
                                <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5 flex items-center gap-3">
                                        <img src={staff.avatar} className="w-10 h-10 rounded-full border border-gray-100" alt="" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{staff.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">{staff.role}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-gray-700">{staff.operation}</p>
                                        <p className="text-xs text-blue-600 font-semibold">{staff.price} • {staff.timing}</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <StatusBadge status={staff.status} />
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <ActionButtons />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. MOBILE CARD VIEW (Hidden on Desktop) */}
                <div className="md:hidden divide-y divide-gray-50">
                    {staffList.map((staff) => (
                        <div key={staff.id} className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={staff.avatar} className="w-12 h-12 rounded-full" alt="" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{staff.name}</p>
                                        <p className="text-xs text-gray-400">{staff.role}</p>
                                    </div>
                                </div>
                                <StatusBadge status={staff.status} />
                            </div>

                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Service</p>
                                    <p className="text-sm font-bold text-gray-800">{staff.operation}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-medium">Price/Time</p>
                                    <p className="text-sm font-bold text-blue-600">{staff.price} <span className="text-gray-400 font-normal">({staff.timing})</span></p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-500 bg-red-50 rounded-lg text-xs font-bold">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* --- SHARED SUB-COMPONENTS --- */

const StatusBadge = ({ status }: { status: string }) => (
    <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${status === 'Active'
        ? 'bg-green-50 text-green-600 border border-green-100'
        : 'bg-orange-50 text-orange-600 border border-orange-100'
        }`}>
        {status}
    </span>
);

const ActionButtons = () => (
    <div className="flex justify-end gap-2">
        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <Edit2 size={16} />
        </button>
        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 size={16} />
        </button>
    </div>
);

export default StaffManagement;