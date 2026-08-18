'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { SearchableSkillSelect } from '@/components/ui/SearchableSkillSelect';
import { ArrowRight, ArrowLeft, Rocket, Plus, X, BookOpen, Award, CheckCircle2, MapPin, Loader2 } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category?: { name: string };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Multi-skill selection arrays (Max 5 items each)
  const [teachSkillIds, setTeachSkillIds] = useState<string[]>([]);
  const [teachLevel, setTeachLevel] = useState('INTERMEDIATE');

  const [learnSkillIds, setLearnSkillIds] = useState<string[]>([]);
  const [learnLevel, setLearnLevel] = useState('BEGINNER');

  const [goalTitle, setGoalTitle] = useState('');
  const [targetOutcome, setTargetOutcome] = useState('');

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('simbioly_token');
    if (!token) {
      router.push('/login');
      return;
    }

    apiFetch<{ skills: Skill[] }>('/skills')
      .then((res) => setSkills(res.skills))
      .catch((err) => setError(err.message));
  }, [router]);

  const handleAddTeachSkill = (skillId: string) => {
    if (!skillId || skillId === 'OTHER') return;
    if (teachSkillIds.includes(skillId)) return;
    if (teachSkillIds.length >= 5) {
      setError('Maksimal 5 skill yang bisa kamu ajarkan.');
      return;
    }
    setError(null);
    setTeachSkillIds((prev) => [...prev, skillId]);
  };

  const handleRemoveTeachSkill = (skillId: string) => {
    setTeachSkillIds((prev) => prev.filter((id) => id !== skillId));
  };

  const handleAddLearnSkill = (skillId: string) => {
    if (!skillId || skillId === 'OTHER') return;
    if (learnSkillIds.includes(skillId)) return;
    if (learnSkillIds.length >= 5) {
      setError('Maksimal 5 skill yang ingin kamu pelajari.');
      return;
    }
    setError(null);
    setLearnSkillIds((prev) => [...prev, skillId]);
  };

  const handleRemoveLearnSkill = (skillId: string) => {
    setLearnSkillIds((prev) => prev.filter((id) => id !== skillId));
  };

  const handleCompleteOnboarding = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // 1. Save all Teach Skills (Max 5)
      for (const skillId of teachSkillIds) {
        try {
          await apiFetch('/skills/me/skills', {
            method: 'POST',
            body: JSON.stringify({ skillId, type: 'TEACH', level: teachLevel }),
          });
        } catch {
          // Gracefully skip duplicates
        }
      }

      // 2. Save all Learn Skills (Max 5)
      for (const skillId of learnSkillIds) {
        try {
          await apiFetch('/skills/me/skills', {
            method: 'POST',
            body: JSON.stringify({ skillId, type: 'LEARN', level: learnLevel }),
          });
        } catch {
          // Gracefully skip duplicates
        }
      }

      // 3. Create Learning Goal
      if (learnSkillIds.length > 0 && goalTitle) {
        await apiFetch<{ goal: { id: string } }>('/goals', {
          method: 'POST',
          body: JSON.stringify({
            skillId: learnSkillIds[0],
            title: goalTitle,
            targetOutcome,
          }),
        });
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Proses registrasi target skill gagal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 flex flex-col justify-center my-6">
        <div className="soft-card p-6 sm:p-10 space-y-6 bg-white border border-slate-200/80 shadow-xs">
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>LANGKAH {step} DARI 5</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-6 h-2 rounded-full transition-all ${
                    s <= step ? 'bg-[#FF6B30]' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3.5 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 font-bold">
              {error}
            </div>
          )}

          {/* STEP 1: Skills You Can Teach (Max 5) */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                  Reciprocal Teach Skills (Maks 5)
                </span>
                <h2 className="text-2xl font-black text-slate-900">Skill Apa Yang Bisa Kamu Ajarkan?</h2>
                <p className="text-xs text-slate-500 font-medium">Pilih hingga 5 keahlian yang kamu kuasai untuk diajarkan ke partner.</p>
              </div>

              <SimbiAvatar state="happy" message="Pilih skill yang kamu kuasai! Kamu bisa memilih hingga 5 skill mengajar." />

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">Pilih Skill Mengajar</label>
                    <span className="text-[11px] font-bold text-[#FF6B30]">{teachSkillIds.length}/5 Skill Dipilih</span>
                  </div>
                  <SearchableSkillSelect
                    skills={skills}
                    selectedSkillId=""
                    onSelectSkill={(id) => handleAddTeachSkill(id)}
                    placeholder="Pilih skill untuk diajarkan..."
                  />
                </div>

                {/* Selected Teach Skill Badges List */}
                {teachSkillIds.length > 0 && (
                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Skill Mengajar Terpilih ({teachSkillIds.length}/5):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {teachSkillIds.map((id) => {
                        const s = skills.find((item) => item.id === id);
                        return (
                          <span
                            key={id}
                            className="soft-badge bg-white text-emerald-900 border-emerald-300 text-xs px-3 py-1 font-bold flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>{s?.name || id}</span>
                            <button onClick={() => handleRemoveTeachSkill(id)} className="text-emerald-500 hover:text-red-600">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                disabled={teachSkillIds.length === 0}
                onClick={() => setStep(2)}
                className={`w-full soft-button py-3.5 text-xs flex items-center justify-center gap-2 shadow-2xs font-bold ${
                  teachSkillIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>Lanjut: Skill Yang Ingin Dipelajari</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Skills You Want to Learn (Max 5) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-xs font-bold">
                  Reciprocal Learn Skills (Maks 5)
                </span>
                <h2 className="text-2xl font-black text-slate-900">Skill Apa Yang Ingin Kamu Pelajari?</h2>
                <p className="text-xs text-slate-500 font-medium">Pilih hingga 5 keahlian utama yang ingin kamu kuasai dari partner.</p>
              </div>

              <SimbiAvatar state="thinking" message="Hebat! Sekarang pilih hingga 5 skill yang ingin kamu pelajari." />

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">Pilih Skill Pelajaran</label>
                    <span className="text-[11px] font-bold text-[#FF6B30]">{learnSkillIds.length}/5 Skill Dipilih</span>
                  </div>
                  <SearchableSkillSelect
                    skills={skills}
                    selectedSkillId=""
                    onSelectSkill={(id) => handleAddLearnSkill(id)}
                    placeholder="Pilih skill untuk dipelajari..."
                  />
                </div>

                {/* Selected Learn Skill Badges List */}
                {learnSkillIds.length > 0 && (
                  <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200/60 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#FF6B30] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#FF6B30]" />
                      <span>Skill Pelajaran Terpilih ({learnSkillIds.length}/5):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {learnSkillIds.map((id) => {
                        const s = skills.find((item) => item.id === id);
                        return (
                          <span
                            key={id}
                            className="soft-badge bg-white text-orange-900 border-orange-300 text-xs px-3 py-1 font-bold flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>{s?.name || id}</span>
                            <button onClick={() => handleRemoveLearnSkill(id)} className="text-orange-500 hover:text-red-600">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  <span>Kembali</span>
                </button>
                <button
                  disabled={learnSkillIds.length === 0}
                  onClick={() => setStep(3)}
                  className={`w-2/3 soft-button py-3 text-xs flex items-center justify-center gap-2 font-bold ${
                    learnSkillIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>Lanjut: Aktifkan Lokasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Location Consent */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="soft-badge bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold">
                  Fitur Peta Terdekat
                </span>
                <h2 className="text-2xl font-black text-slate-900">Mau Ditemukan di Peta? 🗺️</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Aktifkan lokasi untuk muncul di peta discovery dan ditemukan oleh partner di sekitarmu. Kamu bisa menonaktifkannya kapan saja.
                </p>
              </div>

              <SimbiAvatar state="happy" message="Aktifkan lokasi supaya partner di dekatmu bisa langsung menemukanmu di peta! 📍" />

              <div className="space-y-3">
                {/* Location benefit cards */}
                <div className="grid gap-3">
                  {[
                    { icon: '📍', title: 'Muncul di Peta Discovery', desc: 'Partner di sekitarmu bisa menemukan profilmu langsung dari peta.' },
                    { icon: '🤝', title: 'Prioritas Lokal', desc: 'Profilmu muncul lebih awal untuk pencarian di sekitar wilayahmu.' },
                    { icon: '🔒', title: 'Privasi Terjaga', desc: 'Koordinat disimpan aman. Tidak ada tracking terus-menerus.' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xl shrink-0">{item.icon}</span>
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
                    <span className="text-xs font-bold text-emerald-700">Lokasi berhasil diaktifkan! Kamu akan muncul di peta. ✅</span>
                  </div>
                )}

                {locationError && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-xs font-bold text-red-700">{locationError}</p>
                  </div>
                )}

                {!locationEnabled && (
                  <button
                    onClick={() => {
                      if (!navigator.geolocation) {
                        setLocationError('Browser tidak mendukung geolocation.');
                        return;
                      }
                      setLocationLoading(true);
                      setLocationError(null);
                      navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                          try {
                            await apiFetch('/users/me/location', {
                              method: 'PUT',
                              body: JSON.stringify({
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude,
                                locationEnabled: true,
                              }),
                            });
                            setLocationEnabled(true);
                          } catch {
                            setLocationError('Gagal menyimpan lokasi. Coba lagi.');
                          } finally {
                            setLocationLoading(false);
                          }
                        },
                        (err) => {
                          setLocationLoading(false);
                          setLocationError(
                            err.code === 1
                              ? 'Izin lokasi ditolak. Aktifkan izin di browser lalu coba lagi.'
                              : 'Gagal mendapatkan lokasi.',
                          );
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
                      );
                    }}
                    disabled={locationLoading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-600 transition shadow-md disabled:opacity-60"
                  >
                    {locationLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Mendapatkan Lokasi...</span></>
                      : <><MapPin className="w-4 h-4" /><span>Ya, Aktifkan Lokasimu Sekarang</span></>}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  <span>Kembali</span>
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="w-2/3 soft-button py-3 text-xs flex items-center justify-center gap-2 font-bold"
                >
                  <span>{locationEnabled ? 'Lanjut: Target Goal' : 'Lewati, Nanti Saja'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Define Goal */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Tentukan Target Goal Belajar</h2>
                <p className="text-xs text-slate-500 font-medium">Apa hasil spesifik yang ingin kamu capai dalam sesi exchange?</p>
              </div>

              <SimbiAvatar state="working" message="Target goal yang jelas membantu partner memahami fokus belajar kamu!" />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Judul Target Goal</label>
                  <input
                    type="text"
                    required
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="Contoh: Menguasai dasar React.js dan membuat portofolio aplikasi"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Target Outcome (Opsional)</label>
                  <textarea
                    value={targetOutcome}
                    onChange={(e) => setTargetOutcome(e.target.value)}
                    rows={3}
                    placeholder="Contoh: Siap melamar kerja sebagai junior developer atau membangun proyek koding mandiri"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  <span>Kembali</span>
                </button>
                <button
                  disabled={!goalTitle}
                  onClick={() => setStep(5)}
                  className={`w-2/3 soft-button py-3 text-xs flex items-center justify-center gap-2 font-bold ${
                    !goalTitle ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>Lanjut: Konfirmasi Registrasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Summary Confirmation */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Siap Untuk Memulai Swap!</h2>
                <p className="text-xs text-slate-500 font-medium">Periksa kembali daftar skill yang kamu daftarkan.</p>
              </div>

              <SimbiAvatar state="cheering" message="Klik selesai di bawah untuk langsung menjelajahi Swap Deck partner reciprocal!" />

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs font-bold">
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Target Goal Utama:</span>
                  <p className="text-slate-900 text-sm font-black">{goalTitle}</p>
                </div>

                <div>
                  <span className="text-emerald-700 uppercase text-[10px]">Bisa Mengajar ({teachSkillIds.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teachSkillIds.map((id) => (
                      <span key={id} className="soft-badge bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                        {skills.find((s) => s.id === id)?.name || id}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[#FF6B30] uppercase text-[10px]">Ingin Dipelajari ({learnSkillIds.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {learnSkillIds.map((id) => (
                      <span key={id} className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-[10px]">
                        {skills.find((s) => s.id === id)?.name || id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={submitting}
                onClick={handleCompleteOnboarding}
                className="w-full soft-button py-4 text-sm flex items-center justify-center gap-2 font-bold shadow-md"
              >
                {submitting ? (
                  <span>Menyimpan data kamu...</span>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 text-white" />
                    <span>Selesai & Masuk Ke Dashboard Swap</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
