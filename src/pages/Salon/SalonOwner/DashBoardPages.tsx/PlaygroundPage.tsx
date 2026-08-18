import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar, Clock, Plus, X, Globe, User, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, Loader2, Zap, Activity, Users, RefreshCw,
  Phone, IndianRupee, Scissors, UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../../../API/SalonsAPIs/ALLSalonAPI";
import { useSalonApi } from "../../../../API/Salon_Owner_API/SalonOwnerAPI";
import { useNavigate } from "react-router-dom";
import { DashboardLoader } from "../../../../components/ui_components/DashboardLoader";

// ---------- Types ----------
interface StaffMember {
  staff_id: string;
  name: string;
  images?: string[];
  imageUrl?: string;
  role?: string;
  active?: boolean;
}

interface ServiceItem {
  service_id: string;
  serviceName: string;
  name?: string;
  price: number;
  durationMinutes?: number;
  duration?: number;
  imageUrl?: string;
}

interface BookingSlot {
  date: string;
  time: string;
}

interface BookingItem {
  id: string;
  booking_id?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "RESCHEDULED";
  slot: BookingSlot;
  price: number;
  note?: string | null;
  userData?: { username?: string; phone?: string; imageUrl?: string };
  serviceData?: { serviceName?: string; durationMinutes?: number; imageUrl?: string };
  service_id?: string;
  staffData?: { id?: string; staff_id?: string; name?: string; imageUrl?: string };
  staffId?: string;
  metadata?: Record<string, any> | null;
}

// ---------- Helpers ----------
const SLOT_MINUTES = 15;
const OPEN_HOUR = 9;   // 9:00 AM
const CLOSE_HOUR = 21; // 9:00 PM

const getSalonId = (): string | null => {
  const authData = localStorage.getItem("authState");
  const parsed = authData ? JSON.parse(authData) : null;
  return parsed?.user?.user?.salonId || parsed?.user?.salonId || null;
};

const getUserId = (): string => {
  const authData = localStorage.getItem("authState");
  const parsed = authData ? JSON.parse(authData) : null;
  return parsed?.user?.user?.userId || parsed?.user?.userId || parsed?.user?.sub || "";
};

const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDisplayDate = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const shiftDate = (iso: string, days: number): string => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Convert "HH:MM" -> minutes since midnight
const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

const minutesToLabel = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const buildTimeSlots = (): number[] => {
  const slots: number[] = [];
  const start = OPEN_HOUR * 60;
  const end = CLOSE_HOUR * 60;
  for (let m = start; m < end; m += SLOT_MINUTES) slots.push(m);
  return slots;
};

const isWalkIn = (b: BookingItem): boolean => {
  if (b.metadata?.walkIn === true) return true;
  if (typeof b.metadata?.source === "string" && b.metadata.source.toLowerCase() === "walkin") return true;
  return false;
};

