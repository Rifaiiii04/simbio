'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { ShieldAlert, X, AlertTriangle, Send } from 'lucide-react';

interface ReportPartnerModalProps {
  partnershipId: string;
  partnerId: string;
  partnerName: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function ReportPartnerModal({
  partnershipId,
  partnerId,
  partnerName,
  onClose,
  onSuccess,
}: ReportPartnerModalProps) {
  const [reason, setReason] = useState<string>('INAPPROPRIATE_BEHAVIOR');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmitReport = async () => {
    setLoading(true);
    try {
      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({
          reportedId: partnerId,
          partnershipId,
          reason,
          description: description.trim() || undefined,
        }),
      });

      onSuccess(`Report submitted successfully for ${partnerName}. Our moderation team will review it.`);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 p-6 sm:p-7 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white font-black flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Report Partner</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Reporting partner: {partnerName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-2xl border border-orange-200 bg-orange-50 text-orange-800 text-xs font-medium flex items-start gap-2.5 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-[#FF6B30] flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            This report is confidential and will be reviewed by the Simbioly moderation team. False reporting may result in account restrictions.
          </span>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          {/* Reason Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Reason Category:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-xl border border-slate-200 focus:border-rose-500 font-semibold text-slate-800 focus:outline-none transition shadow-2xs cursor-pointer"
            >
              <option value="INAPPROPRIATE_BEHAVIOR">Inappropriate / Toxic Behavior</option>
              <option value="SPAM">Spam / Unsolicited Advertising</option>
              <option value="HARASSMENT">Harassment / Bullying</option>
              <option value="SCAM">Fraud / Scam Suspicion</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Report Details & Notes (Optional):</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 text-xs bg-slate-50 focus:bg-white rounded-2xl border border-slate-200 focus:border-rose-500 font-medium text-slate-800 focus:outline-none transition shadow-2xs leading-relaxed"
              placeholder="Provide context or details about the incident..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmitReport}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-white" />
            <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
