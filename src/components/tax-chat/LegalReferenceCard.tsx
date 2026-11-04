import React from 'react';
import { BookOpen } from 'lucide-react';
import { mockLegalDocuments } from '../../data/mockChatData';
import type { LegalDocument } from '../../data/mockChatData';

interface LegalReferenceCardProps {
  onViewAll?: () => void;
  onSelectDoc?: (doc: LegalDocument) => void;
}

export const LegalReferenceCard: React.FC<LegalReferenceCardProps> = ({
  onViewAll,
  onSelectDoc
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#046a4e] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Văn bản Pháp luật áp dụng
          </h3>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-slate-600 hover:text-[#046a4e] transition-colors cursor-pointer hover:underline"
        >
          Xem tất cả
        </button>
      </div>

      {/* 2. Documents List */}
      <div className="space-y-2.5">
        {mockLegalDocuments.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelectDoc && onSelectDoc(doc)}
            className="border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 rounded-xl p-3 space-y-1.5 transition-all cursor-pointer group shadow-2xs"
          >
            {/* Top row: Badge & Issuer */}
            <div className="flex items-center justify-between text-[10px]">
              <span className={`font-bold px-1.5 py-0.2 rounded ${doc.docTypeBadgeColor}`}>
                {doc.docType}
              </span>
              <span className="text-slate-400 font-medium">
                {doc.issuer}
              </span>
            </div>

            {/* Document Title */}
            <h4 className="font-extrabold text-slate-900 text-xs group-hover:text-[#046a4e] transition-colors leading-tight">
              {doc.code}
            </h4>

            {/* Snippet */}
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
              {doc.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
