'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { ArrowRight, ArrowLeft, CheckCircle2, MapPin, Loader2 } from 'lucide-react';

interface LocationStepProps {
  locationEnabled: boolean;
  onLocationChange: (enabled: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

export function LocationStep({ locationEnabled, onLocationChange, onBack, onNext }: LocationStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);

  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser does not support geolocation.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          let detectedCountry: string | null = null;
          let detectedCity: string | null = null;

          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              detectedCountry = geoData.address?.country || null;
              detectedCity = geoData.address?.city || geoData.address?.town || geoData.address?.county || geoData.address?.state || null;
            }
          } catch {
            // Proceed if external geocoding is unavailable
          }

          if (detectedCountry) {
            setDetectedLocationName(detectedCity ? `${detectedCity}, ${detectedCountry}` : detectedCountry);
          }

          await apiFetch('/users/me/location', {
            method: 'PUT',
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              locationEnabled: true,
              country: detectedCountry,
            }),
          });
          onLocationChange(true);
        } catch {
          setError('Failed to save location. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === 1
            ? 'Location permission denied. Please allow GPS access in your browser.'
            : 'Failed to retrieve location.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="soft-badge bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold">
          Step 4: Nearby Map Feature
        </span>
        <h2 className="text-2xl font-black text-slate-900">Be Discovered on the Map?</h2>
        <p className="text-xs text-slate-500 font-medium">
          Enable location to appear on the discovery map and connect with partners near you. You can turn this off anytime in Settings.
        </p>
      </div>

      <SimbiAvatar state="happy" message="Enable location so nearby learning partners can easily find you on the map!" />

      <div className="space-y-3">
        <div className="grid gap-3">
          {[
            { title: 'Appear on Discovery Map', desc: 'Partners in your city can view your profile directly on the map.' },
            { title: 'Local Priority', desc: 'Your profile appears earlier for searches in your local area.' },
            { title: 'Privacy Protected', desc: 'Coordinates are stored securely with zero continuous tracking.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <MapPin className="w-5 h-5 text-[#FF6B30] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-slate-900">{item.title}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {locationEnabled && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-700">
              Location enabled{detectedLocationName ? ` (${detectedLocationName})` : ''}! You will now appear on the map.
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-200">
            <p className="text-xs font-bold text-red-700">{error}</p>
          </div>
        )}

        {!locationEnabled && (
          <button
            type="button"
            onClick={handleEnableLocation}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-600 transition shadow-md disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Detecting Location...</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>Enable Location Now</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 inline mr-1" />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-2/3 soft-button py-3.5 text-xs flex items-center justify-center gap-2 shadow-2xs font-bold cursor-pointer"
        >
          <span>{locationEnabled ? 'Next: Learning Goal' : 'Skip for Now'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
