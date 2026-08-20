'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { apiFetch, getAvatarUrl } from '@/lib/api/client';
import { ProposalModal } from '@/components/discovery/ProposalModal';
import {
  MapPin,
  MapPinOff,
  X,
  UserCheck,
  BookOpen,
  Award,
  Loader2,
  ShieldCheck,
  Crosshair,
  Users,
  Handshake,
  MessageCircle,
  ExternalLink,
  Search,
  Sparkles,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface MapUser {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  country: string | null;
  bio?: string | null;
  latitude: number;
  longitude: number;
  teachSkills: Array<{ id: string; name: string }>;
  distanceKm: number | null;
  isConnected?: boolean;
  isPending?: boolean;
  partnershipId?: string | null;
}

interface MapCandidate {
  user: {
    id: string;
    name: string;
    username: string | null;
    avatarUrl: string | null;
    bio: string | null;
    country: string | null;
  };
  teachSkills: Array<{ id: string; name: string; level: string }>;
  learnSkills: Array<{ id: string; name: string; level: string }>;
  matchScore: number;
  distanceKm: number | null;
}

interface LocationStatus {
  locationEnabled: boolean;
  latitude: number | null;
  longitude: number | null;
}

// Self Marker (Blue Pulse)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSelfMarker(L: any, lat: number, lng: number): any {
  const selfHtml = `
    <div style="position:relative;width:50px;height:50px;display:flex;align-items:center;justify-content:center;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(59,130,246,0.25);border:2px solid #3B82F6;
        animation:selfPulse 2s ease-in-out infinite;
      "></div>
      <div style="
        position:relative;width:26px;height:26px;border-radius:50%;
        background:#2563EB;border:3px solid #FFFFFF;
        box-shadow:0 3px 10px rgba(37,99,235,0.7);
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="width:8px;height:8px;border-radius:50%;background:#FFFFFF;"></div>
      </div>
      <div style="
        position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);
        background:#1E293B;color:#FFFFFF;font-size:10px;font-weight:900;
        padding:2px 8px;border-radius:99px;white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);letter-spacing:0.3px;
      ">Kamu 📍</div>
    </div>
  `;
  const icon = L.divIcon({
    html: selfHtml,
    className: 'custom-self-marker',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  });
  return L.marker([lat, lng], { icon, zIndexOffset: 1000 });
}

// Partner Marker: Differentiates Connected vs Non-Connected
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createPartnerMarker(L: any, u: MapUser): any {
  const avatarSrc = getAvatarUrl(u.avatarUrl, u.id);
  const isConnected = !!u.isConnected;
  const isPending = !!u.isPending;

  const ringColor = isConnected ? '#10B981' : isPending ? '#F59E0B' : '#FF6B30';
  const shadowColor = isConnected
    ? 'rgba(16,185,129,0.5)'
    : isPending
    ? 'rgba(245,158,11,0.5)'
    : 'rgba(255,107,48,0.45)';

  const badgeText = isConnected
    ? '🤝 Terhubung'
    : isPending
    ? '⏳ Menunggu'
    : u.teachSkills[0]?.name
    ? u.teachSkills[0].name.slice(0, 13)
    : 'Partner';

  const badgeBg = isConnected ? '#065F46' : isPending ? '#78350F' : 'rgba(15,23,42,0.9)';

  const markerHtml = `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:translateY(0);transition:transform 0.2s ease;">
      <div style="
        width:46px;height:46px;border-radius:50%;
        border:3.5px solid ${ringColor};background:#FFFFFF;
        box-shadow:0 4px 14px ${shadowColor};
        overflow:hidden;
      ">
        <img src="${avatarSrc}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://api.dicebear.com/7.x/thumbs/svg?seed=${u.id}'" />
      </div>
      <div style="
        margin-top:3px;background:${badgeBg};backdrop-filter:blur(4px);
        color:#FFFFFF;font-size:9px;font-weight:800;padding:2px 8px;
        border-radius:99px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);
        display:flex;align-items:center;gap:3px;
      ">
        <span>${badgeText}</span>
      </div>
    </div>
  `;
  const icon = L.divIcon({
    html: markerHtml,
    className: 'custom-partner-marker',
    iconSize: [46, 66],
    iconAnchor: [23, 23],
  });
  return L.marker([u.latitude, u.longitude], { icon });
}

