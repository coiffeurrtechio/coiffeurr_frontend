import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { X, CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration (default 4 seconds)
    const duration = toast.duration || 4000
    setTimeout(() => {
      hideToast(id)
    }, duration)
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context
}

function ToastContainer({ toasts, onHide }: { toasts: Toast[]; onHide: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-sm w-full p-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onHide }: { toast: Toast; onHide: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  useEffect(() => {
    const duration = toast.duration || 4000
    const interval = 50
    const step = 100 / (duration / interval)
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [toast.duration])

  const handleHide = () => {
    setIsVisible(false)
    setTimeout(() => onHide(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-6 h-6" />
      case "error":
        return <XCircle className="w-6 h-6" />
      case "warning":
        return <AlertCircle className="w-6 h-6" />
      case "info":
        return <Info className="w-6 h-6" />
    }
  }

  const getGradient = () => {
    switch (toast.type) {
      case "success":
        return "from-emerald-500/20 to-emerald-600/20 border-emerald-500/50"
      case "error":
        return "from-red-500/20 to-red-600/20 border-red-500/50"
      case "warning":
        return "from-amber-500/20 to-amber-600/20 border-amber-500/50"
      case "info":
        return "from-blue-500/20 to-blue-600/20 border-blue-500/50"
    }
  }

  const getIconColor = () => {
    switch (toast.type) {
      case "success":
        return "text-emerald-400"
      case "error":
        return "text-red-400"
      case "warning":
        return "text-amber-400"
      case "info":
        return "text-blue-400"
    }
  }

  const getTextColor = () => {
    switch (toast.type) {
      case "success":
        return "text-emerald-300"
      case "error":
        return "text-red-300"
      case "warning":
        return "text-amber-300"
      case "info":
        return "text-blue-300"
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-500 ease-out
        ${isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"}
        relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl
        bg-gradient-to-br ${getGradient()} border
        p-5 min-w-[320px]
      `}
    >
      {/* Progress bar */}
      <div 
        className="absolute top-0 left-0 h-1 bg-current opacity-50 transition-all duration-50 ease-linear"
        style={{ 
          width: `${progress}%`,
          color: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
        }}
      />

      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 mt-0.5 ${getIconColor()} animate-pulse`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-base font-bold ${getTextColor} mb-1`}>{toast.title}</h4>
          {toast.message && <p className="text-sm text-white/80 leading-relaxed">{toast.message}</p>}
        </div>
        <button
          onClick={handleHide}
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors hover:rotate-90 transform duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Subtle glow effect */}
      <div 
        className={`absolute inset-0 rounded-2xl pointer-events-none opacity-30 blur-xl -z-10 bg-gradient-to-br ${getGradient()}`}
      />
    </div>
  )
}
