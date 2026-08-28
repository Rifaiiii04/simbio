'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

export function DiscoveryPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  startIndex,
  endIndex,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 pb-2 text-xs text-neutral-400">
      <p className="font-medium">
        Showing <span className="text-white font-bold">{Math.min(startIndex + 1, totalItems)}</span> to{' '}
        <span className="text-white font-bold">{Math.min(endIndex, totalItems)}</span> of{' '}
        <span className="text-white font-bold">{totalItems}</span> Candidates
      </p>

      <div className="flex items-center gap-1.5">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-[#121214] border border-neutral-800 hover:bg-[#18181B] text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer flex items-center justify-center ${
                isActive
                  ? 'bg-[#FF6B30] text-white shadow-md shadow-[#FF6B30]/30'
                  : 'bg-[#121214] border border-neutral-800 text-neutral-400 hover:text-white hover:bg-[#18181B]'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-[#121214] border border-neutral-800 hover:bg-[#18181B] text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
