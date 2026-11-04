import React, { useState } from 'react';
import { 
  Paperclip, 
  Camera, 
  Mic, 
  Send, 
  ShieldCheck 
} from 'lucide-react';

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  onAttachFile?: () => void;
  onCaptureCamera?: () => void;
  onVoiceInput?: () => void;
  disabled?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  onAttachFile,
  onCaptureCamera,
  onVoiceInput,
  disabled = false
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="pt-2">
      {/* 1. Large Rounded Input Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 transition-all focus-within:ring-2 focus-within:ring-[#046a4e]/20 focus-within:border-[#046a4e]"
      >
        {/* Left Attachment Buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1 pl-1">
          <button
            type="button"
            onClick={onAttachFile}
            title="Đính kèm tài liệu / chứng từ mẫu 123"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Paperclip className="w-4 h-4 rotate-45" />
          </button>

          <button
            type="button"
            onClick={onCaptureCamera}
            title="Chụp ảnh chứng từ thuế"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Center Input Field */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cách đăng ký giảm trừ người phụ thuộc cho bố mẹ đã về hưu thì cần giấy tờ gì?"
            disabled={disabled}
            className="w-full bg-transparent text-xs sm:text-[13px] text-slate-800 placeholder-slate-400 outline-none px-2 py-1.5"
          />
        </div>

        {/* Right Voice & Send Buttons */}
        <div className="flex items-center gap-1 pr-1">
          <button
            type="button"
            onClick={onVoiceInput}
            title="Nhập bằng giọng nói"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!inputText.trim() || disabled}
            aria-label="Gửi tin nhắn"
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all shadow-xs cursor-pointer ${
              inputText.trim() && !disabled
                ? 'bg-[#046a4e] hover:bg-[#03543e] active:scale-95'
                : 'bg-slate-300 cursor-not-allowed text-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* 2. Disclaimer Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-2 px-1 text-[10px] text-slate-400 leading-tight">
        <div className="flex items-start sm:items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            ThuTra AI tự động trích dẫn căn cứ luật hiện hành. Vui lòng đối chiếu với Cơ quan thuế có thẩm quyền khi có yếu tố tranh chấp hợp đồng.
          </span>
        </div>
        <div className="text-slate-400 shrink-0 font-medium">
          Phiên bản LLM Pháp lý v3.5.2
        </div>
      </div>
    </div>
  );
};
