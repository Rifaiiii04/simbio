'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { Star } from 'lucide-react';

interface PeerReviewModalProps {
  partnershipId: string;
  partnerName: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function PeerReviewModal({
  partnershipId,
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
      await apiFetch(`/partnerships/${partnershipId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          consistency,
          communication,
          knowledgeSharing,
          collaboration,
          comment: comment.trim() || undefined,
        }),
      });

      onSuccess('Peer review submitted successfully!');
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg neo-box p-6 space-y-4 shadow-[8px_8px_0px_0px_#0F172A] bg-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
          <h3 className="text-base font-black text-[#0F172A]">Peer Review for {partnerName}</h3>
          <button onClick={onClose} className="text-xs font-black">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A]">
              <label className="block text-xs font-black mb-1">Consistency (1-5 Star)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={consistency}
                onChange={(e) => setConsistency(Number(e.target.value))}
                className="w-full p-2 text-xs border-2 border-[#0F172A] rounded-lg font-bold bg-white"
              />
            </div>

            <div className="p-3 bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A]">
              <label className="block text-xs font-black mb-1">Communication (1-5 Star)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={communication}
                onChange={(e) => setCommunication(Number(e.target.value))}
                className="w-full p-2 text-xs border-2 border-[#0F172A] rounded-lg font-bold bg-white"
              />
            </div>

            <div className="p-3 bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A]">
              <label className="block text-xs font-black mb-1">Knowledge Sharing (1-5 Star)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={knowledgeSharing}
                onChange={(e) => setKnowledgeSharing(Number(e.target.value))}
                className="w-full p-2 text-xs border-2 border-[#0F172A] rounded-lg font-bold bg-white"
              />
            </div>

            <div className="p-3 bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A]">
              <label className="block text-xs font-black mb-1">Collaboration (1-5 Star)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={collaboration}
                onChange={(e) => setCollaboration(Number(e.target.value))}
                className="w-full p-2 text-xs border-2 border-[#0F172A] rounded-lg font-bold bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black mb-1">Written Feedback & Testimonial</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share how working with this partner helped your skill growth..."
              className="w-full px-4 py-3 text-xs bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl bg-gray-100 border-2 border-[#0F172A] text-xs font-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-2/3 neo-button py-2.5 text-xs flex items-center justify-center gap-1.5"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>{submitting ? 'Submitting...' : 'Submit Peer Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
