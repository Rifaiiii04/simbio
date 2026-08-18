'use client';

import { MapPin, Navigation, ShieldCheck, Loader2 } from 'lucide-react';

interface ProfileLocationSettingsProps {
  locationEnabled: boolean;
  onToggleLocation: () => void;
  loadingLocation: boolean;
}

export function ProfileLocationSettings({
  locationEnabled,
  onToggleLocation,
  loadingLocation,
}: ProfileLocationSettingsProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
          <Navigation className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900">Preferensi Lokasi & Discovery</h3>
          <p className="text-xs text-slate-500 font-medium">
            Atur visibilitas profil Anda pada peta pencarian partner terdekat.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              locationEnabled
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-900">Fitur Live Location (Peta Terdekat)</h4>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                  locationEnabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {locationEnabled ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xl">
              {locationEnabled
                ? 'Profil Anda terlihat pada Peta Terdekat untuk reciprocal partner di sekitar wilayah Anda.'
                : 'Profil Anda tidak akan ditampilkan pada Peta Terdekat, dan Anda perlu mengaktifkan lokasi untuk melihat peta.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleLocation}
          disabled={loadingLocation}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shrink-0 ${
            locationEnabled
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-[#FF6B30] text-white hover:bg-[#E0531A] shadow-xs'
          } disabled:opacity-60`}
        >
          {loadingLocation ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : locationEnabled ? (
            <span>Nonaktifkan Lokasi</span>
          ) : (
            <span>Aktifkan Live Location</span>
          )}
        </button>
      </div>
    </div>
  );
}