export function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const locationStatusRef = useRef<LocationStatus | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selfMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partnerMarkersRef = useRef<any[]>([]);

  const [mapUsers, setMapUsers] = useState<MapUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [proposalCandidate, setProposalCandidate] = useState<MapCandidate | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load initial location and users with automatic GPS permission verification
  useEffect(() => {
    let permObj: PermissionStatus | null = null;

    async function init() {
      try {
        const [meRes, mapRes] = await Promise.all([
          apiFetch<{ user: { locationEnabled: boolean; latitude: number | null; longitude: number | null } }>('/users/me'),
          apiFetch<{ users: MapUser[] }>('/discovery/map'),
        ]);

        let isEnabled = meRes.user.locationEnabled;

        // Auto turn off if browser permission is denied
        if (typeof window !== 'undefined' && 'permissions' in navigator) {
          try {
            const perm = await navigator.permissions.query({ name: 'geolocation' });
            permObj = perm;
            if (perm.state === 'denied' && isEnabled) {
              isEnabled = false;
              apiFetch('/users/me/location', {
                method: 'PUT',
                body: JSON.stringify({ locationEnabled: false }),
              }).catch(() => {});
            }

            // Real-time listener if user changes permission in browser settings
            perm.onchange = () => {
              if (perm.state === 'denied') {
                setLocationStatus((prev) => (prev ? { ...prev, locationEnabled: false, latitude: null, longitude: null } : null));
                if (selfMarkerRef.current) {
                  selfMarkerRef.current.remove();
                  selfMarkerRef.current = null;
                }
                apiFetch('/users/me/location', {
                  method: 'PUT',
                  body: JSON.stringify({ locationEnabled: false }),
                }).catch(() => {});
              }
            };
          } catch {
            // Permissions API query not supported in some older browsers
          }
        }

        const loc = {
          locationEnabled: isEnabled,
          latitude: isEnabled ? (meRes.user.latitude ?? null) : null,
          longitude: isEnabled ? (meRes.user.longitude ?? null) : null,
        };
        setLocationStatus(loc);
        locationStatusRef.current = loc;
        setMapUsers(mapRes.users);
      } catch (err) {
        console.error(err);
      } finally {
        setMapLoading(false);
      }
    }
    init();

    return () => {
      if (permObj) {
        permObj.onchange = null;
      }
    };
  }, []);

  // Initialize Leaflet
  useEffect(() => {
    if (mapLoading || !locationStatus?.locationEnabled || !mapContainerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const myLoc = locationStatusRef.current;
      const initialCenter: [number, number] =
        myLoc?.locationEnabled && myLoc.latitude != null && myLoc.longitude != null
          ? [myLoc.latitude, myLoc.longitude]
          : [-2.5489, 118.0149];
      const initialZoom = myLoc?.locationEnabled ? 13 : 5;

      const map = L.map(mapContainerRef.current!, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapRef.current = { map, L };

      if (myLoc?.locationEnabled && myLoc.latitude != null && myLoc.longitude != null) {
        selfMarkerRef.current = createSelfMarker(L, myLoc.latitude, myLoc.longitude).addTo(map);
      }
    });

    return () => {
      if (mapRef.current?.map) {
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
  }, [mapLoading, locationStatus?.locationEnabled]);

  // Center on user position when location becomes available
  useEffect(() => {
    if (!mapRef.current?.map) return;
    const { map, L } = mapRef.current;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    if (locationStatus?.locationEnabled && locationStatus.latitude != null && locationStatus.longitude != null) {
      map.setView([locationStatus.latitude, locationStatus.longitude], 13, { animate: true });
      if (selfMarkerRef.current) selfMarkerRef.current.remove();
      selfMarkerRef.current = createSelfMarker(L, locationStatus.latitude, locationStatus.longitude).addTo(map);
    }
  }, [locationStatus, mapLoading]);

  // Render partner markers
  useEffect(() => {
    if (!mapRef.current) return;
    const { map, L } = mapRef.current;

    partnerMarkersRef.current.forEach((m) => m.remove());
    partnerMarkersRef.current = [];

    mapUsers.forEach((u) => {
      const marker = createPartnerMarker(L, u);
      marker.on('click', () => {
        setSelectedUser(u);
        map.flyTo([u.latitude, u.longitude], 14, { duration: 0.8 });
      });
      marker.addTo(map);
      partnerMarkersRef.current.push(marker);
    });
  }, [mapUsers]);

  // Connected partners list
  const connectedPartners = useMemo(() => {
    return mapUsers.filter((u) => u.isConnected);
  }, [mapUsers]);

  // Filtered connected partners list for sidebar
  const displayedSidebarUsers = useMemo(() => {
    if (!searchQuery.trim()) return connectedPartners;
    const q = searchQuery.toLowerCase();
    return connectedPartners.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        u.teachSkills.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [connectedPartners, searchQuery]);

  const handleFocusUser = (u: MapUser) => {
    setSelectedUser(u);
    if (mapRef.current?.map) {
      mapRef.current.map.flyTo([u.latitude, u.longitude], 15, { duration: 1 });
    }
  };

  const handleCenterOnMe = () => {
    if (mapRef.current?.map && locationStatus?.latitude != null && locationStatus.longitude != null) {
      mapRef.current.map.flyTo([locationStatus.latitude, locationStatus.longitude], 14, { duration: 1 });
    }
  };

  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Browser Anda tidak mendukung geolocation.');
      return;
    }
    setLoadingLocation(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await apiFetch('/users/me/location', {
            method: 'PUT',
            body: JSON.stringify({ latitude, longitude, locationEnabled: true }),
          });
          const newLoc = { locationEnabled: true, latitude, longitude };
          setLocationStatus(newLoc);
          locationStatusRef.current = newLoc;

          const mapRes = await apiFetch<{ users: MapUser[] }>('/discovery/map');
          setMapUsers(mapRes.users);

          if (mapRef.current?.map) {
            const { map, L } = mapRef.current;
            if (selfMarkerRef.current) selfMarkerRef.current.remove();
            selfMarkerRef.current = createSelfMarker(L, latitude, longitude).addTo(map);
            map.flyTo([latitude, longitude], 14, { duration: 1.2 });
          }
        } catch (err) {
          console.error(err);
          setGeoError('Gagal menyimpan lokasi. Coba lagi.');
        } finally {
          setLoadingLocation(false);
        }
      },
      async (err) => {
        setLoadingLocation(false);
        setLocationStatus((prev) => (prev ? { ...prev, locationEnabled: false, latitude: null, longitude: null } : null));
        if (selfMarkerRef.current) {
          selfMarkerRef.current.remove();
          selfMarkerRef.current = null;
        }
        apiFetch('/users/me/location', {
          method: 'PUT',
          body: JSON.stringify({ locationEnabled: false }),
        }).catch(() => {});

        setGeoError(
          err.code === 1
            ? 'Izin akses lokasi belum diizinkan/ditolak. Fitur Live Location otomatis dinonaktifkan.'
            : 'Gagal mendapatkan koordinat GPS. Fitur Live Location otomatis dinonaktifkan.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleDisableLocation = async () => {
    try {
      await apiFetch('/users/me/location', {
        method: 'PUT',
        body: JSON.stringify({ locationEnabled: false }),
      });
      setLocationStatus((prev) => (prev ? { ...prev, locationEnabled: false, latitude: null, longitude: null } : null));
      if (selfMarkerRef.current) {
        selfMarkerRef.current.remove();
        selfMarkerRef.current = null;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toCandidate = (u: MapUser): MapCandidate => ({
    user: { id: u.id, name: u.name, username: u.username, avatarUrl: u.avatarUrl, bio: u.bio ?? null, country: u.country },
    teachSkills: u.teachSkills.map((s) => ({ id: s.id, name: s.name, level: 'INTERMEDIATE' })),
    learnSkills: [],
    matchScore: 0,
    distanceKm: u.distanceKm,
  });

  return (
    <div className="space-y-3 w-full select-none">
      {/* 1. TOP LOCATION CONTROL BAR */}
      <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              locationStatus?.locationEnabled
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-orange-50 text-[#FF6B30] border border-orange-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  locationStatus?.locationEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                {locationStatus?.locationEnabled
                  ? 'Status Lokasi: Aktif (Terlihat di Peta)'
                  : 'Status Lokasi: Nonaktif'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {locationStatus?.locationEnabled
                ? 'Posisimu aktif. Partner terdekat dapat menemukanmu di peta.'
                : 'Aktifkan lokasi agar profilmu muncul di peta reciprocal partner.'}
            </p>
          </div>
        </div>

        {/* Action Toggle Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {geoError && <span className="text-xs font-bold text-red-600">{geoError}</span>}

          {locationStatus?.locationEnabled && locationStatus.latitude != null && (
            <button
              onClick={handleCenterOnMe}
              className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-black transition flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              title="Arahkan peta langsung ke posisimu"
            >
              <Crosshair className="w-3.5 h-3.5 text-blue-600" />
              <span>Ke Lokasiku</span>
            </button>
          )}

          {/* Modern Toggle Switch */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-600 hidden sm:inline select-none">
              {loadingLocation
                ? 'Memproses...'
                : locationStatus?.locationEnabled
                ? 'Aktif'
                : 'Nonaktif'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={!!locationStatus?.locationEnabled}
              aria-label="Toggle Live Location"
              onClick={
                locationStatus?.locationEnabled
                  ? handleDisableLocation
                  : handleEnableLocation
              }
              disabled={loadingLocation}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF6B30] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                locationStatus?.locationEnabled
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  locationStatus?.locationEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {loadingLocation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B30]" />
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                      locationStatus?.locationEnabled ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DISABLED STATE OR SPLIT MAP LAYOUT */}
      {!locationStatus?.locationEnabled ? (
        <div className="w-full lg:h-[calc(100vh-220px)] max-h-[540px] min-h-[360px] bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 border-2 border-orange-200 text-[#FF6B30] flex items-center justify-center shadow-md animate-pulse">
            <MapPinOff className="w-8 h-8" />
          </div>

          <div className="max-w-md space-y-1.5">
            <span className="soft-badge bg-slate-100 text-slate-700 border-slate-200 text-xs font-black">
              🔒 Akses Peta Dinonaktifkan
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Live Location Belum Aktif
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Untuk melihat peta interaktif dan menemukan partner reciprocal di sekitar Anda, pastikan Anda telah menghidupkan fitur live location Anda.
            </p>
          </div>

          <button
            onClick={handleEnableLocation}
            disabled={loadingLocation}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B30] to-orange-500 hover:from-[#E0531A] hover:to-orange-600 text-white text-xs font-black transition flex items-center gap-2 shadow-lg hover:shadow-orange-200 active:scale-95 disabled:opacity-60"
          >
            {loadingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <MapPin className="w-4 h-4 text-white" />
            )}
            <span>Hidupkan Live Location Sekarang 📍</span>
          </button>

          {geoError && (
            <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl max-w-sm">
              {geoError}
            </p>
          )}
        </div>
      ) : (
        /* SPLIT LAYOUT: MAP CANVAS (LEFT/MAIN) + CONNECTED PARTNERS SIDEBAR (RIGHT) */
        <div className="flex flex-col lg:flex-row gap-3 w-full lg:h-[calc(100vh-220px)] max-h-[540px] min-h-[360px]">
          {/* MAP CANVAS CONTAINER */}
          <div className="flex-1 relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100 min-h-[400px]">
            {mapLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF6B30]" />
                  <span className="text-xs font-black text-slate-700">Menyiapkan peta interaktif...</span>
                </div>
              </div>
            )}

            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Map Legend (Top Left) */}
            <div className="absolute top-3.5 left-14 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-slate-200/80 flex items-center gap-3 text-[10px] font-black text-slate-700">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white" />
                <span>Kamu</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                <span>Terhubung ({connectedPartners.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B30] border border-white" />
                <span>Belum Terhubung</span>
              </div>
            </div>

            {/* Floating Center On Me Button */}
            <button
              onClick={handleCenterOnMe}
              className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-md text-slate-800 text-xs font-black px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition active:scale-95 group hover:border-blue-400"
              title="Arahkan peta langsung ke posisi saya"
            >
              <Crosshair className="w-4 h-4 text-blue-600 group-hover:rotate-90 transition-transform duration-300" />
              <span>Lokasi Saya 📍</span>
            </button>
          </div>

          {/* CONNECTED PARTNERS SIDEBAR CONTAINER (Right Box) */}
          <div className="w-full lg:w-[340px] bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden shrink-0">
            {/* Sidebar Header */}
            <div className="p-3.5 border-b border-slate-100 space-y-2.5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Handshake className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-slate-900">Partner Terhubung</h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {connectedPartners.length} Terhubung
                </span>
              </div>

              {/* Quick Search inside Sidebar */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau skill..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            {/* List Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {displayedSidebarUsers.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2 text-slate-400">
                  <Handshake className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">Belum Ada Partner Terhubung</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Klik pin oranye pada peta untuk menghubungkan skill exchange dengan partner baru di sekitarmu!
                  </p>
                </div>
              ) : (
                displayedSidebarUsers.map((u) => {
                  const isSelected = selectedUser?.id === u.id;

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleFocusUser(u)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-400 shadow-xs'
                          : 'bg-emerald-50/30 border-emerald-200/70 hover:bg-emerald-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-emerald-400 bg-emerald-100 text-emerald-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={getAvatarUrl(u.avatarUrl, u.id)} alt={u.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h5 className="text-xs font-black text-slate-900 truncate">{u.name}</h5>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                              <MapPin className="w-3 h-3 text-[#FF6B30]" />
                              <span>{u.distanceKm != null ? `${u.distanceKm} km` : u.country || 'Indonesia'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Tag */}
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md shrink-0 bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Terhubung
                        </span>
                      </div>

                      {/* Skill preview */}
                      {u.teachSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-emerald-100/60">
                          {u.teachSkills.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Chat action button */}
                      <div className="pt-1">
                        <Link
                          href={`/partnerships/${u.partnershipId || ''}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 text-white text-[11px] font-black hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-2xs transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat Kemitraan</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. USER DETAIL MODAL POP-UP (In Portal above everything) */}
      {mounted &&
        selectedUser &&
        !proposalCandidate &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-2xl overflow-hidden border border-slate-200 flex flex-col sm:grid sm:grid-cols-12 animate-in zoom-in-95 duration-200 relative">
              {/* Close Button Top Right */}
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 sm:bg-slate-100 sm:text-slate-600 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-900/80 sm:hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* LEFT COLUMN: Large Portrait Photo (5 cols) */}
              <div className="sm:col-span-5 relative bg-slate-950 min-h-[240px] sm:min-h-[380px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAvatarUrl(selectedUser.avatarUrl, selectedUser.id)}
                  alt={selectedUser.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent sm:bg-gradient-to-t sm:from-slate-950/60 sm:via-transparent sm:to-transparent" />

                {/* Bottom floating badge on photo */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-xl backdrop-blur-md shadow-md flex items-center gap-1 ${
                      selectedUser.isConnected
                        ? 'bg-emerald-600/90 text-white'
                        : 'bg-[#FF6B30]/90 text-white'
                    }`}
                  >
                    {selectedUser.isConnected ? '🤝 Partner Terhubung' : '✨ Partner Baru'}
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: Profile Info & Actions (7 cols) */}
              <div className="sm:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-white">
                {/* User Header Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-xl sm:text-2xl tracking-tight">
                      {selectedUser.name}
                    </h3>
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-bold">
                    {selectedUser.username && (
                      <span className="text-slate-400">@{selectedUser.username}</span>
                    )}
                    <span>•</span>
                    <div className="flex items-center gap-1 text-[#FF6B30]">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {selectedUser.distanceKm != null
                          ? `${selectedUser.distanceKm} km dari posisimu`
                          : selectedUser.country || 'Indonesia'}
                      </span>
                    </div>
                  </div>

                  {selectedUser.bio && (
                    <p className="text-xs text-slate-600 italic font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                      &quot;{selectedUser.bio}&quot;
                    </p>
                  )}
                </div>

                {/* Skills Section */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-100">
                  <span className="text-[11px] font-black uppercase text-emerald-700 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Skill Yang Bisa Diajarkan:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.teachSkills.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Belum mencantumkan skill</span>
                    ) : (
                      selectedUser.teachSkills.map((s) => (
                        <span
                          key={s.id}
                          className="soft-badge bg-emerald-50 text-emerald-800 border-emerald-300 text-xs px-3 py-1 font-bold shadow-2xs"
                        >
                          {s.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="w-1/3 h-12 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center"
                  >
                    Tutup
                  </button>

                  {selectedUser.isConnected ? (
                    <Link
                      href={`/partnerships/${selectedUser.partnershipId || ''}`}
                      className="w-2/3 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Buka Chat Kemitraan</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setProposalCandidate(toCandidate(selectedUser));
                        setSelectedUser(null);
                      }}
                      className="w-2/3 h-12 rounded-2xl bg-gradient-to-r from-[#FF6B30] to-orange-500 text-white text-xs font-black hover:from-[#E0531A] hover:to-orange-600 transition flex items-center justify-center gap-2 shadow-md"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Hubungkan Exchange</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Connection Proposal Modal */}
      {proposalCandidate && (
        <ProposalModal
          candidate={proposalCandidate}
          onClose={() => setProposalCandidate(null)}
          onSuccess={() => setProposalCandidate(null)}
        />
      )}
    </div>
  );
}
