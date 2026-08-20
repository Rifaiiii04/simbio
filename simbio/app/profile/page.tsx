'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileIdentityForm } from '@/components/profile/ProfileIdentityForm';
import { ProfileSkillsSection } from '@/components/profile/ProfileSkillsSection';
import { ProfileLocationSettings } from '@/components/profile/ProfileLocationSettings';
import { ProfileReputationStats } from '@/components/profile/ProfileReputationStats';
import { AddSkillModal } from '@/components/profile/AddSkillModal';
import { CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  country: string | null;
  locationEnabled: boolean;
  createdAt?: string;
}

interface UserSkill {
  id: string;
  type: 'TEACH' | 'LEARN';
  level: string;
  skill: { id: string; name: string; category?: { name: string } };
}

interface Skill {
  id: string;
  name: string;
  category?: { name: string };
}

interface Reputation {
  count: number;
  overall: number | null;
  averages: { consistency: number; communication: number; knowledgeSharing: number; collaboration: number } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [reputationLoading, setReputationLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Skill Add Modal
  const [showAddSkillModal, setShowAddSkillModal] = useState<false | 'TEACH' | 'LEARN'>(false);
  const [newSkillId, setNewSkillId] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');

  // Statuses
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('simbioly_token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const [userData, userSkillsData, skillsData, reputationData] = await Promise.all([
          apiFetch<{ user: UserProfile }>('/users/me'),
          apiFetch<{ skills: UserSkill[] }>('/skills/me/skills').catch(() => ({ skills: [] })),
          apiFetch<{ skills: Skill[] }>('/skills').catch(() => ({ skills: [] })),
          apiFetch<{ reputation: Reputation }>('/reviews/reputation/me').catch(() => ({ reputation: { count: 0, overall: null, averages: null } })),
        ]);

        const u = userData.user;
        setProfile(u);
        setName(u.name || '');
        setUsername(u.username || '');
        setBio(u.bio || '');
        setCountry(u.country || 'Indonesia');
        setAvatarUrl(u.avatarUrl);
        setLocationEnabled(!!u.locationEnabled);

