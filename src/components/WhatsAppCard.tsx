import React, { useState } from 'react';
import { MessageSquare, Edit2, ExternalLink, CheckCircle2, User, Phone, Terminal } from 'lucide-react';
import { WhatsAppDraft } from '../types';

interface WhatsAppCardProps {
  draft: Partial<WhatsAppDraft>;
}

export const WhatsAppCard: React.FC<WhatsAppCardProps> = ({ draft }) => {
  const [recipient, setRecipient] = useState(draft.recipientName || 'Recipient');
  const [phone, setPhone] = useState(draft.phone || '');
  const [messageText, setMessageText] = useState(
    draft.messageText || 'Hello! Thank you for reaching out.'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const handleOpenWhatsApp = () => {
    const encodedText = encodeURIComponent(messageText);
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    const waUrl = cleanedPhone
      ? `https://wa.me/${cleanedPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    setStatusText('Launching WhatsApp with message...');
    
    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => setStatusText(null), 3000);
    }, 400);
  };

  return (
    <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5 text-left shadow-md font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              [WHATSAPP_PAYLOAD]
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
        >
          <Edit2 className="w-3 h-3" />
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      {/* Recipient & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
          <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] text-slate-500 uppercase font-bold">To:</span>
          {isEditing ? (
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-full font-medium"
              placeholder="Name"
            />
          ) : (
            <span className="font-bold text-white truncate">{recipient}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] text-slate-500 uppercase font-bold">No:</span>
          {isEditing ? (
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-full font-mono"
              placeholder="+923001234567"
            />
          ) : (
            <span className="font-mono text-slate-300 truncate">
              {phone || 'Not set'}
            </span>
          )}
        </div>
      </div>

      {/* Message Body */}
      <div>
        {isEditing ? (
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={3}
            className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none font-sans leading-relaxed"
            placeholder="Type your WhatsApp message..."
          />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
            {messageText}
          </div>
        )}
      </div>

      {/* Feedback & Open WhatsApp Button */}
      {statusText && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{statusText}</span>
        </div>
      )}

      <button
        onClick={handleOpenWhatsApp}
        className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        OPEN WHATSAPP
      </button>
    </div>
  );
};
