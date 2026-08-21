'use client';

import { useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Socket } from 'socket.io-client';
import { BookOpen, Clock, X } from 'lucide-react';
import { ReciprocalRoadmapCard } from './ReciprocalRoadmapCard';
import { FocusTimerCard } from './FocusTimerCard';

interface MobileRoomSidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarTab: 'ROADMAP' | 'FOCUS';
  setSidebarTab: (tab: 'ROADMAP' | 'FOCUS') => void;
  isFocusModeActive: boolean;
  partnershipId: string;
  myUserId: string;
  partnerName: string;
  socket: Socket | null;
  onFocusStateChange: (isActive: boolean) => void;
}

export function MobileRoomSidebarModal({
  isOpen,
  onClose,
  sidebarTab,
  setSidebarTab,
  isFocusModeActive,
  partnershipId,
  myUserId,
  partnerName,
  socket,
  onFocusStateChange,
}: MobileRoomSidebarModalProps) {
  const [isSheetExpanded, setIsSheetExpanded] = useState<boolean>(false);

  const handleClose = () => {
    setIsSheetExpanded(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
          />

          {/* Draggable Bottom Sheet Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{
              y: 0,
              height: isSheetExpanded ? '92vh' : '70vh',
            }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg mx-auto bg-white rounded-t-[28px] flex flex-col shadow-2xl z-10 overflow-hidden border-t border-slate-200"
          >
            {/* Drag Handle & Gesture Area */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.4}
              onDragEnd={(_e, info: PanInfo) => {
                // Drag UP: Expand to full view
                if (info.offset.y < -30 || info.velocity.y < -200) {
                  setIsSheetExpanded(true);
                }
                // Drag DOWN
                else if (info.offset.y > 40 || info.velocity.y > 200) {
                  if (isSheetExpanded) {
                    setIsSheetExpanded(false);
                  } else {
                    handleClose();
                  }
                }
              }}
              className="pt-2.5 pb-1 flex flex-col items-center justify-center shrink-0 cursor-grab active:cursor-grabbing select-none touch-none group"
              title={isSheetExpanded ? 'Swipe down to minimize' : 'Swipe up to expand'}
            >
              <div
                onClick={() => setIsSheetExpanded((prev) => !prev)}
                className="w-12 h-1.5 bg-slate-300 group-hover:bg-slate-400 group-active:bg-[#FF6B30] rounded-full transition-colors cursor-pointer"
              />
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {isSheetExpanded ? 'Swipe down to collapse' : 'Swipe up to expand'}
              </span>
            </motion.div>

            {/* Sheet Header & Tabs */}
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="p-1 bg-slate-100 rounded-xl grid grid-cols-2 gap-1 flex-1 mr-2">
                <button
                  type="button"
                  onClick={() => setSidebarTab('ROADMAP')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    sidebarTab === 'ROADMAP' ? 'bg-[#FF6B30] text-white shadow-xs' : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Roadmap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('FOCUS')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 relative cursor-pointer ${
                    sidebarTab === 'FOCUS' ? 'bg-[#FF6B30] text-white shadow-xs' : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Focus Session</span>
                  {isFocusModeActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute right-1.5 top-1.5" />
                  )}
                </button>
              </div>

              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sheet Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {sidebarTab === 'ROADMAP' ? (
                <ReciprocalRoadmapCard
                  partnershipId={partnershipId}
                  myUserId={myUserId}
                  partnerName={partnerName}
                  socket={socket}
                />
              ) : (
                <FocusTimerCard
                  partnershipId={partnershipId}
                  myUserId={myUserId}
                  partnerName={partnerName}
                  socket={socket}
                  onFocusStateChange={onFocusStateChange}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
