import React, { useState } from 'react';
import { UploadCloud, Smartphone, CheckCircle } from 'lucide-react';

interface DocumentUploadBoxProps {
  onFileSelect?: (file: File) => void;
  onSyncEtaxMobile?: () => void;
}

export const DocumentUploadBox: React.FC<DocumentUploadBoxProps> = ({
  onFileSelect,
  onSyncEtaxMobile
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
        isDragging
          ? 'border-[#046a4e] bg-emerald-50 scale-[1.005]'
          : 'border-emerald-300/80 bg-[#f4fbf8] hover:border-emerald-400'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-emerald-100/90 text-[#046a4e] flex items-center justify-center mx-auto mb-2 shadow-2xs">
        <UploadCloud className="w-5 h-5" />
      </div>

      <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
        Kéo & thả chứng từ khấu trừ thuế điện tử (XML / PDF)
      </h3>
      <p className="text-xs text-slate-500 mt-0.5 mb-3.5">
        Hỗ trợ định dạng chuẩn Thông tư 78 của Tổng cục Thuế hoặc hình chụp biên lai khấu trừ
      </p>

      {uploadedFileName ? (
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 font-semibold text-xs px-3 py-1.5 rounded-xl">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>Đã nhận file: {uploadedFileName}</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <label className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-3.5 py-1.5 rounded-xl shadow-2xs cursor-pointer transition-colors">
            <span>Chọn từ máy tính</span>
            <input
              type="file"
              accept=".xml,.pdf,.png,.jpg"
              onChange={handleInputChange}
              className="hidden"
            />
          </label>

          <span className="text-slate-400 text-xs">hoặc</span>

          <button
            onClick={onSyncEtaxMobile}
            className="text-[#046a4e] hover:text-[#03543e] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>đồng bộ từ eTax Mobile</span>
          </button>
        </div>
      )}
    </div>
  );
};
