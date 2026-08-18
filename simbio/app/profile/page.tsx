'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { AddSkillModal } from '@/components/profile/AddSkillModal';
import {
  Camera,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  User as UserIcon,
  BookOpen,
  Award,
  ShieldCheck,
  Upload,
  Check,
  Zap,
  TrendingUp,
  MapPin,
  Circle,
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  country: string | null;
  locationEnabled: boolean;
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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  // Profile Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Skill Add Form States
  const [showAddSkillModal, setShowAddSkillModal] = useState<false | 'TEACH' | 'LEARN'>(false);
  const [newSkillId, setNewSkillId] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');

  const [saving, setSaving] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const countries = [
    'Indonesia',
    'United States',
    'Japan',
    'Germany',
    'United Kingdom',
    'Singapore',
    'Australia',
    'Canada',
    'France',
    'Netherlands',
  ];

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  ];

  useEffect(() => {
    const token = localStorage.getItem('simbioly_token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const userRes = await apiFetch<{ user: UserProfile }>('/users/me');
        const p = userRes.user;
        setProfile(p);
        setName(p.name);
        setUsername(p.username || '');
        setBio(p.bio || '');
        setCountry(p.country || 'Indonesia');
        setAvatarUrl(p.avatarUrl || '');
        setLocationEnabled(p.locationEnabled);

        const userSkillsRes = await apiFetch<{ skills: UserSkill[] }>('/skills/me/skills');
        setUserSkills(userSkillsRes.skills);

        const skillsRes = await apiFetch<{ skills: Skill[] }>('/skills');
        setAllSkills(skillsRes.skills);
      } catch (err: unknown) {
        if (err instanceof Error && (err.message.includes('401') || err.message.includes('Authentication required'))) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updatedRes = await apiFetch<{ user: UserProfile }>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          username: username.trim() || null,
          bio: bio.trim() || null,
          country: country || 'Indonesia',
          avatarUrl: avatarUrl || null,
          locationEnabled,
        }),
      });

      setProfile(updatedRes.user);
      setMessage('Profil & Pengaturan berhasil diperbarui!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!showAddSkillModal || !newSkillId) return;
    setAddingSkill(true);
    try {
      let skillIdToAdd = newSkillId;

      if (newSkillId === 'OTHER' && customSkillName.trim()) {
        const catRes = await apiFetch<{ categories: Array<{ id: string }> }>('/skills/categories');
        const catId = catRes.categories[0]?.id;
        if (catId) {
          const slug = customSkillName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
          const created = await apiFetch<{ skill: Skill }>('/skills', {
            method: 'POST',
            body: JSON.stringify({
              categoryId: catId,
              name: customSkillName.trim(),
              slug: `${slug}-${Date.now().toString().slice(-4)}`,
            }),
          });
          skillIdToAdd = created.skill.id;
        }
      }

      await apiFetch('/skills/me/skills', {
        method: 'POST',
        body: JSON.stringify({
          skillId: skillIdToAdd,
          type: showAddSkillModal,
          level: newSkillLevel,
        }),
      });

      const userSkillsRes = await apiFetch<{ skills: UserSkill[] }>('/skills/me/skills');
      setUserSkills(userSkillsRes.skills);
      setShowAddSkillModal(false);
      setNewSkillId('');
      setCustomSkillName('');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Gagal menambahkan skill');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleDeleteUserSkill = async (userSkillId: string) => {
    try {
      await apiFetch(`/skills/me/skills/${userSkillId}`, {
        method: 'DELETE',
      });
      setUserSkills((prev) => prev.filter((s) => s.id !== userSkillId));
    } catch (err: unknown) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF6B30] font-bold text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Memuat profil pengguna...</span>
          </div>
        </div>
      </div>
    );
  }

  const teachSkills = userSkills.filter((s) => s.type === 'TEACH');
  const learnSkills = userSkills.filter((s) => s.type === 'LEARN');

  // Calculate profile completion percentage
  let profilePercent = 40;
  if (profile?.bio) profilePercent += 15;
  if (profile?.country) profilePercent += 15;
  if (profile?.avatarUrl) profilePercent += 15;
  if (teachSkills.length > 0) profilePercent += 15;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Banner Hero Header Card */}
        <div className="soft-card p-6 sm:p-8 bg-gradient-to-r from-orange-50/70 via-white to-sky-50/70 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 z-10 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Photo Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#FF6B30] text-white font-black flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{name.charAt(0)}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center cursor-pointer shadow-xs hover:bg-slate-100 transition">
                  <Camera className="w-4 h-4 text-slate-700" />
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Profile Details */}
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{name}</h1>
                  <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Learner</span>
                  </span>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs font-semibold text-slate-500">
                  {username && <span className="text-[#FF6B30] font-bold">@{username}</span>}
                  <span className="soft-badge bg-sky-50 text-sky-700 border-sky-200 px-2.5 py-0.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{country}</span>
                  </span>
                  <span className="text-slate-400 font-medium">{profile?.email}</span>
                </div>

                {bio && <p className="text-xs text-slate-600 font-medium max-w-xl italic pt-1">&quot;{bio}&quot;</p>}
              </div>
            </div>

            {/* Top Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-center px-3">
                <p className="text-xl font-black text-slate-900">{teachSkills.length}</p>
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Teach Skills</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center px-3">
                <p className="text-xl font-black text-slate-900">{learnSkills.length}</p>
                <p className="text-[10px] font-bold text-[#FF6B30] uppercase">Learn Skills</p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-3.5 text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Asymmetrical 2-Column Workspace Grid (8 Cols Main Workspace | 4 Cols Sidebar) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT MAIN WORKSPACE (8 Cols): Personal Identity & Skills Portfolio Grid */}
          <div className="lg:col-span-8 space-y-8">
            {/* CARD 1: Personal Identity & Account Settings */}
            <div className="soft-card p-6 sm:p-8 bg-white space-y-6 shadow-xs border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-[#FF6B30]" />
                  <h2 className="text-base font-bold text-slate-900">Identitas & Informasi Akun</h2>
                </div>
                <span className="soft-badge bg-slate-100 text-slate-600 text-[10px]">
                  ID: {profile?.id.slice(0, 8)}...
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Photo Avatar Preset Selector */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <label className="block text-xs font-bold text-slate-800">Pilih Preset Avatar Profil</label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2">
                      {presetAvatars.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border transition ${
                            avatarUrl === url ? 'ring-2 ring-[#FF6B30] scale-105 border-[#FF6B30]' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Preset avatar" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Upload className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="Atau tempel URL gambar avatar..."
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="alex_morgan"
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Negara / Wilayah Domisili</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Exchange Bio & Goals</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Ceritakan minat belajar, latar belakang skill, dan harapan pertukaran ilmu kamu..."
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
                  />
                </div>

                {/* Proximity Matching Toggle */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Aktifkan Proximity Matching (Pencarian Jarak Terdekat)</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Izinkan pembelajar lain menemukan kamu berdasarkan estimasi lokasi terdekat.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={locationEnabled}
                      onChange={(e) => setLocationEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[#FF6B30] rounded-md cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="soft-button text-xs px-7 py-3 flex items-center justify-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan Pengaturan...' : 'Simpan Profil & Pengaturan'}</span>
                </button>
              </form>
            </div>

            {/* CARD 2: Interactive Skills Portfolio Matrix (Spacious & Responsive) */}
            <div className="soft-card p-6 sm:p-8 bg-white space-y-6 shadow-xs border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#FF6B30]" />
                  <h2 className="text-base font-bold text-slate-900">Matriks Portofolio Skill Exchange</h2>
                </div>
                <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-[10px]">
                  {userSkills.length} Total Skills Registered
                </span>
              </div>

              {/* Sub-Section 1: Skills You Teach */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Skill yang Kamu Kuasai & Ajarkan ({teachSkills.length})</span>
                  </div>
                  <button
                    onClick={() => setShowAddSkillModal('TEACH')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Skill Diajarkan</span>
                  </button>
                </div>

                {teachSkills.length === 0 ? (
                  <div className="p-6 text-center space-y-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-xs text-slate-500 font-medium italic">Belum ada skill yang diajarkan ditambahkan.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {teachSkills.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-2xs hover:bg-white transition"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{s.skill.name}</span>
                          <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] mt-0.5">
                            {s.level}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteUserSkill(s.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition"
                          title="Hapus skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub-Section 2: Skills You Learn */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B30] uppercase tracking-wider">
                    <Award className="w-4 h-4 text-[#FF6B30]" />
                    <span>Skill yang Ingin Kamu Pelajari ({learnSkills.length})</span>
                  </div>
                  <button
                    onClick={() => setShowAddSkillModal('LEARN')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FF6B30] text-white text-xs font-bold hover:bg-[#E0531A] transition flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Skill Dipelajari</span>
                  </button>
                </div>

                {learnSkills.length === 0 ? (
                  <div className="p-6 text-center space-y-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-xs text-slate-500 font-medium italic">Belum ada target skill yang dipelajari ditambahkan.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {learnSkills.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-2xs hover:bg-white transition"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{s.skill.name}</span>
                          <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-[9px] mt-0.5">
                            {s.level}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteUserSkill(s.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition"
                          title="Hapus skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR PANEL (4 Cols): Profile Strength Score & AI Rank Guidance */}
          <div className="lg:col-span-4 space-y-6">
            {/* WIDGET 1: Skor Kekuatan Profil & AI Match Synergy Rank */}
            <div className="soft-card p-6 bg-white space-y-5 shadow-xs border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FF6B30]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Skor Kekuatan Profil</h3>
                </div>
                <span className="text-xs font-black text-[#FF6B30]">{profilePercent}%</span>
              </div>

              {/* Progress Ring / Bar */}
              <div className="space-y-2">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B30] to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${profilePercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {profilePercent >= 80
                    ? '🎉 Profil kamu sangat baik! Peringkat teratas pada algoritma AI Discovery.'
                    : 'Lengkapi seluruh item di bawah untuk meningkatkan visibilitas matching AI!'}
                </p>
              </div>

              {/* Interactive Completion Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-medium">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Nama & Email Terverifikasi</span>
                </div>
                <div className={`flex items-center gap-2 ${avatarUrl ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {avatarUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4" />}
                  <span>Foto Profil / Avatar Diunggah</span>
                </div>
                <div className={`flex items-center gap-2 ${bio ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {bio ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4" />}
                  <span>Bio Exchange & Goal Ditambahkan</span>
                </div>
                <div className={`flex items-center gap-2 ${country ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {country ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4" />}
                  <span>Lokasi Negara Dipilih</span>
                </div>
                <div className={`flex items-center gap-2 ${teachSkills.length > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {teachSkills.length > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4" />}
                  <span>Minimal 1 Skill Diajarkan Registered</span>
                </div>
              </div>
            </div>

            {/* WIDGET 2: Simbi Capybara Mascot Guidance */}
            <SimbiAvatar
              state="happy"
              message="Perbarui profil dan daftar skill kamu secara berkala untuk meningkatkan akurasi rekomendasi partner AI!"
            />

            {/* WIDGET 3: Account Verification Badge Info */}
            <div className="soft-card p-6 bg-slate-900 text-white space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Member Status Verified</h3>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Akun kamu terdaftar aktif di jaringan reciprocal skill exchange global Simbioly.
              </p>
              <div className="pt-2 text-[10px] text-slate-400 font-mono flex justify-between border-t border-slate-800">
                <span>100% Free monetary fees</span>
                <span>Deterministic match</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Skill Modal Panel */}
      {showAddSkillModal && (
        <AddSkillModal
          type={showAddSkillModal}
          allSkills={allSkills}
          newSkillId={newSkillId}
          customSkillName={customSkillName}
          newSkillLevel={newSkillLevel}
          addingSkill={addingSkill}
          onSelectSkill={(id, customName) => {
            setNewSkillId(id);
            if (customName !== undefined) setCustomSkillName(customName);
          }}
          onSelectLevel={(lvl) => setNewSkillLevel(lvl)}
          onClose={() => setShowAddSkillModal(false)}
          onSave={handleAddSkill}
        />
      )}
    </div>
  );
}
