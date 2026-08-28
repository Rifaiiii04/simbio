'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';

interface PeerReviewModalProps {
  partnershipId: string;
  partnerId: string;
  partnerName: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function PeerReviewModal({
  partnershipId,
  partnerId,
  partnerName,
  onClose,
  onSuccess,
}: PeerReviewModalProps) {
  const [consistency, setConsistency] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [knowledgeSharing, setKnowledgeSharing] = useState(5);
  const [collaboration, setCollaboration] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch(`/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          partnershipId,
          revieweeId: partnerId,
          consistency,
          communication,
          knowledgeSharing,
          collaboration,
          comment: comment.trim() || undefined,
        }),
      });

      onSuccess('Peer review submitted successfully!');
      onClose();
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Peer Review for {partnerName}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Rate your collaboration and skill exchange experience</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">Consistency (1-5 Stars)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={consistency}
                onChange={(e) => setConsistency(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 focus:border-[#FF6B30] rounded-xl font-bold bg-white text-slate-800 focus:outline-none shadow-2xs"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">Communication (1-5 Stars)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={communication}
                onChange={(e) => setCommunication(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 focus:border-[#FF6B30] rounded-xl font-bold bg-white text-slate-800 focus:outline-none shadow-2xs"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">Teaching Quality (1-5 Stars)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={knowledgeSharing}
                onChange={(e) => setKnowledgeSharing(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 focus:border-[#FF6B30] rounded-xl font-bold bg-white text-slate-800 focus:outline-none shadow-2xs"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">Collaboration (1-5 Stars)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={collaboration}
                onChange={(e) => setCollaboration(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 focus:border-[#FF6B30] rounded-xl font-bold bg-white text-slate-800 focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Written Feedback & Testimonial</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share how working with this partner helped your skill growth..."
              className="w-full p-3 text-xs bg-slate-50 focus:bg-white rounded-2xl border border-slate-200 focus:border-[#FF6B30] font-medium text-slate-800 focus:outline-none transition shadow-2xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF6B30] hover:from-amber-600 hover:to-[#E0531A] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Star className="w-3.5 h-3.5 fill-white text-white" />
              <span>{submitting ? 'Submitting...' : 'Submit Peer Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
