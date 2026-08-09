import React, { useState } from 'react';
import { MessageSquare, Edit2, ExternalLink, CheckCircle2, User, Phone } from 'lucide-react';
import { WhatsAppDraft } from '../types';

interface WhatsAppCardProps {
  draft: Partial<WhatsAppDraft>;
  onOpenFullModal?: () => void;
}

export const WhatsAppCard: React.FC<WhatsAppCardProps> = ({ draft, onOpenFullModal }) => {
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

    setStatusText('Opening WhatsApp with prepared message...');
    
    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => setStatusText(null), 3000);
    }, 400);
  };

  return (
    <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 space-y-3 my-2 text-left shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
              WhatsApp Message Preview
            </span>
            <span className="text-[10px] text-emerald-400/90 font-medium">
              Draft Ready • Will open in WhatsApp app
            </span>
          </div>
        </div>
      </div>

      {/* Recipient & Phone Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
          <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] text-slate-500 font-semibold uppercase">To:</span>
          {isEditing ? (
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-full font-medium"
              placeholder="Name"
            />
          ) : (
            <span className="font-semibold text-white truncate">{recipient}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] text-slate-500 font-semibold uppercase">No:</span>
          {isEditing ? (
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-full font-mono"
              placeholder="+923001234567 (optional)"
            />
          ) : (
            <span className="font-mono text-slate-300 truncate">
              {phone || 'Not specified'}
            </span>
          )}
        </div>
      </div>

      {/* Message Body Display or Inline Edit Area */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Message Text
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            {isEditing ? 'Done Editing' : 'Edit Message'}
          </button>
        </div>

        {isEditing ? (
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={4}
            className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl p-3 text-xs text-white focus:outline-none font-sans leading-relaxed resize-y"
            placeholder="Type your WhatsApp message..."
          />
        ) : (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-100 whitespace-pre-wrap leading-relaxed font-sans shadow-inner relative">
            {messageText}
          </div>
        )}
      </div>

      {/* Status Feedback */}
      {statusText && (
        <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 p-2.5 rounded-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusText}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
          {isEditing ? 'Save Edits' : 'Edit Message'}
        </button>

        <button
          onClick={handleOpenWhatsApp}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open WhatsApp
        </button>
      </div>
    </div>
  );
};
