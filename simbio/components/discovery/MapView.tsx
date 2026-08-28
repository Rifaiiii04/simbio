'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { apiFetch, getAvatarUrl } from '@/lib/api/client';
import { ProposalModal } from '@/components/discovery/ProposalModal';
import { MapPartnerSidebar, type MapUser } from '@/components/discovery/MapPartnerSidebar';
import {
  MapPin,
  MapPinOff,
  X,
  UserCheck,
  Loader2,
  ShieldCheck,
  Crosshair,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

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

// Self Marker (Glowing Blue / Orange Pulse)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSelfMarker(L: any, lat: number, lng: number): any {
  const selfHtml = `
    <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(255,107,48,0.25);border:2px solid #FF6B30;
        animation:selfPulse 2s ease-in-out infinite;
      "></div>
      <div style="
        position:relative;width:22px;height:22px;border-radius:50%;
        background:#FF6B30;border:3px solid #FFFFFF;
        box-shadow:0 0 15px rgba(255,107,48,0.8);
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="width:6px;height:6px;border-radius:50%;background:#FFFFFF;"></div>
      </div>
      <div style="
        position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);
        background:#18181B;border:1px solid rgba(255,255,255,0.15);color:#FFFFFF;font-size:9px;font-weight:900;
        padding:2px 8px;border-radius:99px;white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.5);letter-spacing:0.3px;
      ">You</div>
    </div>
  `;
  const icon = L.divIcon({
    html: selfHtml,
    className: 'custom-self-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
  return L.marker([lat, lng], { icon, zIndexOffset: 1000 });
}

// Partner Marker (Glowing Avatar Pin)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createPartnerMarker(L: any, u: MapUser): any {
  const avatarSrc = getAvatarUrl(u.avatarUrl, u.name);
  const isConnected = !!u.isConnected;
  const isPending = !!u.isPending;

  const ringColor = isConnected ? '#10B981' : isPending ? '#F59E0B' : '#FF6B30';
  const shadowColor = isConnected
    ? 'rgba(16,185,129,0.6)'
    : isPending
    ? 'rgba(245,158,11,0.6)'
    : 'rgba(255,107,48,0.5)';

  const badgeText = isConnected
    ? 'Connected'
    : isPending
    ? 'Pending'
    : u.teachSkills[0]?.name
    ? u.teachSkills[0].name.slice(0, 12)
    : 'Partner';

  const badgeBg = isConnected ? '#065F46' : isPending ? '#78350F' : '#27272A';

  const markerHtml = `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s ease;">
      <div style="
        width:42px;height:42px;border-radius:50%;
        border:3px solid ${ringColor};background:#121214;
        box-shadow:0 0 14px ${shadowColor};
        overflow:hidden;
      ">
        <img src="${avatarSrc}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://api.dicebear.com/7.x/thumbs/svg?seed=${u.name}'" />
      </div>
      <div style="
        margin-top:3px;background:${badgeBg};border:1px solid rgba(255,255,255,0.15);
        color:#FFFFFF;font-size:9px;font-weight:800;padding:2px 7px;
        border-radius:99px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.5);
      ">
        <span>${badgeText}</span>
      </div>
    </div>
  `;
  const icon = L.divIcon({
    html: markerHtml,
    className: 'custom-partner-marker',
    iconSize: [42, 62],
    iconAnchor: [21, 21],
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
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [meRes, mapRes] = await Promise.all([
          apiFetch<{ user: { locationEnabled: boolean; latitude: number | null; longitude: number | null } }>('/users/me'),
          apiFetch<{ users: MapUser[] }>('/discovery/map'),
        ]);

        const loc = {
          locationEnabled: meRes.user.locationEnabled,
          latitude: meRes.user.latitude ?? null,
          longitude: meRes.user.longitude ?? null,
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
  }, []);

  // Initialize Leaflet with Carto Dark Matter Tiles
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

      // Carto Dark Matter Tiles (Clean Dark Theme without watermarks)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapRef.current = { map, L };

      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 300);

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

  // Update center when location becomes available
  useEffect(() => {
    if (!mapRef.current?.map) return;
    const { map, L } = mapRef.current;

    setTimeout(() => map.invalidateSize(), 150);

    if (locationStatus?.locationEnabled && locationStatus.latitude != null && locationStatus.longitude != null) {
      map.setView([locationStatus.latitude, locationStatus.longitude], 13, { animate: true });
      if (selfMarkerRef.current) selfMarkerRef.current.remove();
      selfMarkerRef.current = createSelfMarker(L, locationStatus.latitude, locationStatus.longitude).addTo(map);
    }
  }, [locationStatus]);

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

  const handleToggleLocation = async () => {
    if (loadingLocation) return;
    const currentEnabled = locationStatus?.locationEnabled ?? false;
    setLoadingLocation(true);

    if (!currentEnabled) {
      if (!('geolocation' in navigator)) {
        setLoadingLocation(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            await apiFetch('/users/me/location', {
              method: 'PUT',
              body: JSON.stringify({ locationEnabled: true, latitude: lat, longitude: lng }),
            });
            const newLoc = { locationEnabled: true, latitude: lat, longitude: lng };
            setLocationStatus(newLoc);
            locationStatusRef.current = newLoc;
            const mapRes = await apiFetch<{ users: MapUser[] }>('/discovery/map');
            setMapUsers(mapRes.users);
          } catch (err) {
            console.error(err);
          } finally {
            setLoadingLocation(false);
          }
        },
        () => {
          setLoadingLocation(false);
        }
      );
    } else {
      try {
        await apiFetch('/users/me/location', {
          method: 'PUT',
          body: JSON.stringify({ locationEnabled: false }),
        });
        const newLoc = { locationEnabled: false, latitude: null, longitude: null };
        setLocationStatus(newLoc);
        locationStatusRef.current = newLoc;
        if (selfMarkerRef.current) {
          selfMarkerRef.current.remove();
          selfMarkerRef.current = null;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLocation(false);
      }
    }
  };

  const handleCenterMyLocation = () => {
    if (
      locationStatus?.locationEnabled &&
      locationStatus.latitude != null &&
      locationStatus.longitude != null &&
      mapRef.current?.map
    ) {
      mapRef.current.map.flyTo([locationStatus.latitude, locationStatus.longitude], 14, { duration: 0.8 });
    }
  };

  const handleSelectUserFromSidebar = (u: MapUser) => {
    setSelectedUser(u);
    if (mapRef.current?.map) {
      mapRef.current.map.flyTo([u.latitude, u.longitude], 14, { duration: 0.8 });
    }
  };

  if (mapLoading) {
    return (
      <div className="h-[600px] rounded-3xl bg-[#121214] border border-neutral-800 flex flex-col items-center justify-center text-white">
        <Sparkles className="w-8 h-8 text-[#FF6B30] animate-pulse mb-3" />
        <p className="text-sm font-bold text-neutral-300">Loading interactive map...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 text-white overflow-hidden">
      {/* 1. Map Top Control Bar */}
      <div className="shrink-0 bg-[#121214] border border-neutral-800/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${locationStatus?.locationEnabled ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
          <div>
            <span className="text-xs font-bold text-white">
              Location Status: {locationStatus?.locationEnabled ? 'Active' : 'Disabled'}
            </span>
            <p className="text-[10px] text-neutral-400 font-medium">
              {locationStatus?.locationEnabled ? 'Discovering study partners in your area' : 'Enable GPS to see nearby distance'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {locationStatus?.locationEnabled && (
            <button
              onClick={handleCenterMyLocation}
              className="px-3 py-1.5 rounded-xl bg-[#18181B] hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Crosshair className="w-3.5 h-3.5 text-[#FF6B30]" />
              <span>My Location</span>
            </button>
          )}

          <button
            onClick={handleToggleLocation}
            disabled={loadingLocation}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              locationStatus?.locationEnabled
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-[#FF6B30] hover:bg-[#E0531A] text-white shadow-md shadow-[#FF6B30]/20'
            }`}
          >
            {loadingLocation ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : locationStatus?.locationEnabled ? (
              <MapPin className="w-3.5 h-3.5" />
            ) : (
              <MapPinOff className="w-3.5 h-3.5" />
            )}
            <span>{locationStatus?.locationEnabled ? 'Sharing Active' : 'Enable Location'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Map Grid Area */}
      <div className="flex-1 min-h-0 grid lg:grid-cols-3 gap-3 overflow-hidden">
        {/* Map Container */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-neutral-800/80 bg-[#121214] shadow-2xl">
          {locationStatus?.locationEnabled ? (
            <div ref={mapContainerRef} className="w-full h-full z-0" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0E0E10]">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center mb-4">
                <MapPinOff className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">GPS Location Is Disabled</h3>
              <p className="text-xs text-neutral-400 max-w-sm mb-5">
                Enable your location to view nearby study partners and see relative distance on the interactive dark map.
              </p>
              <button
                onClick={handleToggleLocation}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B30] hover:bg-[#E0531A] text-white text-xs font-bold transition shadow-lg shadow-[#FF6B30]/25 flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Enable My Location</span>
              </button>
            </div>
          )}

          {/* Map Legend Overlay */}
          {locationStatus?.locationEnabled && (
            <div className="absolute top-3 left-14 z-[400] bg-[#121214]/90 backdrop-blur-md border border-neutral-800 rounded-xl px-3 py-1.5 flex items-center gap-3 text-[10px] font-bold text-neutral-300 shadow-xl pointer-events-none">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF6B30]" /> You
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Connected
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Available
              </span>
            </div>
          )}
        </div>

        {/* Right Side Partner List */}
        <div className="hidden lg:block h-full min-h-0">
          <MapPartnerSidebar
            users={mapUsers}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectUser={handleSelectUserFromSidebar}
            selectedUserId={selectedUser?.id}
          />
        </div>
      </div>

      {/* Selected Partner Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121214] border border-neutral-800 text-white rounded-3xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={getAvatarUrl(selectedUser.avatarUrl, selectedUser.name)}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-neutral-700 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1 truncate">
                    {selectedUser.name}
                    <ShieldCheck className="w-4 h-4 text-[#FF6B30]" />
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    <span>{selectedUser.country || 'Global'}</span>
                    {selectedUser.distanceKm !== null && (
                      <>
                        <span className="text-neutral-600">•</span>
                        <span>{Math.round(selectedUser.distanceKm)} km away</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedUser.bio && (
              <div>
                <p className="text-xs text-neutral-300 leading-relaxed">{selectedUser.bio}</p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Can Teach:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.teachSkills.map((s) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 rounded-xl bg-[#FF6B30]/15 border border-[#FF6B30]/30 text-xs font-medium text-[#FF8F60]"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition cursor-pointer"
              >
                Close
              </button>

              {selectedUser.isConnected && selectedUser.partnershipId ? (
                <Link
                  href={`/partnerships/${selectedUser.partnershipId}`}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open Chat</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setProposalCandidate({
                      user: {
                        id: selectedUser.id,
                        name: selectedUser.name,
                        username: selectedUser.username,
                        avatarUrl: selectedUser.avatarUrl,
                        bio: selectedUser.bio ?? null,
                        country: selectedUser.country,
                      },
                      teachSkills: selectedUser.teachSkills.map((s) => ({ id: s.id, name: s.name, level: 'INTERMEDIATE' })),
                      learnSkills: [],
                      matchScore: 80,
                      distanceKm: selectedUser.distanceKm,
                    });
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF6B30] hover:bg-[#E0531A] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-[#FF6B30]/25 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Connect</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Match Proposal Modal */}
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
