import React, { useState } from 'react';
import { Mail, Edit2, ExternalLink, CheckCircle2, User, FileText } from 'lucide-react';
import { EmailDraft } from '../types';

interface EmailCardProps {
  draft: Partial<EmailDraft>;
}

export const EmailCard: React.FC<EmailCardProps> = ({ draft }) => {
  const [recipient, setRecipient] = useState(draft.recipientEmail || '');
  const [subject, setSubject] = useState(draft.subject || 'Meeting Update');
  const [body, setBody] = useState(draft.body || 'Hello,\n\nI wanted to update you on our project status.\n\nBest regards,');
  const [isEditing, setIsEditing] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const handleOpenEmail = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatusText('Opening default email client...');
    setTimeout(() => {
      window.open(mailtoUrl, '_blank');
      setTimeout(() => setStatusText(null), 3000);
    }, 300);
  };

  return (
    <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5 text-left shadow-md font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            [EMAIL_PAYLOAD]
          </span>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
        >
          <Edit2 className="w-3 h-3" />
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
          <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] text-slate-500 uppercase font-bold">To:</span>
          {isEditing ? (
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-full font-sans"
              placeholder="recipient@example.com"
            />
          ) : (
            <span className="font-sans text-white truncate">{recipient || 'Not specified'}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
          <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] text-slate-500 uppercase font-bold">Subject:</span>
          {isEditing ? (
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-full font-sans font-bold"
              placeholder="Email subject"
            />
          ) : (
            <span className="font-sans font-bold text-white truncate">{subject}</span>
          )}
        </div>
      </div>

      <div>
        {isEditing ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none font-sans leading-relaxed"
            placeholder="Type your email message..."
          />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans max-h-40 overflow-y-auto">
            {body}
          </div>
        )}
      </div>

      {statusText && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{statusText}</span>
        </div>
      )}

      <button
        onClick={handleOpenEmail}
        className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        DRAFT IN EMAIL CLIENT
      </button>
    </div>
  );
};
