'use client';

import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api/client';
import {
  Sparkles,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  BookOpen,
  GraduationCap,
  ListChecks,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface TargetUserSummary {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
}

interface PartnershipTopicItem {
  id: string;
  partnershipId: string;
  targetUserId: string;
  title: string;
  description: string | null;
  category: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  isAiGenerated: boolean;
  targetUser: TargetUserSummary;
}

interface ReciprocalRoadmapCardProps {
  partnershipId: string;
  myUserId: string;
  partnerName: string;
  socket: Socket | null;
}

export function ReciprocalRoadmapCard({
  partnershipId,
  myUserId,
  partnerName,
  socket,
}: ReciprocalRoadmapCardProps) {
  const [topics, setTopics] = useState<PartnershipTopicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [activeTabUserId, setActiveTabUserId] = useState<string>(myUserId);
  const [newTitle, setNewTitle] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);

  const fetchTopics = useCallback(async () => {
    try {
      const res = await apiFetch<{ topics: PartnershipTopicItem[] }>(
        `/partnerships/${partnershipId}/topics`
      );
      setTopics(res.topics);
    } catch (err) {
      console.error('Failed to load partnership topics:', err);
    } finally {
      setLoading(false);
    }
  }, [partnershipId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Real-time socket updates for topic checklist changes
  useEffect(() => {
    if (!socket) return;

    const handleTopicUpdated = () => {
      fetchTopics();
    };

    socket.on('topic_updated', handleTopicUpdated);
    return () => {
      socket.off('topic_updated', handleTopicUpdated);
    };
  }, [socket, fetchTopics]);

  const handleGenerateAiTopics = async () => {
    setGenerating(true);
    try {
      const res = await apiFetch<{ message: any }>(
        `/partnerships/${partnershipId}/topics/generate-proposal`,
        { method: 'POST' }
      );
      if (socket) {
        socket.emit('send_message', {
          partnershipId,
          senderId: myUserId,
          content: res.message.content,
        });
      }
      alert('Proposal AI Roadmap berhasil dikirim ke room chat! Silakan tinjau draf dan klik Approve di obrolan.');
    } catch (err) {
      console.error('Failed to generate AI proposal:', err);
      alert('Failed to generate AI proposal. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTopic = async (topicId: string) => {
    // Optimistic UI update
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t))
    );

    try {
      await apiFetch(`/partnerships/topics/${topicId}/toggle`, { method: 'PATCH' });
      if (socket) {
        socket.emit('topic_updated', { partnershipId });
      }
    } catch (err) {
      console.error(err);
      fetchTopics(); // Revert on error
    }
  };

  const handleAddManualTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setAdding(true);
    try {
      const res = await apiFetch<{ topic: PartnershipTopicItem }>(
        `/partnerships/${partnershipId}/topics`,
        {
          method: 'POST',
          body: JSON.stringify({
            targetUserId: activeTabUserId,
            title: newTitle.trim(),
          }),
        }
      );
      setTopics((prev) => [...prev, res.topic]);
      setNewTitle('');
      if (socket) {
        socket.emit('topic_updated', { partnershipId });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));

    try {
      await apiFetch(`/partnerships/topics/${topicId}`, { method: 'DELETE' });
      if (socket) {
        socket.emit('topic_updated', { partnershipId });
      }
    } catch (err) {
      console.error(err);
      fetchTopics();
    }
  };

  // Filter topics for the selected active tab user
  const activeTabTopics = topics.filter((t) => t.targetUserId === activeTabUserId);
  const myTopics = topics.filter((t) => t.targetUserId === myUserId);
  const partnerTopics = topics.filter((t) => t.targetUserId !== myUserId);

  const activeCategoryName = activeTabTopics[0]?.category || 'General Skill';
  const completedCount = activeTabTopics.filter((t) => t.isCompleted).length;
  const totalCount = activeTabTopics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="soft-card p-5 sm:p-6 bg-white space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF6B30] shadow-xs">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Roadmap & Checklist Topik Belajar</h3>
            <p className="text-xs text-slate-500 font-medium">Topik diskusi reciprocal exchange yang bisa dicentang bersama</p>
          </div>
        </div>

        <button
          onClick={handleGenerateAiTopics}
          disabled={generating}
          className="soft-button text-xs bg-sky-600 hover:bg-sky-700 flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating AI Roadmap...' : 'Generate AI Roadmap ✨'}</span>
        </button>
      </div>

      {/* User Tabs Switcher */}
      <div className="flex gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
        <button
          onClick={() => setActiveTabUserId(myUserId)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTabUserId === myUserId
              ? 'bg-[#FF6B30] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Saya Belajar ({myTopics[0]?.category || 'My Target Skill'})</span>
        </button>

        <button
          onClick={() => {
            const partnerId = topics.find((t) => t.targetUserId !== myUserId)?.targetUserId;
            if (partnerId) setActiveTabUserId(partnerId);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTabUserId !== myUserId
              ? 'bg-[#10B981] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{partnerName} Belajar ({partnerTopics[0]?.category || 'Partner Skill'})</span>
        </button>
      </div>

      {/* Progress Bar Display */}
      {totalCount > 0 && (
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Progres Belajar ({activeCategoryName}):</span>
            <span className="text-[#FF6B30]">{completedCount} / {totalCount} Topik ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Read-Only Notice when viewing Partner's Tab */}
      {activeTabUserId !== myUserId && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800 flex items-center gap-1.5 shadow-2xs">
          <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Ini adalah list belajar {partnerName}. Hanya {partnerName} yang dapat mencentang list miliknya.</span>
        </div>
      )}

      {/* Topic List Render */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-500 font-bold animate-pulse flex flex-col items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#FF6B30] animate-spin" />
          <span>Memuat roadmap topik belajar...</span>
        </div>
      ) : activeTabTopics.length === 0 ? (
        <div className="p-8 text-center space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
          <ListChecks className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">Belum Ada Topik Belajar Tersedia</p>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              Tekan tombol &quot;Generate AI Roadmap&quot; untuk membuat list topik obrolan otomatis, atau tambah topik manual di bawah!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {activeTabTopics.map((item) => {
            const isMyTopic = item.targetUserId === myUserId;
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition shadow-2xs ${
                  item.isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200/80 text-slate-600'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    disabled={!isMyTopic}
                    onClick={() => isMyTopic && handleToggleTopic(item.id)}
                    title={isMyTopic ? 'Ceklis topik ini' : `Hanya ${partnerName} yang dapat mencentang list miliknya`}
                    className={`mt-0.5 transition flex-shrink-0 ${
                      isMyTopic ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    {item.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </span>

                      {item.isAiGenerated && (
                        <span className="soft-badge bg-sky-50 text-sky-700 border-sky-200 text-[9px] px-2 py-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI Topic</span>
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-slate-500 font-medium">{item.description}</p>
                    )}
                  </div>
                </div>

                {isMyTopic && (
                  <button
                    onClick={() => handleDeleteTopic(item.id)}
                    className="text-slate-300 hover:text-red-500 transition p-1"
                    title="Hapus topik"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Tambah Topik Manual */}
      <form onSubmit={handleAddManualTopic} className="flex gap-2 pt-2 border-t border-slate-100">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={`Tambah topik obrolan baru untuk ${
            activeTabUserId === myUserId ? 'diri sendiri' : partnerName
          }...`}
          className="flex-1 px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1 shadow-2xs disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{adding ? 'Adding...' : 'Tambah Topik'}</span>
        </button>
      </form>
    </div>
  );
}
