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
      <div className="w-full max-w-lg neo-box p-6 sm:p-8 space-y-6 bg-white shadow-[10px_10px_0px_0px_#0F172A] relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500 border-2.5 border-[#0F172A] text-white font-black flex items-center justify-center shadow-[3px_3px_0px_0px_#0F172A]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">Laporkan Partner</h2>
              <p className="text-xs text-gray-600 font-bold">Report partner: {partnerName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border-2 border-[#0F172A] font-black text-sm flex items-center justify-center text-[#0F172A] hover:bg-red-500 hover:text-white transition shadow-[2px_2px_0px_0px_#0F172A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl border-2 border-[#0F172A] bg-[#FFF5EF] text-[#FF7A30] text-xs font-bold flex items-start gap-2.5 shadow-[2px_2px_0px_0px_#0F172A]">
          <AlertTriangle className="w-4 h-4 text-[#FF7A30] flex-shrink-0 mt-0.5" />
          <span>
            Laporan ini bersifat rahasia dan akan ditinjau oleh tim moderator Simbioly. Penyalahgunaan fitur laporan palsu dapat berakibat sanksi akun.
          </span>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          {/* Reason Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-[#0F172A] uppercase">Kategori Alasan Laporan:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold text-[#0F172A] focus:outline-hidden focus:border-red-500 shadow-[2px_2px_0px_0px_#0F172A]"
            >
              <option value="INAPPROPRIATE_BEHAVIOR">Perilaku Tidak Layak / Toksik</option>
              <option value="SPAM">Spam / Iklan Tidak Diinginkan</option>
              <option value="HARASSMENT">Pelecehan / Perundungan</option>
              <option value="SCAM">Penipuan / Indikasi Fraud</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-[#0F172A] uppercase">Detail / Catatan Laporan (Opsional):</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A] font-bold text-[#0F172A] focus:outline-hidden focus:border-red-500 shadow-[3px_3px_0px_0px_#0F172A]"
              placeholder="Jelaskan detail kejadian atau pelanggaran yang dilakukan partner..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#0F172A]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 border-2 border-[#0F172A] text-xs font-black hover:bg-gray-200 transition shadow-[2px_2px_0px_0px_#0F172A]"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmitReport}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white border-2 border-[#0F172A] text-xs font-black hover:bg-red-700 transition flex items-center gap-2 shadow-[3px_3px_0px_0px_#0F172A]"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Mengirim...' : 'Kirim Laporan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
