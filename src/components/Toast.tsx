import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />,
  };

  return (
    <div className="fixed top-16 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] bg-slate-950 border border-emerald-500/30 shadow-2xl rounded-2xl p-3 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200 font-mono">
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-white tracking-tight uppercase">{toast.title}</h4>
        {toast.message && (
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug font-sans">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
