'use client';

import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api/client';
import { toast } from 'sonner';
import {
  Sparkles,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  BookOpen,
  GraduationCap,
  ListChecks,
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

  const hasIncompleteTopics = topics.length > 0 && topics.some((t) => !t.isCompleted);

  const handleGenerateAiTopics = async () => {
    if (hasIncompleteTopics) {
      toast.warning(
        'You currently have an active roadmap with in-progress topics! Please complete all topics in the checklist first before generating a new AI roadmap, or manage them manually.'
      );
      return;
    }

    setGenerating(true);
    try {
      const res = await apiFetch<{ message: { content: string } }>(
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
      toast.success('AI Roadmap proposal sent to room chat! Review the draft and click Approve in the conversation.');
    } catch (err: unknown) {
      console.error('Failed to generate AI proposal:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to generate AI proposal. Please try again.';
      toast.error(errMsg);
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
        socket.emit('topic_changed', { partnershipId, topicId });
      }
    } catch (err) {
      console.error('Failed to toggle topic:', err);
      fetchTopics();
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    setTopics((prev) => prev.filter((t) => t.id !== topicId));

    try {
      await apiFetch(`/partnerships/topics/${topicId}`, { method: 'DELETE' });
      if (socket) {
        socket.emit('topic_changed', { partnershipId, topicId });
      }
    } catch (err) {
      console.error('Failed to delete topic:', err);
      fetchTopics();
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
            category: activeTabTopics[0]?.category || 'Custom Skill',
          }),
        }
      );
      setTopics((prev) => [...prev, res.topic]);
      setNewTitle('');
      if (socket) {
        socket.emit('topic_changed', { partnershipId, topicId: res.topic.id });
      }
    } catch (err) {
      console.error('Failed to add manual topic:', err);
    } finally {
      setAdding(false);
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
    <div className="soft-card p-4 sm:p-5 bg-white flex flex-col h-full min-h-0 overflow-hidden shadow-xs">
      {/* 1. FIXED HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF6B30] shadow-xs shrink-0">
            <ListChecks className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              Learning Roadmap & Topics Checklist
            </h3>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Mutual reciprocal learning milestones to track progress together
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateAiTopics}
          disabled={generating || hasIncompleteTopics}
          title={
            hasIncompleteTopics
              ? 'Complete all current checklist topics before generating a new roadmap'
              : 'Generate AI Roadmap Proposal'
          }
          className="soft-button text-xs py-2 px-3.5 bg-[#FF6B30] hover:bg-[#E0531A] text-white font-bold flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating...' : 'Generate AI Roadmap'}</span>
        </button>
      </div>

      {/* 2. FIXED USER TABS SWITCHER */}
      <div className="pt-3 shrink-0">
        <div className="flex gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setActiveTabUserId(myUserId)}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer truncate ${
              activeTabUserId === myUserId
                ? 'bg-[#FF6B30] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">My Learning ({myTopics[0]?.category || 'My Skill'})</span>
          </button>

          <button
            onClick={() => {
              const partnerId = topics.find((t) => t.targetUserId !== myUserId)?.targetUserId;
              if (partnerId) setActiveTabUserId(partnerId);
            }}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer truncate ${
              activeTabUserId !== myUserId
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{partnerName}&apos;s Learning ({partnerTopics[0]?.category || 'Partner Skill'})</span>
          </button>
        </div>
      </div>

      {/* 3. FIXED PROGRESS BAR DISPLAY */}
      {totalCount > 0 && (
        <div className="pt-2.5 shrink-0">
          <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="truncate">Learning Progress ({activeCategoryName}):</span>
              <span className="text-[#FF6B30] shrink-0">{completedCount}/{totalCount} ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10B981] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. FIXED READ-ONLY NOTICE FOR PARTNER TAB */}
      {activeTabUserId !== myUserId && (
        <div className="pt-2 shrink-0">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800 flex items-center gap-1.5 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>This is {partnerName}&apos;s checklist. Only {partnerName} can complete their own milestones.</span>
          </div>
        </div>
      )}

      {/* 5. SCROLLABLE TOPICS LIST ONLY */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 py-3 pr-1">
        {loading ? (
          <div className="py-10 text-center text-xs text-slate-500 font-bold animate-pulse flex flex-col items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6B30] animate-spin" />
            <span>Loading roadmap topics...</span>
          </div>
        ) : activeTabTopics.length === 0 ? (
          <div className="p-8 text-center space-y-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
            <ListChecks className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900">No Learning Topics Available</p>
              <p className="text-[11px] text-slate-500 font-medium max-w-sm mx-auto">
                Click &quot;Generate AI Roadmap&quot; or add custom topics manually below!
              </p>
            </div>
          </div>
        ) : (
          activeTabTopics.map((item) => {
            const isMyTopic = item.targetUserId === myUserId;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 transition shadow-2xs ${
                  item.isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200/80 text-slate-600'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <button
                    disabled={!isMyTopic}
                    onClick={() => isMyTopic && handleToggleTopic(item.id)}
                    title={isMyTopic ? 'Toggle topic completion' : `Only ${partnerName} can complete their own milestones`}
                    className={`mt-0.5 transition shrink-0 ${
                      isMyTopic ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    {item.isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </button>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-bold ${
                          item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </span>

                      {item.isAiGenerated && (
                        <span className="soft-badge bg-sky-50 text-sky-700 border-sky-200 text-[9px] px-1.5 py-0">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI Topic</span>
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>

                {isMyTopic && (
                  <button
                    onClick={() => handleDeleteTopic(item.id)}
                    className="text-slate-300 hover:text-red-500 transition p-1 shrink-0 cursor-pointer"
                    title="Delete topic"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. FIXED FORM ADD MANUAL TOPIC AT BOTTOM */}
      <form onSubmit={handleAddManualTopic} className="flex gap-2 pt-2.5 border-t border-slate-100 shrink-0">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={`Add new milestone topic for ${
            activeTabUserId === myUserId ? 'yourself' : partnerName
          }...`}
          className="flex-1 min-w-0 px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1 shadow-2xs disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{adding ? 'Adding...' : 'Add Topic'}</span>
        </button>
      </form>
    </div>
  );
}
