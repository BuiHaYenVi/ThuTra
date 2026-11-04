import React from 'react';
import { Bot, ChevronRight } from 'lucide-react';
import { mockAiPrompts } from '../../data/mockForecastData';
import type { AiPrompt } from '../../data/mockForecastData';

interface AiAssistantWidgetProps {
  onSelectPrompt?: (prompt: AiPrompt) => void;
  onOpenFullChat?: () => void;
}

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({
  onSelectPrompt,
  onOpenFullChat
}) => {
  return (
    <div className="bg-[#f5f3ff] border border-indigo-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs tracking-tight">
                Trợ lý Thuế AI 24/7
              </h3>
              <p className="text-[10px] text-slate-500">
                Giải đáp luật thuế Việt Nam tức thì
              </p>
            </div>
          </div>

          {/* Green Online status */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
          </div>
        </div>

        {/* Intro */}
        <p className="text-[11px] text-slate-500 leading-tight my-2.5">
          Bấm vào câu hỏi phổ biến để trợ lý ảo hướng dẫn chính xác cho hồ sơ của bạn:
        </p>

        {/* Prompt List */}
        <div className="space-y-1.5">
          {mockAiPrompts.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectPrompt && onSelectPrompt(item)}
              className="w-full bg-white hover:bg-indigo-50/60 border border-indigo-100/80 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 py-2 px-3 rounded-xl text-left text-xs font-medium transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate pr-2">{item.question}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Link: Nhập câu hỏi tự do */}
      <button
        onClick={onOpenFullChat}
        className="mt-3 text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline block text-center cursor-pointer"
      >
        <span>Nhập câu hỏi tự do cho Luật sư AI →</span>
      </button>
    </div>
  );
};
