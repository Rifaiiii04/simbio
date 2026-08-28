import { apiFetch } from '@/lib/api/client';

export interface Message {
  role: 'user' | 'simbi';
  text: string;
  timestamp?: number;
}

const STORAGE_PREFIX = 'simbi_chat_history_';
const inFlightRequests = new Set<string>();
const listeners = new Set<(candidateId: string) => void>();

function getStorageKey(candidateId: string): string {
  return `${STORAGE_PREFIX}${candidateId}`;
}

export function getCandidateMessages(candidateId: string): Message[] {
  if (typeof window === 'undefined' || !candidateId) return [];
  try {
    const raw = sessionStorage.getItem(getStorageKey(candidateId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isCandidateChatLoading(candidateId: string): boolean {
  return inFlightRequests.has(candidateId);
}

function saveCandidateMessages(candidateId: string, messages: Message[]) {
  if (typeof window === 'undefined' || !candidateId) return;
  try {
    sessionStorage.setItem(getStorageKey(candidateId), JSON.stringify(messages));
  } catch {
    // ignore
  }
}

function notifyListeners(candidateId: string) {
  listeners.forEach((fn) => {
    try {
      fn(candidateId);
    } catch {
      // ignore
    }
  });
}

export function subscribeToSimbiChat(listener: (candidateId: string) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function sendSimbiConsultMessage(candidateId: string, text: string): Promise<void> {
  if (!candidateId || !text.trim() || inFlightRequests.has(candidateId)) return;

  const userMsg: Message = { role: 'user', text: text.trim(), timestamp: Date.now() };
  const current = getCandidateMessages(candidateId);
  const updated = [...current, userMsg];
  saveCandidateMessages(candidateId, updated);

  inFlightRequests.add(candidateId);
  notifyListeners(candidateId);

  try {
    const res = await apiFetch<{ reply: string }>('/ai/simbi/match-consult', {
      method: 'POST',
      body: JSON.stringify({ candidateId, message: text.trim() }),
    });

    const currentAfter = getCandidateMessages(candidateId);
    const updatedWithReply = [
      ...currentAfter,
      { role: 'simbi' as const, text: res.reply, timestamp: Date.now() },
    ];
    saveCandidateMessages(candidateId, updatedWithReply);
  } catch {
    const currentAfter = getCandidateMessages(candidateId);
    const updatedWithError = [
      ...currentAfter,
      {
        role: 'simbi' as const,
        text: 'Sorry, Simbi is temporarily unavailable. Please try again shortly.',
        timestamp: Date.now(),
      },
    ];
    saveCandidateMessages(candidateId, updatedWithError);
  } finally {
    inFlightRequests.delete(candidateId);
    notifyListeners(candidateId);
  }
}
