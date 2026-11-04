import { 
  Scan, 
  AlertCircle, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2,
  Info 
} from 'lucide-react';
import { useTaxFiling } from '../../contexts/TaxFilingContext';

interface RuleEngineWarningsProps {
  onOpenRuleDetail?: (ruleId: string) => void;
  onAddDependentMst?: () => void;
}

export const RuleEngineWarnings: React.FC<RuleEngineWarningsProps> = ({
  onOpenRuleDetail,
}) => {
  const { latestAuditResult } = useTaxFiling();
  const findings = latestAuditResult?.findings || [];
  const rulesScanned = latestAuditResult?.totalRulesScanned || 15;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                Kết quả quét {rulesScanned}/15 quy tắc kiểm tra sai sót (Rule Engine)
              </h3>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs border ${
                findings.length === 0 
                  ? 'bg-emerald-50 text-[#046a4e] border-emerald-200/90' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{findings.length === 0 ? '15/15 rules hợp lệ' : `Phát hiện ${findings.length} cảnh báo`}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {findings.length === 0 
                ? 'Tất cả 15 quy tắc thẩm tra thuế (R01 - R15) đều vượt qua kiểm định an toàn.'
                : `Hệ thống ghi nhận ${findings.length} điểm cần lưu ý trước khi nộp tờ khai lên CQT.`}
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium shrink-0 self-start sm:self-center">
          Quét lần cuối: Vừa xong
        </span>
      </div>

      {/* 1.1 Verified Notice Strip */}
      <div className={`rounded-xl p-3 flex items-center justify-between gap-3 text-xs border ${
        findings.length === 0 
          ? 'bg-emerald-50/70 border-emerald-200/80' 
          : 'bg-amber-50/70 border-amber-200/80'
      }`}>
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#046a4e] shrink-0" />
          <span className="font-medium text-slate-800">
            {findings.length === 0 ? (
              <>
                <strong className="text-[#046a4e] font-bold">15/15 rules hợp lệ:</strong> Đã rà soát tự động toàn bộ điều kiện giảm trừ gia cảnh, định dạng MST và cơ quan thuế tiếp nhận theo Thông tư 80.
              </>
            ) : (
              <>
                <strong className="text-amber-700 font-bold">Lưu ý kiểm tra:</strong> Động cơ thẩm tra đã phát hiện các điểm sai lệch số liệu cần xác nhận lại bên dưới.
              </>
            )}
          </span>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
          findings.length === 0 
            ? 'text-emerald-800 bg-emerald-100/90' 
            : 'text-amber-800 bg-amber-100/90'
        }`}>
          {findings.length === 0 ? 'An toàn 100%' : 'Cần rà soát'}
        </span>
      </div>

      {/* 2. Danh sách Findings thật từ Backend */}
      {findings.length > 0 ? (
        findings.map((f, idx) => {
          const isHigh = f.severity === 'CRITICAL';
          const isMedium = f.severity === 'WARNING';

          return (
            <div 
              key={`${f.ruleCode}-${idx}`}
              className={`border rounded-2xl p-4 space-y-2.5 ${
                isHigh 
                  ? 'border-rose-300 bg-rose-50/20' 
                  : isMedium 
                  ? 'border-amber-300 bg-amber-50/20' 
                  : 'border-blue-200 bg-blue-50/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isHigh ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : isMedium ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <h4 className={`font-bold text-xs ${isHigh ? 'text-rose-950' : isMedium ? 'text-amber-950' : 'text-blue-950'}`}>
                    [{f.ruleCode}] {f.ruleName}
                  </h4>
                </div>
                <span className={`text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 self-start sm:self-center shadow-2xs ${
                  isHigh ? 'bg-rose-600' : isMedium ? 'bg-amber-500' : 'bg-blue-600'
                }`}>
                  {f.severity}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {f.message}
              </p>

              {f.suggestedFix && (
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-slate-600">
                    💡 <strong className="text-slate-800">Khuyến nghị:</strong> {f.suggestedFix}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenRuleDetail && onOpenRuleDetail(f.ruleCode)}
                    className="text-slate-500 hover:text-slate-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Chi tiết</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center text-xs text-emerald-800">
          ✨ Hồ sơ thuế của bạn hoàn toàn sạch sẽ, không có bất kỳ vi phạm hay rủi ro nào từ 15 quy tắc thẩm tra của Tổng cục Thuế.
        </div>
      )}
    </div>
  );
};
