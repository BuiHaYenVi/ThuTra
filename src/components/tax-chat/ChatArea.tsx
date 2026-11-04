import React, { useRef, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  Share2, 
  SlidersHorizontal, 
  Lightbulb, 
  ShieldCheck, 
  CheckCheck, 
  Sparkles,
  Bot
} from 'lucide-react';
import type { ChatMessage, PromptChip } from '../../data/mockChatData';
import { mockPromptChips } from '../../data/mockChatData';
import { ChatInputBar } from './ChatInputBar';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSelectPromptChip: (chip: PromptChip) => void;
  onExportPdf?: () => void;
  onShareChat?: () => void;
  onSettingsClick?: () => void;
  onAttachFile?: () => void;
  onCaptureCamera?: () => void;
  onVoiceInput?: () => void;
  isAiTyping?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  onSelectPromptChip,
  onExportPdf,
  onShareChat,
  onSettingsClick,
  onAttachFile,
  onCaptureCamera,
  onVoiceInput,
  isAiTyping = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col h-full min-h-[760px] overflow-hidden">
      {/* 1. Chatbot Top Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#046a4e] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-sm tracking-tight">
                ThuTra AI - Trợ lý Luật Thuế TNCN
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Hệ thống giải đáp chuyên sâu các trường hợp làm song song, freelance vãng lai và tối ưu hoàn thuế.
            </p>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          {/* Law Badge */}
          <div className="hidden sm:inline-flex bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-medium px-2.5 py-1.5 rounded-xl">
            Luật QLT 2019 &nbsp;•&nbsp; TT 111/2013 &nbsp;•&nbsp; TT 80/2021
          </div>

          {/* Export PDF */}
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-red-500" />
            <span>Xuất PDF tư vấn</span>
          </button>

          {/* Settings / Filters */}
          <button
            onClick={onSettingsClick}
            title="Tùy chỉnh phân tích"
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Share */}
          <button
            onClick={onShareChat}
            title="Chia sẻ phiên tư vấn"
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Chat Scroll Container */}
      <div 
        ref={scrollRef} 
        className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/40"
      >
        {/* Quick Prompt Chips */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Gợi ý câu hỏi phổ biến cho kỳ quyết toán 2024:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {mockPromptChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => onSelectPromptChip(chip)}
                className="bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-300 rounded-xl px-3 py-2 text-left text-xs text-slate-700 transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
              >
                <span className="text-sm shrink-0">{chip.icon}</span>
                <span className="truncate group-hover:text-emerald-900 font-medium">
                  {chip.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        {messages.map((msg) => {
          // A. Greeting from Bot
          if (msg.type === 'greeting') {
            return (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#046a4e] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Building2 className="w-4 h-4 text-emerald-100" />
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 max-w-2xl space-y-3 shadow-2xs">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Xin chào anh <strong className="text-slate-900 font-bold">Nguyễn Hoàng Nam</strong>! Tôi là trợ lý pháp lý AI của hệ thống ThuTra. Tôi sẵn sàng hỗ trợ rà soát các hợp đồng, mức trích nộp 10% và phương án quyết toán trực tiếp tối ưu nhất cho kỳ tính thuế này.
                  </p>

                  <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 px-3 flex items-start gap-2 text-[11px] text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Dữ liệu trao đổi được mã hóa chuẩn ngành tài chính. Bạn có thể đính kèm sao kê hoặc chứng từ điện tử mẫu 123 để bóc tách số liệu tự động.
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          // B. User Message
          if (msg.type === 'user') {
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-1">
                <div className="flex items-start gap-2.5 max-w-xl">
                  <div className="bg-[#0F172A] text-white text-xs sm:text-[13px] rounded-2xl rounded-tr-xs p-3.5 px-4 shadow-sm leading-relaxed">
                    {msg.text}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 ring-2 ring-emerald-500/20 overflow-hidden mt-0.5">
                    <span className="bg-[#046a4e] text-white w-full h-full flex items-center justify-center text-xs font-bold">
                      HN
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 pr-10">
                  <span>Đã gửi {msg.timestamp}</span>
                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                </div>
              </div>
            );
          }

          // C. AI Legal Analysis Message
          if (msg.type === 'legal_analysis' && msg.legalAnalysis) {
            const { title, badge, points, conclusion, legalReferences } = msg.legalAnalysis;
            return (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#046a4e] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Building2 className="w-4 h-4 text-emerald-100" />
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 max-w-2xl space-y-3.5 shadow-2xs">
                  {/* Message Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight">
                        {title}
                      </h3>
                      <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Phản hồi lúc {msg.timestamp}
                    </span>
                  </div>

                  {/* Points list */}
                  <div className="space-y-3 text-xs text-slate-700">
                    {points.map((pt) => (
                      <div key={pt.num} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-[#046a4e] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {pt.num}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900">
                            {pt.title}
                          </h4>
                          <p className="leading-relaxed text-slate-600">
                            {pt.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conclusion / Legal Basis */}
                  {conclusion && (
                    <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-3 text-[11px] text-emerald-950 leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#046a4e]">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kết luận &amp; Khuyến nghị từ ThuTra:</span>
                      </div>
                      <p>{conclusion}</p>
                    </div>
                  )}

                  {legalReferences && legalReferences.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                      <span>Căn cứ pháp lý:</span>
                      {legalReferences.map((ref, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Fallback regular bot message
          return (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#046a4e] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Bot className="w-4 h-4 text-emerald-100" />
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 max-w-xl text-xs text-slate-700 shadow-2xs">
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isAiTyping && (
          <div className="flex items-start gap-3 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-[#046a4e] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-4 h-4 text-emerald-100 animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 px-4 shadow-2xs flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>ThuTra AI đang tra cứu Thông tư 111 &amp; Thông tư 80/2021...</span>
              <span className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce delay-200"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Chat Input Bar */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-100">
        <ChatInputBar
          onSendMessage={onSendMessage}
          onAttachFile={onAttachFile}
          onCaptureCamera={onCaptureCamera}
          onVoiceInput={onVoiceInput}
          disabled={isAiTyping}
        />
      </div>
    </div>
  );
};
