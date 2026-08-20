'use client';

import { MapPin, Navigation, Loader2 } from 'lucide-react';

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
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
          <Navigation className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900">Location & Discovery Preferences</h3>
          <p className="text-xs text-slate-500 font-medium">
            Manage your profile visibility on the nearby discovery map.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              locationEnabled
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-900">Live Location (Nearby Map)</h4>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-md transition-colors ${
                  locationEnabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {locationEnabled ? 'On' : 'Off'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xl">
              {locationEnabled
                ? 'Your profile is visible on the Nearby Map to reciprocal partners in your region.'
                : 'Your profile is hidden from the Nearby Map. Turn on location to view peers on the map.'}
            </p>
          </div>
        </div>

        {/* Modern Animated Toggle Switch */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <span className="text-xs font-bold text-slate-600 hidden sm:inline select-none">
            {loadingLocation ? 'Processing...' : locationEnabled ? 'On' : 'Off'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={locationEnabled}
            aria-label="Toggle Live Location"
            onClick={onToggleLocation}
            disabled={loadingLocation}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF6B30] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              locationEnabled ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-slate-300'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                locationEnabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            >
              {loadingLocation ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B30]" />
              ) : (
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    locationEnabled ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