        setUserSkills(userSkillsData.skills || []);
        setAllSkills(skillsData.skills || []);
        setReputation(reputationData.reputation);
        setReputationLoading(false);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat data profil');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Handle Save Identity Form
  const handleSaveProfile = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await apiFetch<{ user: UserProfile }>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim() || undefined,
          bio: bio.trim() || undefined,
          country: country || undefined,
          avatarUrl: avatarUrl || undefined,
        }),
      });

      setProfile(res.user);
      setSuccessMsg('Profil berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  // Handle Avatar Updated from Header Upload
  const handleAvatarUpdated = (newUrl: string) => {
    setAvatarUrl(newUrl);
    setProfile((prev) => (prev ? { ...prev, avatarUrl: newUrl } : null));
    setSuccessMsg('Foto profil berhasil diunggah dan disimpan!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Handle Add Skill
  const handleAddSkill = async () => {
    if (!showAddSkillModal) return;
    if (!newSkillId && !customSkillName.trim()) return;

    setAddingSkill(true);
    try {
      await apiFetch('/skills/me/skills', {
        method: 'POST',
        body: JSON.stringify({
          type: showAddSkillModal,
          skillId: newSkillId || undefined,
          customSkillName: !newSkillId && customSkillName.trim() ? customSkillName.trim() : undefined,
          level: newSkillLevel,
        }),
      });

      // Refresh user skills
      const updated = await apiFetch<{ skills: UserSkill[] }>('/skills/me/skills');
      setUserSkills(updated.skills || []);
      setShowAddSkillModal(false);
      setNewSkillId('');
      setCustomSkillName('');
      setNewSkillLevel('INTERMEDIATE');
      setSuccessMsg('Skill berhasil ditambahkan!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menambahkan skill');
    } finally {
      setAddingSkill(false);
    }
  };

  // Handle Remove Skill
  const handleRemoveSkill = async (userSkillId: string) => {
    setDeletingSkillId(userSkillId);
    try {
      await apiFetch(`/skills/me/skills/${userSkillId}`, {
        method: 'DELETE',
      });
      setUserSkills((prev) => prev.filter((s) => s.id !== userSkillId));
      setSuccessMsg('Skill berhasil dihapus');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus skill');
    } finally {
      setDeletingSkillId(null);
    }
  };

  // Handle Toggle Location
  const handleToggleLocation = async () => {
    setLoadingLocation(true);
    setErrorMsg(null);

    if (locationEnabled) {
      // Disable
      try {
        await apiFetch('/users/me/location', {
          method: 'PUT',
          body: JSON.stringify({ locationEnabled: false }),
        });
        setLocationEnabled(false);
        setSuccessMsg('Live location berhasil dinonaktifkan.');
        setTimeout(() => setSuccessMsg(null), 4000);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Gagal mengubah status lokasi');
      } finally {
        setLoadingLocation(false);
      }
    } else {
      // Enable via GPS
      if (!('geolocation' in navigator)) {
        setErrorMsg('Browser Anda tidak mendukung Geolocation GPS');
        setLoadingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await apiFetch('/users/me/location', {
              method: 'PUT',
              body: JSON.stringify({
                locationEnabled: true,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            });
            setLocationEnabled(true);
            setSuccessMsg('Live location berhasil diaktifkan!');
            setTimeout(() => setSuccessMsg(null), 4000);
          } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan koordinat lokasi');
          } finally {
            setLoadingLocation(false);
          }
        },
        (err) => {
          setErrorMsg(`Gagal membaca GPS: ${err.message}. Pastikan izin lokasi diberikan.`);
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6B30]" />
            <span className="text-xs font-bold">Memuat profil Simbioly Anda...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-md space-y-4">
            <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
            <h3 className="text-lg font-black text-slate-900">Gagal Memuat Profil</h3>
            <p className="text-xs text-slate-500">{errorMsg || 'Terjadi kesalahan saat memuat data akun Anda.'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-[#FF6B30] text-white text-xs font-black hover:bg-[#E0531A] transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const teachCount = userSkills.filter((s) => s.type === 'TEACH').length;
  const learnCount = userSkills.filter((s) => s.type === 'LEARN').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-6 space-y-5">
        {/* Toast Feedback */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. PROFILE HEADER WITH AVATAR UPLOAD */}
        <ProfileHeader
          user={{
            id: profile.id,
            name: profile.name,
            email: profile.email,
            username: username || profile.username,
            avatarUrl: avatarUrl || profile.avatarUrl,
            country: country || profile.country,
            createdAt: profile.createdAt,
          }}
          teachCount={teachCount}
          learnCount={learnCount}
          onAvatarUpdated={handleAvatarUpdated}
        />

        {/* 2. REPUTATION STATISTICS */}
        <ProfileReputationStats reputation={reputation} loading={reputationLoading} />

        {/* 2. IDENTITY & PERSONAL INFO FORM */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <ProfileIdentityForm
            name={name}
            username={username}
            bio={bio}
            country={country}
            onChangeName={setName}
            onChangeUsername={setUsername}
            onChangeBio={setBio}
            onChangeCountry={setCountry}
          />

          {/* 3. SKILLS MATRIX SECTION */}
          <ProfileSkillsSection
            userSkills={userSkills}
            onOpenAddSkill={(type) => setShowAddSkillModal(type)}
            onRemoveSkill={handleRemoveSkill}
            deletingSkillId={deletingSkillId}
          />

          {/* 4. LOCATION PREFERENCES */}
          <ProfileLocationSettings
            locationEnabled={locationEnabled}
            onToggleLocation={handleToggleLocation}
            loadingLocation={loadingLocation}
          />

          {/* SAVE BUTTON BAR */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B30] to-orange-500 hover:from-[#E0531A] hover:to-orange-600 text-white text-xs font-black transition flex items-center gap-2 shadow-md hover:shadow-orange-200 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span>Simpan Semua Perubahan</span>
            </button>
          </div>
        </form>
      </main>

      {/* ADD SKILL MODAL */}
      {showAddSkillModal && (
        <AddSkillModal
          type={showAddSkillModal}
          allSkills={allSkills}
          newSkillId={newSkillId}
          customSkillName={customSkillName}
          newSkillLevel={newSkillLevel}
          addingSkill={addingSkill}
          onSelectSkill={(id, custom) => {
            setNewSkillId(id);
            setCustomSkillName(custom || '');
          }}
          onSelectLevel={setNewSkillLevel}
          onClose={() => {
            setShowAddSkillModal(false);
            setNewSkillId('');
            setCustomSkillName('');
          }}
          onSave={handleAddSkill}
        />
      )}
    </div>
  );
}
