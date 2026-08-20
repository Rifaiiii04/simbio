'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api/client';
import {
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  Send,
  Edit2,
  Check,
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
    return <div className="text-xs text-gray-500">{content}</div>;
  }

  const isPending = payload.status === 'PENDING';
  const isApproved = payload.status === 'APPROVED';

  const handleSaveDraftUpdate = async (updated: DraftTopicItem[]) => {
    setTopics(updated);
    if (!isPending) return;

    try {
      const res = await apiFetch<{ message: any }>(
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
      targetUserName: newTargetUserId === myUserId ? 'Saya' : partnerName,
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
      const res = await apiFetch<{ isFullyApproved: boolean; message: any }>(
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
    } catch (err: any) {
      alert(err.message || 'Failed to approve proposal');
    } finally {
      setSubmitting(false);
    }
  };

  // Group topics by target user
  const myDrafts = topics.filter((t) => t.targetUserId === myUserId);
  const partnerDrafts = topics.filter((t) => t.targetUserId !== myUserId);

  return (
    <div className="w-full max-w-lg neo-box bg-white p-5 space-y-4 border-2 border-[#0F172A] shadow-[6px_6px_0px_0px_#0F172A] my-2 text-[#0F172A]">
      {/* Proposal Card Header */}
      <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#06B6D4] border-2 border-[#0F172A] text-white flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0F172A]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#0F172A]">AI Learning Roadmap Proposal</h4>
            <p className="text-[11px] text-gray-600 font-bold">Created by {payload.createdByName}</p>
          </div>
        </div>

        <span
          className={`neo-badge text-[10px] px-2.5 py-1 font-black ${
            isApproved
              ? 'bg-[#84CC16] text-[#0F172A]'
              : 'bg-[#FACC15] text-[#0F172A]'
          }`}
        >
          {isApproved
            ? 'APPROVED'
            : `${approvedCount}/2 APPROVALS`}
        </span>
      </div>

      {/* Topics Draft List */}
      <div className="space-y-3">
        {/* User A Drafts (My Learning) */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#FFFDF7] border-2 border-[#0F172A]">
          <span className="text-[11px] font-black text-[#FF7A30] uppercase">
            My Learning Topics ({myDrafts[0]?.category || 'Target Skill'}):
          </span>
          <div className="space-y-1.5 pt-1">
            {myDrafts.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-white border border-[#0F172A] flex items-center justify-between gap-2 text-xs font-bold shadow-[2px_2px_0px_0px_#0F172A]"
              >
                {editingId === item.id ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-[#0F172A] rounded-md font-bold focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleSaveTitleEdit(item.id)}
                      className="p-1 bg-[#84CC16] text-white rounded-md border border-[#0F172A] cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-[#0F172A]" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {isPending && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="text-gray-400 hover:text-cyan-600 p-0.5 cursor-pointer"
                          title="Edit title"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDraftItem(item.id)}
                          className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                          title="Delete draft item"
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
        <div className="space-y-1.5 p-3 rounded-xl bg-[#FFFDF7] border-2 border-[#0F172A]">
          <span className="text-[11px] font-black text-[#84CC16] uppercase">
            {partnerName}&apos;s Learning Topics ({partnerDrafts[0]?.category || 'Target Skill'}):
          </span>
          <div className="space-y-1.5 pt-1">
            {partnerDrafts.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-white border border-[#0F172A] flex items-center justify-between gap-2 text-xs font-bold shadow-[2px_2px_0px_0px_#0F172A]"
              >
                {editingId === item.id ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-[#0F172A] rounded-md font-bold focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleSaveTitleEdit(item.id)}
                      className="p-1 bg-[#84CC16] text-white rounded-md border border-[#0F172A] cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-[#0F172A]" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {isPending && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="text-gray-400 hover:text-cyan-600 p-0.5 cursor-pointer"
                          title="Edit title"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDraftItem(item.id)}
                          className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                          title="Delete draft item"
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
        <form onSubmit={handleAddDraftItem} className="space-y-2 pt-2 border-t-2 border-[#0F172A]">
          <div className="flex items-center gap-2">
            <select
              value={newTargetUserId}
              onChange={(e) => setNewTargetUserId(e.target.value)}
              className="text-[11px] font-bold px-2 py-1.5 bg-white border-2 border-[#0F172A] rounded-lg focus:outline-hidden"
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
              className="flex-1 px-3 py-1.5 text-xs bg-white rounded-lg border-2 border-[#0F172A] font-bold focus:outline-hidden"
            />

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 rounded-lg bg-[#FACC15] border-2 border-[#0F172A] text-xs font-black hover:bg-amber-400 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Approval Action Footer */}
      <div className="pt-3 border-t-2 border-[#0F172A] flex items-center justify-between">
        {isApproved ? (
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border-2 border-[#0F172A] text-xs font-black flex items-center gap-2 w-full justify-center shadow-[2px_2px_0px_0px_#0F172A]">
            <CheckCircle2 className="w-4.5 h-4.5 text-[#84CC16]" />
            <span>Roadmap Proposal Approved by Both Partners & Added to Learning Checklist!</span>
          </div>
        ) : hasIApproved ? (
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border-2 border-[#0F172A] text-xs font-black flex items-center gap-2 w-full justify-center shadow-[2px_2px_0px_0px_#0F172A]">
            <Clock className="w-4 h-4 text-[#FF7A30] animate-spin" />
            <span>Waiting for Approval from {partnerName}... ({approvedCount}/2 Approved)</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleApproveProposal}
            className="w-full py-3 rounded-xl bg-[#84CC16] text-[#0F172A] border-2 border-[#0F172A] text-xs font-black hover:bg-emerald-400 transition flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#0F172A] cursor-pointer"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>{submitting ? 'Approving...' : `Approve Roadmap Proposal (${approvedCount}/2 Approved)`}</span>
          </button>
        )}
      </div>
    </div>
  );
}
