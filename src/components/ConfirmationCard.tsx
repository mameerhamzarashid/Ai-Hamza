import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { ConfirmationData } from '../types';

interface ConfirmationCardProps {
  confirmation: ConfirmationData;
  onConfirm: () => void;
  onCancel: () => void;
  completed?: boolean;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  confirmation,
  onConfirm,
  onCancel,
  completed = false,
}) => {
  const [resolved, setResolved] = useState<boolean>(completed);
  const [status, setStatus] = useState<'confirmed' | 'cancelled' | null>(completed ? 'confirmed' : null);

  const handleActionConfirm = () => {
    setResolved(true);
    setStatus('confirmed');
    onConfirm();
  };

  const handleActionCancel = () => {
    setResolved(true);
    setStatus('cancelled');
    onCancel();
  };

  return (
    <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-3.5 space-y-2.5 text-left shadow-lg font-sans">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800 font-mono">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
          <ShieldAlert className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
          [CONFIRMATION_REQUIRED]
        </span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-white font-mono">{confirmation.actionTitle}</h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{confirmation.actionDescription}</p>
      </div>

      {resolved ? (
        <div className={`p-2 rounded-xl text-xs font-mono flex items-center gap-2 ${
          status === 'confirmed' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          {status === 'confirmed' ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>[ACTION_EXECUTED] Confirmed by User.</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>[ACTION_CANCELLED] Cancelled by User.</span>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1 font-mono">
          <button
            onClick={handleActionConfirm}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRM & EXECUTE
          </button>
          <button
            onClick={handleActionCancel}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors"
          >
            CANCEL
          </button>
        </div>
      )}
    </div>
  );
};
