import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

interface RuleEngineScanningModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const RuleEngineScanningModal: React.FC<RuleEngineScanningModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [phase, setPhase] = useState<number>(0); // 0: init, 1: step 1 done, 2: step 2 done, 3: step 3 done & all valid

  useEffect(() => {
    if (!isOpen) {
      setPhase(0);
      return;
    }

    setPhase(0);

    // Timeline over 1.5 seconds (1500ms)
    // 0ms -> Step 1 running
    // 400ms -> Step 1 done, Step 2 running
    const t1 = setTimeout(() => {
      setPhase(1);
    }, 450);

    // 900ms -> Step 2 done, Step 3 running
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 900);

    // 1350ms -> Step 3 done, all 15 rules valid!
    const t3 = setTimeout(() => {
      setPhase(3);
    }, 1350);

    // 1550ms -> Navigate to Step 3
    const t4 = setTimeout(() => {
      onComplete();
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ThuTra AI Rule Engine 2024</span>
        </div>

        {/* Header */}
        <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight mt-1">
          Đang Rà Soát Quyết Toán Thuế TNCN
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          Tự động kiểm tra đối soát 15 quy tắc pháp lý và xác định Chi cục Thuế tiếp nhận theo Thông tư 80.
        </p>

        {/* Circular Radar Scanning Animation */}
        <div className="relative w-36 h-36 rounded-full border-2 border-emerald-500/30 bg-emerald-950/40 flex items-center justify-center my-6 overflow-hidden shadow-[0_0_35px_rgba(16,185,129,0.25)]">
          {/* Concentric rings */}
          <div className="absolute w-26 h-26 rounded-full border border-emerald-500/20" />
          <div className="absolute w-16 h-16 rounded-full border border-emerald-500/25" />
          <div className="absolute w-6 h-6 rounded-full border border-emerald-500/30" />

          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-emerald-500/20" />
          <div className="absolute h-full w-[1px] bg-emerald-500/20" />

          {/* Radar sweeping cone (360 degree spin) */}
          <div 
            className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(16,185,129,0.55)_0deg,transparent_65deg)] animate-spin"
            style={{ animationDuration: '1.2s' }}
          />

          {/* Radar target blips */}
          <div className="absolute top-7 right-8 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="absolute bottom-8 left-9 w-1.5 h-1.5 rounded-full bg-teal-300" />
          <div className="absolute top-12 left-7 w-1 h-1 rounded-full bg-emerald-200" />

          {/* Radar center dot */}
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981] z-10" />
        </div>

        {/* Automated Checklist Running in Realtime */}
        <div className="w-full space-y-2.5 text-left text-xs bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          {/* Check Item 1 */}
          <div className="flex items-center justify-between gap-3">
            <span className={`transition-colors duration-200 ${
              phase >= 1 ? 'text-slate-200 font-medium' : 'text-emerald-300 font-semibold'
            }`}>
              Đang đối soát trùng lặp giảm trừ gia cảnh...
            </span>
            <div className="shrink-0">
              {phase >= 1 ? (
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px]">Hợp lệ</span>
                </div>
              ) : (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              )}
            </div>
          </div>

          {/* Check Item 2 */}
          <div className="flex items-center justify-between gap-3">
            <span className={`transition-colors duration-200 ${
              phase === 1 
                ? 'text-emerald-300 font-semibold' 
                : phase >= 2 
                  ? 'text-slate-200 font-medium' 
                  : 'text-slate-500'
            }`}>
              Đang kiểm tra định dạng MST người phụ thuộc...
            </span>
            <div className="shrink-0">
              {phase >= 2 ? (
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px]">Chuẩn CCCD</span>
                </div>
              ) : phase === 1 ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <span className="text-slate-600 text-xs">...</span>
              )}
            </div>
          </div>

          {/* Check Item 3 */}
          <div className="flex items-center justify-between gap-3">
            <span className={`transition-colors duration-200 ${
              phase === 2 
                ? 'text-emerald-300 font-semibold' 
                : phase >= 3 
                  ? 'text-slate-200 font-medium' 
                  : 'text-slate-500'
            }`}>
              Đang xác định Chi cục Thuế tiếp nhận theo Thông tư 80...
            </span>
            <div className="shrink-0">
              {phase >= 3 ? (
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px]">Đã định tuyến</span>
                </div>
              ) : phase === 2 ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <span className="text-slate-600 text-xs">...</span>
              )}
            </div>
          </div>
        </div>

        {/* Completion Result Banner */}
        <div className={`mt-4 w-full py-2 px-3 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 ${
          phase >= 3 
            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 scale-100 opacity-100' 
            : 'opacity-0 scale-95 pointer-events-none'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-extrabold text-xs">
            Hoàn tất! 15/15 rules hợp lệ
          </span>
        </div>
      </div>
    </div>
  );
};
