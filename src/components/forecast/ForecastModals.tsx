import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Bot, 
  Send, 
  Calculator
} from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ForecastBaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// 1. Modal Công thức tính chi tiết
export const CalculationFormulaModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  return (
    <ForecastBaseModal isOpen={isOpen} onClose={onClose} title="Chi tiết công thức tính Nghĩa vụ thuế TNCN">
      <div className="space-y-4 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
          <Calculator className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-emerald-900 text-[11px] leading-relaxed">
            Số thuế hoàn lại được tính tự động theo quy tắc chuẩn: <strong>Số thuế đã tạm khấu trừ - Số thuế thực tế phải nộp cả năm</strong>.
          </p>
        </div>

        <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-600">1. Tổng thu nhập ghi nhận (3 nguồn):</span>
            <span className="font-bold text-slate-900 font-mono">280.000.000 VNĐ</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-600">2. Giảm trừ bản thân (11tr × 12 tháng):</span>
            <span className="font-bold text-slate-900 font-mono">- 132.000.000 VNĐ</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-600">3. Giảm trừ bảo hiểm bắt buộc:</span>
            <span className="font-bold text-slate-900 font-mono">- 23.100.000 VNĐ</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60 text-slate-700 font-semibold">
            <span>4. Thu nhập tính thuế (TNTT):</span>
            <span className="font-mono text-emerald-800">124.900.000 VNĐ</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-600">5. Thuế TNCN thực tế theo Biểu lũy tiến:</span>
            <span className="font-bold text-slate-900 font-mono">21.250.000 VNĐ</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-600">6. Tổng thuế đã tạm khấu trừ tại nguồn:</span>
            <span className="font-bold text-slate-900 font-mono">24.500.000 VNĐ</span>
          </div>

          <div className="flex justify-between py-1.5 pt-2 text-sm font-extrabold text-[#046a4e]">
            <span>Số tiền được Kho Bạc hoàn lại:</span>
            <span className="font-mono">+3.250.000 VNĐ</span>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#046a4e] text-white font-semibold rounded-xl hover:bg-[#03543e] cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </ForecastBaseModal>
  );
};

// 2. Modal Khắc phục Rủi ro trùng giảm trừ bản thân
export const FixRiskModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [selectedPlace, setSelectedPlace] = useState('abc');

  return (
    <ForecastBaseModal isOpen={isOpen} onClose={onClose} title="Khắc phục Rủi ro: Trùng giảm trừ bản thân">
      <div className="space-y-4 text-xs">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-amber-900 text-[11px] leading-relaxed">
            Hệ thống phát hiện cả 2 đơn vị chi trả đều tính mức giảm trừ gia cảnh bản thân (11tr/tháng). Hãy chọn <strong>01 nơi duy nhất</strong> để tính giảm trừ:
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="radio"
              name="deduction_place"
              checked={selectedPlace === 'abc'}
              onChange={() => setSelectedPlace('abc')}
              className="accent-[#046a4e]"
            />
            <div>
              <span className="font-bold text-slate-900 block">
                Công ty Cổ phần Công nghệ ABC (Khuyên dùng)
              </span>
              <span className="text-[11px] text-slate-400">
                Hợp đồng lao động trên 3 tháng có đóng BHXH, BHYT bắt buộc.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="radio"
              name="deduction_place"
              checked={selectedPlace === 'vinadesign'}
              onChange={() => setSelectedPlace('vinadesign')}
              className="accent-[#046a4e]"
            />
            <div>
              <span className="font-bold text-slate-900 block">
                Dự án Freelance UI/UX (Công ty VinaDesign)
              </span>
              <span className="text-[11px] text-slate-400">
                Thu nhập vãng lai khấu trừ 10% tại nguồn.
              </span>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              alert('Đã cập nhật chỉ định giảm trừ gia cảnh bản thân thành công!');
              onClose();
            }}
            className="px-4 py-2 bg-[#046a4e] text-white font-semibold rounded-xl hover:bg-[#03543e] cursor-pointer"
          >
            Lưu thay đổi & Cập nhật tờ khai
          </button>
        </div>
      </div>
    </ForecastBaseModal>
  );
};

// 3. Modal Tương tác Trợ lý Thuế AI
export const AiChatModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}> = ({ isOpen, onClose, initialQuestion = '' }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Xin chào anh Nam! Tôi là Trợ lý Luật sư Thuế AI. Tôi có thể hỗ trợ giải đáp quy chuẩn quyết toán theo Thông tư 80/2021/TT-BTC và tối ưu hồ sơ hoàn thuế của anh.'
    },
    ...(initialQuestion
      ? [
          { sender: 'user' as const, text: initialQuestion },
          {
            sender: 'bot' as const,
            text: 'Với câu hỏi này: Theo Điều 22 Luật Thuế TNCN, biểu thuế lũy tiến từng phần áp dụng 7 bậc từ 5% đến 35%. Do anh có tổng thu nhập 280 triệu và giảm trừ 155.1 triệu, mức thuế suất biên của anh rơi vào bậc 3 (15%).'
          }
        ]
      : [])
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userText = inputValue;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputValue('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Cảm ơn anh. Về vấn đề "${userText}": Hệ thống khuyến nghị anh rà soát chứng từ khấu trừ 10% tại nguồn của các hợp đồng vãng lai trước hạn 02/05/2025 để nộp tờ khai 02/QTT hợp lệ qua eTax Mobile.`
        }
      ]);
    }, 600);
  };

  return (
    <ForecastBaseModal isOpen={isOpen} onClose={onClose} title="Trợ lý Luật Thuế AI 24/7">
      <div className="flex flex-col h-96">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#046a4e] text-white rounded-tr-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập thắc mắc về thuế TNCN..."
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046a4e]/20"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-[#046a4e] hover:bg-[#03543e] text-white rounded-xl cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ForecastBaseModal>
  );
};
