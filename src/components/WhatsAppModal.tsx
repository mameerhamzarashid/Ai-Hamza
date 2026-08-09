import React, { useState } from 'react';
import { ExternalLink, Edit2, X, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { WhatsAppDraft } from '../types';

interface WhatsAppModalProps {
  draft: WhatsAppDraft | null;
  onClose: () => void;
  onSendConfirm: (draftId: string, updatedText: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  draft,
  onClose,
  onSendConfirm,
}) => {
  if (!draft) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(draft.messageText);
  const [editedPhone, setEditedPhone] = useState(draft.phone || '');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleOpenWhatsApp = () => {
    onSendConfirm(draft.id, editedText);
    setSentSuccess(true);
    const encodedText = encodeURIComponent(editedText);
    const cleanedPhone = editedPhone.replace(/[^0-9]/g, '');
    const targetUrl = cleanedPhone 
      ? `https://wa.me/${cleanedPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    setTimeout(() => {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-emerald-950/40 border-b border-emerald-800/30 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">WhatsApp Message Preview</h3>
              <p className="text-[11px] text-emerald-300/80">Recipient: <span className="font-semibold text-white">{draft.recipientName}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Clicking <b>Open WhatsApp</b> will launch WhatsApp with your pre-filled message ready to send.
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="text"
              value={editedPhone}
              onChange={(e) => setEditedPhone(e.target.value)}
              placeholder="e.g. +923001234567"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Generated Message
              </label>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-3 h-3" />
                {isEditing ? 'Done Editing' : 'Edit Message'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
              />
            ) : (
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {editedText}
              </div>
            )}
          </div>

          {sentSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl animate-in zoom-in-95">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Opening WhatsApp with prepared message...</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950/60 px-5 py-3.5 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
            {isEditing ? 'Done Editing' : 'Edit Message'}
          </button>
          <button
            onClick={handleOpenWhatsApp}
            disabled={sentSuccess}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