// ---------- Component ----------
const PlaygroundPage: React.FC = () => {
  const { t } = useTranslation();
  const { apiRequest } = useApi();
  const { apiSalonRequest, apiSalonPost } = useSalonApi();
  const navigate = useNavigate();

  const [salonId, setSalonId] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  // Walk-in modal state
  const [walkInOpen, setWalkInOpen] = useState(false);
  // Booking detail modal state
  const [detailBooking, setDetailBooking] = useState<BookingItem | null>(null);
  // Online queue drawer state
  const [queueOpen, setQueueOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    customerName: "",
    customerPhone: "",
    serviceId: "",
    staffId: "",
    time: "",
    startNow: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const timeSlots = useMemo(() => buildTimeSlots(), []);
  const nowRef = useRef<number>(timeToMinutes(new Date().toTimeString().slice(0, 5)));
  const [, forceTick] = useState(0);

  // Refresh "now" marker every minute
  useEffect(() => {
    const interval = setInterval(() => {
      nowRef.current = timeToMinutes(new Date().toTimeString().slice(0, 5));
      forceTick((n) => n + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Resolve salonId once
  useEffect(() => {
    const id = getSalonId();
    if (!id || id === "undefined") {
      navigate("/login");
      return;
    }
    setSalonId(id);
  }, [navigate]);

  // Fetch staff + services once (empty deps — apiRequest identity changes per render)
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!salonId || didInitRef.current) return;
    didInitRef.current = true;
    const init = async () => {
      setLoading(true);
      try {
        const [staffRes, svcRes] = await Promise.all([
          apiRequest<StaffMember[]>(`/salons/${salonId}/staff?include_inactive=true`),
          apiRequest<ServiceItem[]>(`/salons/${salonId}/services`),
        ]);
        if (staffRes.data) {
          setStaff(staffRes.data.filter((s: any) => s.active !== false));
        }
        if (svcRes.data) setServices(svcRes.data);
      } catch (e) {
        console.error("Init fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  // Fetch bookings for selected date
  const fetchBookings = useCallback(async () => {
    if (!salonId) return;
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", "100");
      params.append("date", selectedDate);
      const res = await apiSalonRequest<BookingItem[]>(
        `/bookings/salon/${salonId}?${params.toString()}`,
        { headers: { "X-User-Id": getUserId() } }
      );
      if (res.data && Array.isArray(res.data)) {
        // Only keep active bookings (not cancelled)
        setBookings(res.data.filter((b) => b.status !== "CANCELLED"));
      } else {
        setBookings([]);
      }
    } catch (e: any) {
      console.error("Fetch bookings error:", e);
      setBookings([]);
    } finally {
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId, selectedDate]);

  useEffect(() => {
    if (salonId) fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId, selectedDate]);

  // Auto-refresh every 60s when viewing today
  useEffect(() => {
    if (selectedDate !== todayISO()) return;
    const interval = setInterval(() => fetchBookings(), 60000);
    return () => clearInterval(interval);
  }, [selectedDate, fetchBookings]);

  // Map bookings by staffId for grid rendering
  const bookingsByStaff = useMemo(() => {
    const map: Record<string, BookingItem[]> = {};
    for (const b of bookings) {
      const sid = b.staffData?.id || b.staffData?.staff_id || b.staffId;
      if (!sid) continue;
      if (!map[sid]) map[sid] = [];
      map[sid].push(b);
    }
    return map;
  }, [bookings]);

  // Online (non-walk-in) pending bookings queue — confirmed ones are already on the grid
  const onlineQueue = useMemo(() => {
    const now = nowRef.current;
    const isToday = selectedDate === todayISO();
    return bookings
      .filter((b) => !isWalkIn(b) && b.status === "PENDING")
      .sort((a, b) => {
        // For today: past-due pending first (most urgent), then upcoming
        if (isToday) {
          const aMins = timeToMinutes(a.slot.time);
          const bMins = timeToMinutes(b.slot.time);
          const aOverdue = aMins < now;
          const bOverdue = bMins < now;
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          return aMins - bMins;
        }
        return timeToMinutes(a.slot.time) - timeToMinutes(b.slot.time);
      });
  }, [bookings, selectedDate]);

  // Occupancy: staff currently busy (today only)
  const occupancy = useMemo(() => {
    const isToday = selectedDate === todayISO();
    if (!isToday) return { busy: 0, total: staff.length, pct: 0 };
    const now = nowRef.current;
    let busy = 0;
    for (const s of staff) {
      const list = bookingsByStaff[s.staff_id] || [];
      const isBusy = list.some((b) => {
        const start = timeToMinutes(b.slot.time);
        const dur = b.serviceData?.durationMinutes || 30;
        return now >= start && now < start + dur;
      });
      if (isBusy) busy++;
    }
    return { busy, total: staff.length, pct: staff.length ? Math.round((busy / staff.length) * 100) : 0 };
  }, [staff, bookingsByStaff, selectedDate]);

  // Counts
  const counts = useMemo(() => {
    const online = bookings.filter((b) => !isWalkIn(b)).length;
    const walkin = bookings.filter(isWalkIn).length;
    return { online, walkin };
  }, [bookings]);

  // ---------- Walk-in handlers ----------
  const openWalkIn = (prefill?: { staffId?: string; time?: string }) => {
    const now = new Date();
    const nowMinutes = Math.ceil(timeToMinutes(`${now.getHours()}:${now.getMinutes()}`) / SLOT_MINUTES) * SLOT_MINUTES;
    setWalkInForm({
      customerName: "",
      customerPhone: "",
      serviceId: services[0]?.service_id || "",
      staffId: prefill?.staffId || recommendStaff() || staff[0]?.staff_id || "",
      time: prefill?.time || minutesToHHMM(nowMinutes),
      startNow: !prefill?.time,
    });
    setWalkInOpen(true);
  };

  const minutesToHHMM = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Recommend the first staff free at the chosen time
  const recommendStaff = (atMinutes?: number): string | null => {
    const target = atMinutes ?? timeToMinutes(new Date().toTimeString().slice(0, 5));
    for (const s of staff) {
      const list = bookingsByStaff[s.staff_id] || [];
      const conflict = list.some((b) => {
        const start = timeToMinutes(b.slot.time);
        const dur = b.serviceData?.durationMinutes || 30;
        return target >= start && target < start + dur;
      });
      if (!conflict) return s.staff_id;
    }
    return null;
  };

  const handleWalkInSubmit = async () => {
    if (!salonId) return;
    const service = services.find((s) => s.service_id === walkInForm.serviceId);
    if (!service) {
      setToast({ type: "error", message: "Please select a service" });
      return;
    }
    if (!walkInForm.staffId) {
      setToast({ type: "error", message: "Please assign a specialist" });
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        salonId,
        service_id: walkInForm.serviceId,
        staffId: walkInForm.staffId,
        slot: { date: selectedDate, time: walkInForm.time },
        price: service.price,
        status: "CONFIRMED",
        note: walkInForm.customerName ? `Walk-in: ${walkInForm.customerName}` : "Walk-in booking",
        metadata: {
          walkIn: true,
          source: "walkin",
          customerName: walkInForm.customerName || "Walk-in Customer",
          customerPhone: walkInForm.customerPhone || null,
        },
      };
      const res = await apiSalonPost<any>(`/bookings/`, body);
      if (res.error) throw new Error(res.error);
      setToast({ type: "success", message: "Walk-in booking added" });
      setWalkInOpen(false);
      await fetchBookings();
    } catch (e: any) {
      setToast({ type: "error", message: e?.message || "Failed to create walk-in" });
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ---------- Render helpers ----------
  const renderBookingCard = (b: BookingItem, staffId: string) => {
    const start = timeToMinutes(b.slot.time);
    const dur = b.serviceData?.durationMinutes || 30;
    const slotIndex = Math.round((start - OPEN_HOUR * 60) / SLOT_MINUTES);
    const slotSpan = Math.max(1, Math.round(dur / SLOT_MINUTES));
    if (slotIndex < 0) return null;
    const walkin = isWalkIn(b);
    const isActive =
      selectedDate === todayISO() &&
      nowRef.current >= start &&
      nowRef.current < start + dur;

    const accent = walkin ? "#f59e0b" : "#3b82f6"; // orange walk-in, blue online
    const bg = walkin ? "rgba(245, 158, 11, 0.12)" : "rgba(59, 130, 246, 0.12)";
    const border = walkin ? "rgba(245, 158, 11, 0.45)" : "rgba(59, 130, 246, 0.45)";

    return (
      <motion.div
        key={b.id + staffId}
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => { e.stopPropagation(); setDetailBooking(b); }}
        className="absolute left-1 right-1 rounded-lg px-2 py-1 cursor-pointer overflow-hidden z-10"
        style={{
          top: `calc(${slotIndex} * 56px + 2px)`,
          height: `calc(${slotSpan} * 56px - 4px)`,
          background: bg,
          border: `1px solid ${border}`,
          boxShadow: isActive ? `0 0 12px ${accent}66` : "none",
        }}
      >
        <div className="flex items-center gap-1">
          {walkin ? (
            <User size={10} style={{ color: accent, flexShrink: 0 }} />
          ) : (
            <Globe size={10} style={{ color: accent, flexShrink: 0 }} />
          )}
          <span className="text-[10px] font-bold truncate" style={{ color: accent }}>
            {b.serviceData?.serviceName || "Service"}
          </span>
        </div>
        <div className="text-[9px] text-gray-700 truncate mt-0.5">
          {b.userData?.username || (walkin ? "Walk-in" : "Customer")}
        </div>
        <div className="text-[8px] text-gray-500 mt-0.5">
          {b.slot.time} · {dur}m
        </div>
        {isActive && (
          <div
            className="absolute left-0 right-0 h-0.5"
            style={{
              top: `calc(((nowRef.current - ${start}) / ${dur}) * 100%)`,
              background: accent,
              boxShadow: `0 0 8px ${accent}`,
            }}
          />
        )}
      </motion.div>
    );
  };

  const handleSlotClick = (staffId: string, slotMinutes: number) => {
    if (selectedDate !== todayISO()) {
      // Allow scheduling walk-ins for future dates too
    }
    openWalkIn({ staffId, time: minutesToHHMM(slotMinutes) });
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: "var(--soft-ivory)" }}>
        <DashboardLoader isVisible={loading} />
      </div>
    );
  }

  return (
    <div
      className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-500"
      style={{ fontFamily: "Manrope, sans-serif", backgroundColor: "var(--soft-ivory)" }}
    >
      {/* TOAST */}
      {toast && (
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[200] px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 bg-white border-l-4 animate-in slide-in-from-top-4"
          style={{ borderColor: toast.type === "success" ? "#10b981" : "#ef4444" }}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#10b981" }} />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#ef4444" }} />
          )}
          <span className="text-[11px] sm:text-sm font-bold text-gray-800">{toast.message}</span>
        </div>
      )}

      {/* TOP BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4"
        style={{ borderBottom: "1px solid var(--light-greige)" }}>
        <div>
          <h1 className="font-semibold" style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(18px, 4vw, 24px)", color: "var(--deep-charcoal)" }}>
            {t("playground.title") || "Live Floor Control"}
          </h1>
          <p className="typography-label-light" style={{ fontSize: "clamp(12px, 2.5vw, 14px)" }}>
            {t("playground.subtitle") || "Real-time salon operations & walk-in dispatch"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Date navigation */}
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "var(--light-greige)", border: "1px solid var(--ghost-row-line)" }}>
            <button onClick={() => setSelectedDate(shiftDate(selectedDate, -1))} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setSelectedDate(todayISO())}
              className="px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold hover:bg-white/60 transition-colors flex items-center gap-1.5"
            >
              <Calendar size={12} />
              {formatDisplayDate(selectedDate)}
            </button>
            <button onClick={() => setSelectedDate(shiftDate(selectedDate, 1))} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Occupancy badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--ghost-row-line)" }}>
            <Activity size={14} className={occupancy.pct > 75 ? "text-red-500" : occupancy.pct > 40 ? "text-amber-500" : "text-emerald-500"} />
            <span className="text-[10px] sm:text-xs font-bold" style={{ color: "var(--deep-charcoal)" }}>
              {occupancy.busy}/{occupancy.total} Busy · {occupancy.pct}%
            </span>
          </div>

          {/* Online Queue trigger */}
          <button
            onClick={() => setQueueOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:scale-[1.02]"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--ghost-row-line)" }}
            title="Online Bookings Queue"
          >
            <Globe size={14} style={{ color: "#3b82f6" }} />
            <span className="text-[10px] sm:text-xs font-bold" style={{ color: "var(--deep-charcoal)" }}>
              Queue
            </span>
            {onlineQueue.length > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
                {onlineQueue.length}
              </span>
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={fetchBookings}
            disabled={refreshing}
            className="p-2 rounded-xl transition-colors disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--ghost-row-line)" }}
            title="Refresh"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>

          {/* Express Walk-In */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openWalkIn()}
            className="px-3 sm:px-4 py-2 rounded-xl text-white font-bold text-[10px] sm:text-xs flex items-center gap-1.5 shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)",
              boxShadow: "0 4px 20px rgba(212, 175, 55, 0.3)",
            }}
          >
            <Plus size={14} /> <span className="hidden sm:inline">{t("playground.expressWalkIn") || "Express Walk-In"}</span>
            <span className="sm:hidden">Walk-In</span>
          </motion.button>
        </div>
      </div>

      {/* LEGEND + COUNTS */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#10b981" }} />
          <span className="font-semibold text-gray-600">Free</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#3b82f6" }} />
          <span className="font-semibold text-gray-600">Online Booking</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#f59e0b" }} />
          <span className="font-semibold text-gray-600">Walk-in</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ef4444" }} />
          <span className="font-semibold text-gray-600">In Progress</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="font-bold" style={{ color: "#3b82f6" }}>
            <Globe size={11} className="inline mr-1" />{counts.online} Online
          </span>
          <span className="font-bold" style={{ color: "#f59e0b" }}>
            <User size={11} className="inline mr-1" />{counts.walkin} Walk-ins
          </span>
        </div>
      </div>

      {/* MAIN LAYOUT — full-width grid */}
      <div>
        {/* MAIN PANEL: Scheduling Grid */}
        <main className="flex-1 min-w-0 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--ghost-row-line)" }}>
          {staff.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Users size={32} className="mx-auto mb-2" />
              <p className="text-sm">{t("playground.noStaff") || "No active staff found. Add staff to use the live floor."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Header row: time column + staff columns */}
                <div className="flex sticky top-0 z-20" style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid var(--ghost-row-line)" }}>
                  <div className="w-16 sm:w-20 flex-shrink-0 p-2 text-[10px] sm:text-xs font-bold text-gray-500 text-right pr-3">
                    <Clock size={12} className="inline mr-1" />
                  </div>
                  {staff.map((s) => {
                    const list = bookingsByStaff[s.staff_id] || [];
                    const isBusyNow =
                      selectedDate === todayISO() &&
                      list.some((b) => {
                        const start = timeToMinutes(b.slot.time);
                        const dur = b.serviceData?.durationMinutes || 30;
                        return nowRef.current >= start && nowRef.current < start + dur;
                      });
                    return (
                      <div key={s.staff_id} className="flex-1 min-w-[120px] p-2 text-center border-l" style={{ borderColor: "var(--ghost-row-line)" }}>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: isBusyNow ? "#ef4444" : "#10b981" }} />
                          <span className="text-[11px] sm:text-xs font-bold truncate" style={{ color: "var(--deep-charcoal)" }}>
                            {s.name}
                          </span>
                        </div>
                        <div className="text-[9px] text-gray-400 mt-0.5">
                          {isBusyNow ? "Busy" : "Free"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grid body */}
                <div className="flex relative">
                  {/* Time column */}
                  <div className="w-16 sm:w-20 flex-shrink-0">
                    {timeSlots.map((mins) => (
                      <div key={mins} className="h-14 border-b text-right pr-3 pt-1 text-[9px] sm:text-[10px] text-gray-400 font-semibold"
                        style={{ borderColor: "var(--ghost-row-line)" }}>
                        {minutesToLabel(mins)}
                      </div>
                    ))}
                  </div>

                  {/* Staff columns */}
                  {staff.map((s) => {
                    const list = bookingsByStaff[s.staff_id] || [];
                    return (
                      <div key={s.staff_id} className="flex-1 min-w-[120px] relative border-l" style={{ borderColor: "var(--ghost-row-line)" }}>
                        {timeSlots.map((mins) => (
                          <div
                            key={mins}
                            onClick={() => handleSlotClick(s.staff_id, mins)}
                            className="h-14 border-b cursor-pointer hover:bg-amber-50/40 transition-colors"
                            style={{ borderColor: "var(--ghost-row-line)" }}
                          />
                        ))}
                        {list.map((b) => renderBookingCard(b, s.staff_id))}
                      </div>
                    );
                  })}

                  {/* Current time line (today only) */}
                  {selectedDate === todayISO() && nowRef.current >= OPEN_HOUR * 60 && nowRef.current < CLOSE_HOUR * 60 && (
                    <div
                      className="absolute left-16 sm:left-20 right-0 z-30 pointer-events-none"
                      style={{
                        top: `calc(${Math.round((nowRef.current - OPEN_HOUR * 60) / SLOT_MINUTES)} * 56px + 28px)`,
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" style={{ boxShadow: "0 0 6px #ef4444" }} />
                        <div className="h-0.5 flex-1 bg-red-500" style={{ boxShadow: "0 0 6px #ef4444" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* WALK-IN MODAL */}
      <AnimatePresence>
        {walkInOpen && (
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" style={{ backdropFilter: "blur(8px)" }}
            onClick={() => setWalkInOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
              style={{ boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl" style={{ background: "rgba(245,158,11,0.12)" }}>
                    <Zap size={18} style={{ color: "#f59e0b" }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--deep-charcoal)" }}>
                    {t("playground.expressWalkIn") || "Express Walk-In"}
                  </h3>
                </div>
                <button onClick={() => setWalkInOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Customer name */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Customer Name</label>
                  <input
                    type="text"
                    value={walkInForm.customerName}
                    onChange={(e) => setWalkInForm({ ...walkInForm, customerName: e.target.value })}
                    placeholder="Walk-in customer (optional)"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
                    style={{ borderColor: "var(--ghost-row-line)" }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Phone (optional)</label>
                  <input
                    type="tel"
                    value={walkInForm.customerPhone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, customerPhone: e.target.value })}
                    placeholder="+91..."
                    className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
                    style={{ borderColor: "var(--ghost-row-line)" }}
                  />
                </div>

                {/* Service */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Service</label>
                  <select
                    value={walkInForm.serviceId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, serviceId: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm border outline-none focus:border-amber-400 bg-white"
                    style={{ borderColor: "var(--ghost-row-line)" }}
                  >
                    {services.map((s) => (
                      <option key={s.service_id} value={s.service_id}>
                        {s.serviceName || s.name} — ₹{s.price} ({s.durationMinutes || s.duration || 30}m)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialist */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Assign Specialist</label>
                  <select
                    value={walkInForm.staffId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, staffId: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm border outline-none focus:border-amber-400 bg-white"
                    style={{ borderColor: "var(--ghost-row-line)" }}
                  >
                    {staff.map((s) => (
                      <option key={s.staff_id} value={s.staff_id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Time + start now */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Time</label>
                    <input
                      type="time"
                      value={walkInForm.time}
                      onChange={(e) => setWalkInForm({ ...walkInForm, time: e.target.value, startNow: false })}
                      className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm border outline-none focus:border-amber-400"
                      style={{ borderColor: "var(--ghost-row-line)" }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const now = new Date();
                      const m = Math.ceil(timeToMinutes(`${now.getHours()}:${now.getMinutes()}`) / SLOT_MINUTES) * SLOT_MINUTES;
                      setWalkInForm({ ...walkInForm, time: minutesToHHMM(m), startNow: true });
                    }}
                    className="mt-5 px-3 py-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5"
                    style={{ background: walkInForm.startNow ? "rgba(245,158,11,0.15)" : "var(--light-greige)", color: walkInForm.startNow ? "#f59e0b" : "#666" }}
                  >
                    <Zap size={12} /> Now
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setWalkInOpen(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  {t("common.cancel") || "Cancel"}
                </button>
                <button
                  onClick={handleWalkInSubmit}
                  disabled={submitting || !walkInForm.serviceId || !walkInForm.staffId}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {t("playground.confirmStart") || "Confirm & Start"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ONLINE QUEUE POPUP */}
      <AnimatePresence>
        {queueOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(8px)" }}
            onClick={() => setQueueOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden"
              style={{ boxShadow: "rgba(0,0,0,0.15) 0 8px 32px", maxHeight: "80vh" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--ghost-row-line)" }}>
                <div className="flex items-center gap-2">
                  <Globe size={16} style={{ color: "#3b82f6" }} />
                  <h3 className="text-sm font-bold" style={{ color: "var(--deep-charcoal)" }}>
                    {t("playground.onlineQueue") || "Online Bookings Queue"}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
                    {onlineQueue.length}
                  </span>
                </div>
                <button
                  onClick={() => setQueueOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {onlineQueue.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic py-8 text-center">
                    {t("playground.noUpcoming") || "No pending online bookings"}
                  </p>
                ) : (
                  onlineQueue.map((b) => {
                    const staffName = b.staffData?.name || "Unassigned";
                    const isOverdue = selectedDate === todayISO() && timeToMinutes(b.slot.time) < nowRef.current;
                    return (
                      <div
                        key={b.id}
                        onClick={() => { setDetailBooking(b); setQueueOpen(false); }}
                        className="p-3 rounded-xl text-[11px] cursor-pointer hover:scale-[1.02] transition-transform"
                        style={{
                          background: isOverdue ? "rgba(239,68,68,0.08)" : "rgba(59,130,246,0.06)",
                          border: isOverdue ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(59,130,246,0.15)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold" style={{ color: isOverdue ? "#ef4444" : "#3b82f6" }}>
                            {b.slot.time}{isOverdue && " · overdue"}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                            {b.status}
                          </span>
                        </div>
                        <div className="font-semibold text-gray-800 truncate">{b.serviceData?.serviceName || "Service"}</div>
                        <div className="text-gray-500 truncate">{b.userData?.username || "Customer"} · {staffName}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOOKING DETAIL MODAL */}
      <AnimatePresence>
        {detailBooking && (
          <div
            className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(8px)" }}
            onClick={() => setDetailBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{ boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}
            >
              {/* Header with close button */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{
                  background: isWalkIn(detailBooking)
                    ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                    : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                }}
              >
                <div className="flex items-center gap-2 text-white">
                  {isWalkIn(detailBooking) ? <User size={18} /> : <Globe size={18} />}
                  <h3 className="text-base font-bold">
                    {isWalkIn(detailBooking) ? "Walk-in Booking" : "Online Booking"}
                  </h3>
                </div>
                <button
                  onClick={() => setDetailBooking(null)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background:
                        detailBooking.status === "CONFIRMED"
                          ? "rgba(16,185,129,0.15)"
                          : detailBooking.status === "PENDING"
                          ? "rgba(245,158,11,0.15)"
                          : detailBooking.status === "COMPLETED"
                          ? "rgba(59,130,246,0.15)"
                          : "rgba(107,114,128,0.15)",
                      color:
                        detailBooking.status === "CONFIRMED"
                          ? "#10b981"
                          : detailBooking.status === "PENDING"
                          ? "#f59e0b"
                          : detailBooking.status === "COMPLETED"
                          ? "#3b82f6"
                          : "#6b7280",
                    }}
                  >
                    {detailBooking.status}
                  </span>
                  {detailBooking.booking_id && (
                    <span className="text-[10px] font-mono text-gray-400">
                      #{detailBooking.booking_id}
                    </span>
                  )}
                </div>

                {/* Service */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl" style={{ background: "var(--light-greige)" }}>
                    <Scissors size={16} style={{ color: "var(--deep-charcoal)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Service</p>
                    <p className="text-sm font-bold" style={{ color: "var(--deep-charcoal)" }}>
                      {detailBooking.serviceData?.serviceName || "—"}
                    </p>
                    {detailBooking.serviceData?.durationMinutes && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {detailBooking.serviceData.durationMinutes} min
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl" style={{ background: "var(--light-greige)" }}>
                    <Calendar size={16} style={{ color: "var(--deep-charcoal)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">When</p>
                    <p className="text-sm font-bold" style={{ color: "var(--deep-charcoal)" }}>
                      {formatDisplayDate(detailBooking.slot.date)} · {detailBooking.slot.time}
                    </p>
                  </div>
                </div>

                {/* Specialist */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl" style={{ background: "var(--light-greige)" }}>
                    <UserCheck size={16} style={{ color: "var(--deep-charcoal)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Specialist</p>
                    <p className="text-sm font-bold" style={{ color: "var(--deep-charcoal)" }}>
                      {detailBooking.staffData?.name || "Unassigned"}
                    </p>
                  </div>
                </div>

                {/* Customer */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl" style={{ background: "var(--light-greige)" }}>
                    <User size={16} style={{ color: "var(--deep-charcoal)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Customer</p>
                    <p className="text-sm font-bold" style={{ color: "var(--deep-charcoal)" }}>
                      {detailBooking.userData?.username ||
                        detailBooking.metadata?.customerName ||
                        "Walk-in Customer"}
                    </p>
                    {(detailBooking.userData?.phone || detailBooking.metadata?.customerPhone) && (
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <Phone size={10} />
                        {detailBooking.userData?.phone || detailBooking.metadata?.customerPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl" style={{ background: "var(--light-greige)" }}>
                    <IndianRupee size={16} style={{ color: "var(--deep-charcoal)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Price</p>
                    <p className="text-sm font-bold" style={{ color: "var(--deep-charcoal)" }}>
                      ₹{detailBooking.price}
                    </p>
                  </div>
                </div>

                {/* Note */}
                {detailBooking.note && (
                  <div className="p-3 rounded-xl text-[11px] text-gray-600" style={{ background: "var(--light-greige)" }}>
                    <span className="font-bold text-gray-500">Note: </span>
                    {detailBooking.note}
                  </div>
                )}
              </div>

              {/* Footer with close button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setDetailBooking(null)}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: "var(--deep-charcoal)" }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaygroundPage;
