'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { GlowCard } from '@/components/ui/GlowCard';
import { SearchableSkillSelect } from '@/components/ui/SearchableSkillSelect';
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

  // Handle local File Upload for profile picture
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
      setMessage('Profile & Settings updated successfully!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to update profile');
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
      setMessage(err instanceof Error ? err.message : 'Failed to add skill');
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
      <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF7A30] font-black text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Loading user profile & portfolio...</span>
          </div>
        </div>
      </div>
    );
  }

  const teachSkills = userSkills.filter((s) => s.type === 'TEACH');
  const learnSkills = userSkills.filter((s) => s.type === 'LEARN');

  // Calculate profile completion percentage
  let profilePercent = 40;
  if (profile?.bio) profilePercent += 20;
  if (profile?.country) profilePercent += 20;
  if (profile?.avatarUrl) profilePercent += 20;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#0F172A] selection:bg-[#FACC15]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Profile Header Hero Card */}
        <div className="neo-box bg-[#FFFDF7] p-6 sm:p-8 space-y-6 shadow-[8px_8px_0px_0px_#0F172A]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Photo Container */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#FF7A30] border-3 border-[#0F172A] overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_0px_#0F172A] flex-shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-white">{name.charAt(0)}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-xl bg-[#FACC15] border-2 border-[#0F172A] flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_#0F172A] hover:bg-[#FF7A30] transition">
                <Camera className="w-4 h-4 text-[#0F172A]" />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A]">{name}</h1>
                <span className="neo-badge bg-[#84CC16] text-[#0F172A] text-[10px] px-2.5 py-0.5 flex items-center gap-1 w-fit mx-auto sm:mx-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Learner</span>
                </span>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs font-bold text-gray-700">
                {username && <span className="text-[#FF7A30] font-black">@{username}</span>}
                <span className="neo-badge bg-[#06B6D4] text-white px-2.5 py-0.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{country}</span>
                </span>
                <span className="text-gray-500 font-bold">{profile?.email}</span>
              </div>

              {/* Profile Completion Bar */}
              <div className="space-y-1.5 pt-2 max-w-md">
                <div className="flex justify-between text-[11px] font-black text-[#0F172A]">
                  <span>Profile Completion</span>
                  <span className="text-[#FF7A30]">{profilePercent}%</span>
                </div>
                <div className="w-full h-3 bg-white rounded-xl border-2 border-[#0F172A] overflow-hidden p-0.5 shadow-[2px_2px_0px_0px_#0F172A]">
                  <div
                    className="h-full bg-[#FF7A30] rounded-lg transition-all duration-500 border border-[#0F172A]"
                    style={{ width: `${profilePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <SimbiAvatar
            state="happy"
            message="Keep your profile, country, and skills updated to rank #1 in global AI exchange matching algorithms!"
          />
        </div>

        {message && (
          <div className="p-3.5 text-xs text-[#0F172A] bg-[#84CC16] rounded-xl border-2 border-[#0F172A] flex items-center gap-2 font-black shadow-[3px_3px_0px_0px_#0F172A]">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Main Grid: Form (2 cols) vs Skills Portfolio (1 col) */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Identity & Profile Settings Form */}
          <div className="md:col-span-2 neo-box p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_#0F172A]">
            <div className="flex items-center gap-2 border-b-2 border-[#0F172A] pb-3">
              <UserIcon className="w-5 h-5 text-[#FF7A30]" />
              <h2 className="text-lg font-black text-[#0F172A]">Personal Identity & Location</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Photo Avatar Preset & Upload Section */}
              <div className="space-y-2 bg-[#FFF5EF] p-4 rounded-xl border-2 border-[#0F172A]">
                <label className="block text-xs font-black text-[#0F172A]">Profile Picture / Avatar</label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-2">
                    {presetAvatars.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 border-[#0F172A] transition ${
                          avatarUrl === url ? 'ring-3 ring-[#FF7A30] scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Preset avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Upload className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Paste image URL or pick preset above..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border-2 border-[#0F172A] font-bold focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0F172A] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden focus:border-[#FF7A30]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#0F172A] mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_morgan"
                    className="w-full px-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden focus:border-[#FF7A30]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#0F172A] mb-1">Country / Region</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden focus:border-[#FF7A30]"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0F172A] mb-1">Exchange Bio & Goals</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Share your learning passion, experience, and what you wish to exchange..."
                  className="w-full px-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden focus:border-[#FF7A30]"
                />
              </div>

              {/* Distance Discovery Toggle */}
              <div className="p-4 rounded-xl bg-white border-2 border-[#0F172A] space-y-2 shadow-[3px_3px_0px_0px_#0F172A]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-[#0F172A]">Enable Proximity Matching</h3>
                    <p className="text-[10px] text-gray-600 font-bold">Allow nearest learner matching via distance calculation.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={locationEnabled}
                    onChange={(e) => setLocationEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#FF7A30] rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full neo-button py-3.5 text-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile & Settings'}</span>
              </button>
            </form>
          </div>

          {/* Right Column (1 Col): Skills Portfolio Management */}
          <div className="space-y-6">
            {/* Skills You Teach */}
            <div className="neo-box p-6 space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
              <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Skills You Teach ({teachSkills.length})</span>
                </div>
                <button
                  onClick={() => setShowAddSkillModal('TEACH')}
                  className="px-2.5 py-1 rounded-lg bg-[#84CC16] text-[#0F172A] border-2 border-[#0F172A] text-[10px] font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_0px_#0F172A] hover:bg-[#FACC15]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Skill</span>
                </button>
              </div>

              {teachSkills.length === 0 ? (
                <p className="text-xs text-gray-500 font-bold italic">No teach skills added yet.</p>
              ) : (
                <div className="space-y-2">
                  {teachSkills.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-white border-2 border-[#0F172A] flex items-center justify-between shadow-[2px_2px_0px_0px_#0F172A]"
                    >
                      <div>
                        <span className="text-xs font-black text-[#0F172A] block">{s.skill.name}</span>
                        <span className="text-[9px] font-black text-emerald-600 uppercase">{s.level}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteUserSkill(s.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills You Want to Learn */}
            <div className="neo-box p-6 space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
              <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#FF7A30] uppercase tracking-wider">
                  <Award className="w-4 h-4 text-[#FF7A30]" />
                  <span>Skills You Learn ({learnSkills.length})</span>
                </div>
                <button
                  onClick={() => setShowAddSkillModal('LEARN')}
                  className="px-2.5 py-1 rounded-lg bg-[#FF7A30] text-white border-2 border-[#0F172A] text-[10px] font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_0px_#0F172A] hover:bg-[#FACC15] hover:text-[#0F172A]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Skill</span>
                </button>
              </div>

              {learnSkills.length === 0 ? (
                <p className="text-xs text-gray-500 font-bold italic">No learn skills added yet.</p>
              ) : (
                <div className="space-y-2">
                  {learnSkills.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-white border-2 border-[#0F172A] flex items-center justify-between shadow-[2px_2px_0px_0px_#0F172A]"
                    >
                      <div>
                        <span className="text-xs font-black text-[#0F172A] block">{s.skill.name}</span>
                        <span className="text-[9px] font-black text-[#FF7A30] uppercase">{s.level}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteUserSkill(s.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Skill Modal Panel */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md neo-box p-6 space-y-4 shadow-[8px_8px_0px_0px_#0F172A] bg-white">
            <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
              <h3 className="text-base font-black text-[#0F172A]">
                Add Skill to {showAddSkillModal === 'TEACH' ? 'Teach' : 'Learn'}
              </h3>
              <button onClick={() => setShowAddSkillModal(false)} className="text-xs font-black">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black mb-1">Select Skill</label>
                <SearchableSkillSelect
                  skills={allSkills}
                  selectedSkillId={newSkillId}
                  customSkillName={customSkillName}
                  onSelectSkill={(id, customName) => {
                    setNewSkillId(id);
                    if (customName !== undefined) setCustomSkillName(customName);
                  }}
                  placeholder="Type to search skill..."
                />
              </div>

              <div>
                <label className="block text-xs font-black mb-1">Proficiency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].slice(0, 3).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewSkillLevel(lvl)}
                      className={`p-2.5 rounded-xl text-xs font-black border-2 border-[#0F172A] ${
                        newSkillLevel === lvl ? 'bg-[#FF7A30] text-white' : 'bg-white text-[#0F172A]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="w-1/3 py-2.5 rounded-xl bg-gray-100 border-2 border-[#0F172A] text-xs font-black"
              >
                Cancel
              </button>
              <button
                disabled={addingSkill || !newSkillId}
                onClick={handleAddSkill}
                className="w-2/3 neo-button py-2.5 text-xs"
              >
                {addingSkill ? 'Adding...' : 'Save Skill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
