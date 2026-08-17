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
      const res = await apiFetch<{ topics: PartnershipTopicItem[] }>(
        `/partnerships/${partnershipId}/topics/generate-ai`,
        { method: 'POST' }
      );
      setTopics(res.topics);
      if (socket) {
        socket.emit('topic_updated', { partnershipId });
      }
    } catch (err) {
      console.error('Failed to generate AI topics:', err);
      alert('Failed to generate AI topics. Please try again.');
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
    <div className="neo-box p-5 sm:p-6 bg-white space-y-5 shadow-[6px_6px_0px_0px_#0F172A]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0F172A] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FACC15] border-2 border-[#0F172A] flex items-center justify-center text-[#0F172A] shadow-[2px_2px_0px_0px_#0F172A]">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#0F172A]">Roadmap & Checklist Topik Belajar</h3>
            <p className="text-xs text-gray-600 font-bold">Topik diskusi reciprocal exchange yang bisa dicentang bersama</p>
          </div>
        </div>

        <button
          onClick={handleGenerateAiTopics}
          disabled={generating}
          className="px-4 py-2.5 rounded-xl bg-[#06B6D4] text-white border-2 border-[#0F172A] text-xs font-black hover:bg-cyan-600 transition flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#0F172A] disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating AI Roadmap...' : 'Generate AI Roadmap ✨'}</span>
        </button>
      </div>

      {/* User Tabs Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTabUserId(myUserId)}
          className={`flex-1 py-2.5 px-3 rounded-xl border-2 border-[#0F172A] text-xs font-black flex items-center justify-center gap-2 transition ${
            activeTabUserId === myUserId
              ? 'bg-[#FF7A30] text-white shadow-[3px_3px_0px_0px_#0F172A]'
              : 'bg-white text-[#0F172A] hover:bg-gray-100'
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
          className={`flex-1 py-2.5 px-3 rounded-xl border-2 border-[#0F172A] text-xs font-black flex items-center justify-center gap-2 transition ${
            activeTabUserId !== myUserId
              ? 'bg-[#84CC16] text-[#0F172A] shadow-[3px_3px_0px_0px_#0F172A]'
              : 'bg-white text-[#0F172A] hover:bg-gray-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{partnerName} Belajar ({partnerTopics[0]?.category || 'Partner Skill'})</span>
        </button>
      </div>

      {/* Progress Bar Display */}
      {totalCount > 0 && (
        <div className="space-y-1.5 p-3 rounded-xl bg-[#FFFDF7] border-2 border-[#0F172A]">
          <div className="flex items-center justify-between text-xs font-black text-[#0F172A]">
            <span>Progres Belajar ({activeCategoryName}):</span>
            <span className="text-[#FF7A30]">{completedCount} / {totalCount} Topik ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full border border-[#0F172A] overflow-hidden">
            <div
              className="h-full bg-[#84CC16] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Read-Only Notice when viewing Partner's Tab */}
      {activeTabUserId !== myUserId && (
        <div className="p-2.5 rounded-xl bg-amber-50 border-2 border-[#0F172A] text-[11px] font-bold text-[#0F172A] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]">
          <Lock className="w-3.5 h-3.5 text-[#FF7A30] flex-shrink-0" />
          <span>Ini adalah list belajar {partnerName}. Hanya {partnerName} yang dapat mencentang list miliknya.</span>
        </div>
      )}

      {/* Topic List Render */}
      {loading ? (
        <div className="py-8 text-center text-xs text-gray-500 font-black animate-pulse flex flex-col items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#FF7A30] animate-spin" />
          <span>Memuat roadmap topik belajar...</span>
        </div>
      ) : activeTabTopics.length === 0 ? (
        <div className="p-8 text-center space-y-3 rounded-xl border-2 border-dashed border-[#0F172A] bg-[#FFFDF7]">
          <ListChecks className="w-10 h-10 text-gray-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-black text-[#0F172A]">Belum Ada Topik Belajar Tersedia</p>
            <p className="text-xs text-gray-600 font-bold max-w-sm mx-auto">
              Tekan tombol &quot;Generate AI Roadmap&quot; untuk membuat list topik obrolan otomatis, atau tambah topik manual di bawah!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeTabTopics.map((item) => {
            const isMyTopic = item.targetUserId === myUserId;
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border-2 border-[#0F172A] flex items-start justify-between gap-3 transition shadow-[2px_2px_0px_0px_#0F172A] ${
                  item.isCompleted ? 'bg-emerald-50/70 opacity-80' : 'bg-[#FFFDF7]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    disabled={!isMyTopic}
                    onClick={() => isMyTopic && handleToggleTopic(item.id)}
                    title={isMyTopic ? 'Ceklis topik ini' : `Hanya ${partnerName} yang dapat mencentang list miliknya`}
                    className={`mt-0.5 text-[#0F172A] transition flex-shrink-0 ${
                      isMyTopic ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    {item.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-[#84CC16]" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black ${
                        item.isCompleted ? 'line-through text-gray-500' : 'text-[#0F172A]'
                      }`}
                    >
                      {item.title}
                    </span>

                    {item.isAiGenerated && (
                      <span className="neo-badge bg-[#06B6D4] text-white text-[9px] px-2 py-0.5 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Topic</span>
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-[11px] text-gray-600 font-bold">{item.description}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDeleteTopic(item.id)}
                className="text-gray-400 hover:text-red-500 transition p-1"
                title="Hapus topik"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        </div>
      )}

      {/* Form Tambah Topik Manual */}
      <form onSubmit={handleAddManualTopic} className="flex gap-2 pt-2 border-t-2 border-[#0F172A]">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={`Tambah topik obrolan baru untuk ${
            activeTabUserId === myUserId ? 'diri sendiri' : partnerName
          }...`}
          className="flex-1 px-3.5 py-2.5 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold text-[#0F172A] focus:outline-hidden focus:border-[#FF7A30] shadow-[2px_2px_0px_0px_#0F172A]"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#FACC15] text-[#0F172A] border-2 border-[#0F172A] text-xs font-black hover:bg-amber-400 transition flex items-center gap-1 shadow-[2px_2px_0px_0px_#0F172A] disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{adding ? 'Adding...' : 'Tambah Topik'}</span>
        </button>
      </form>
    </div>
  );
}
