'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api/client';
import { toast } from 'sonner';
import {
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  Edit2,
  Check,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

interface DraftTopicItem {
  id: string;
  targetUserId: string;
  targetUserName: string;
  category: string;
  title: string;
  description?: string;
}

interface ProposalPayload {
  type: string;
  proposalId: string;
  status: 'PENDING' | 'APPROVED';
  createdByUserId: string;
  createdByName: string;
  approvedByUserId?: string;
  approvedByUsers?: string[];
  approvedAt?: string;
  topics: DraftTopicItem[];
}

interface RoadmapProposalCardProps {
  partnershipId: string;
  myUserId: string;
  partnerName: string;
  messageId: string;
  content: string;
  socket: Socket | null;
  onApproved?: () => void;
}

export function RoadmapProposalCard({
  partnershipId,
  myUserId,
  partnerName,
  messageId,
  content,
  socket,
  onApproved,
}: RoadmapProposalCardProps) {
  let payload: ProposalPayload | null = null;
  try {
    payload = JSON.parse(content);
  } catch {
    payload = null;
  }

  const [topics, setTopics] = useState<DraftTopicItem[]>(payload?.topics || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTargetUserId, setNewTargetUserId] = useState<string>(myUserId);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content);
      if (parsed?.topics) {
        setTopics(parsed.topics);
      }
    } catch {}
  }, [content]);

  if (!payload || payload.type !== 'ROADMAP_PROPOSAL') {
    return <div className="text-xs text-slate-500">{content}</div>;
  }

  const isPending = payload.status === 'PENDING';
  const isApproved = payload.status === 'APPROVED';

  const handleSaveDraftUpdate = async (updated: DraftTopicItem[]) => {
    setTopics(updated);
    if (!isPending) return;

    try {
      const res = await apiFetch<{ message: { content: string } }>(
        `/partnerships/${partnershipId}/topics/proposals/${messageId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ topics: updated }),
        }
      );
      if (socket && res.message) {
        socket.emit('update_message', { partnershipId, message: res.message });
      }
    } catch (err) {
      console.error('Failed to sync proposal draft edit:', err);
    }
  };

  const handleStartEdit = (topic: DraftTopicItem) => {
    setEditingId(topic.id);
    setEditingTitle(topic.title);
  };

  const handleSaveTitleEdit = (id: string) => {
    if (!editingTitle.trim()) return;
    const updated = topics.map((t) => (t.id === id ? { ...t, title: editingTitle.trim() } : t));
    setEditingId(null);
    handleSaveDraftUpdate(updated);
  };

  const handleDeleteDraftItem = (id: string) => {
    const updated = topics.filter((t) => t.id !== id);
    handleSaveDraftUpdate(updated);
  };

  const handleAddDraftItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: DraftTopicItem = {
      id: `custom-${Date.now()}`,
      targetUserId: newTargetUserId,
      targetUserName: newTargetUserId === myUserId ? 'Me' : partnerName,
      category: 'Custom Topic',
      title: newTitle.trim(),
    };

    const updated = [...topics, newItem];
    setNewTitle('');
    handleSaveDraftUpdate(updated);
  };

  const approvedByUsers: string[] = payload.approvedByUsers || [];
  const hasIApproved = approvedByUsers.includes(myUserId);
  const approvedCount = approvedByUsers.length;

  const handleApproveProposal = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch<{ isFullyApproved: boolean; message: { content: string } }>(
        `/partnerships/${partnershipId}/topics/proposals/${messageId}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({ topics }),
        }
      );

      if (socket) {
        if (res.message) {
          socket.emit('update_message', { partnershipId, message: res.message });
        }
        if (res.isFullyApproved) {
          socket.emit('topic_updated', { partnershipId });
        }
      }

      if (onApproved) onApproved();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to approve proposal');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Group topics by target user
  const myDrafts = topics.filter((t) => t.targetUserId === myUserId);
  const partnerDrafts = topics.filter((t) => t.targetUserId !== myUserId);

  return (
    <div className="w-full max-w-lg soft-card bg-white p-4 sm:p-5 space-y-4 border border-slate-200/90 shadow-md my-2 text-slate-900 rounded-2xl">
      {/* Proposal Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-bold shadow-2xs">
            <Sparkles className="w-4.5 h-4.5 text-sky-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">AI Learning Roadmap Proposal</h4>
            <p className="text-[11px] text-slate-500 font-medium">Proposed by {payload.createdByName}</p>
          </div>
        </div>

        <span
          className={`soft-badge text-[10px] px-2.5 py-1 font-bold ${
            isApproved
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isApproved ? 'APPROVED' : `${approvedCount}/2 APPROVALS`}
        </span>
      </div>

      {/* Topics Draft List */}
      <div className="space-y-3">
        {/* User A Drafts (My Learning) */}
        <div className="space-y-2 p-3 rounded-xl bg-orange-50/40 border border-orange-200/60">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF6B30] uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>My Learning Topics ({myDrafts[0]?.category || 'Target Skill'}):</span>
          </div>
          <div className="space-y-1.5 pt-0.5">
            {myDrafts.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between gap-2 text-xs font-semibold shadow-2xs text-slate-800"
              >
                {editingId === item.id ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-[#FF6B30] rounded-md font-medium focus:outline-hidden bg-slate-50"
                    />
                    <button
                      onClick={() => handleSaveTitleEdit(item.id)}
                      className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 truncate">{item.title}</span>
                    {isPending && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="text-slate-400 hover:text-sky-600 p-1 rounded transition cursor-pointer"
                          title="Edit title"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDraftItem(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded transition cursor-pointer"
                          title="Delete topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User B Drafts (Partner Learning) */}
        <div className="space-y-2 p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/60">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{partnerName}&apos;s Learning Topics ({partnerDrafts[0]?.category || 'Target Skill'}):</span>
          </div>
          <div className="space-y-1.5 pt-0.5">
            {partnerDrafts.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between gap-2 text-xs font-semibold shadow-2xs text-slate-800"
              >
                {editingId === item.id ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-[#FF6B30] rounded-md font-medium focus:outline-hidden bg-slate-50"
                    />
                    <button
                      onClick={() => handleSaveTitleEdit(item.id)}
                      className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 truncate">{item.title}</span>
                    {isPending && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="text-slate-400 hover:text-sky-600 p-1 rounded transition cursor-pointer"
                          title="Edit title"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDraftItem(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded transition cursor-pointer"
                          title="Delete topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Custom Draft Form (If Pending) */}
      {isPending && (
        <form onSubmit={handleAddDraftItem} className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <select
              value={newTargetUserId}
              onChange={(e) => setNewTargetUserId(e.target.value)}
              className="text-[11px] font-bold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
            >
              <option value={myUserId}>For My Learning</option>
              <option value={topics.find((t) => t.targetUserId !== myUserId)?.targetUserId || 'partner'}>
                For {partnerName}&apos;s Learning
              </option>
            </select>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add/edit draft topic..."
              className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
            />

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-40 shrink-0"
              title="Add draft topic"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* Approval Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {isApproved ? (
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 w-full justify-center shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Roadmap Proposal Approved by Both Partners & Added to Checklist!</span>
          </div>
        ) : hasIApproved ? (
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-2 w-full justify-center shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
            <span>Waiting for Approval from {partnerName}... ({approvedCount}/2 Approved)</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleApproveProposal}
            className="w-full py-2.5 rounded-xl bg-[#FF6B30] hover:bg-[#E0531A] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Approving...' : `Approve Roadmap Proposal (${approvedCount}/2 Approved)`}</span>
          </button>
        )}
      </div>
    </div>
  );
}
