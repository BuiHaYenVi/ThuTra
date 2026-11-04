import React from 'react';
import { ShieldCheck, Zap, Headphones } from 'lucide-react';
import { mockTrustBadges } from '../../data/mockForecastData';

export const FooterTrustBadges: React.FC = () => {
  return (
    <footer className="space-y-6 pt-2 pb-6">
      {/* 3 Trust Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockTrustBadges.map((badge) => {
          return (
            <div
              key={badge.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-start gap-3 hover:border-slate-300 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                {badge.iconType === 'shield' && (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                )}
                {badge.iconType === 'zap' && (
                  <Zap className="w-5 h-5 text-blue-600" />
                )}
                {badge.iconType === 'headset' && (
                  <Headphones className="w-5 h-5 text-amber-600" />
                )}
              </div>

              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-xs">
                  {badge.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Copyright & Legal Links */}
      <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <strong className="text-slate-800 font-bold">ThuTra TNCN</strong>
          <span>© 2026 Bản quyền thuộc về Cổng Quyết toán Thuế Cá nhân Thông minh.</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <a href="#terms" className="hover:text-slate-800 transition-colors">
            Điều khoản dịch vụ
          </a>
          <a href="#privacy" className="hover:text-slate-800 transition-colors">
            Chính sách bảo mật
          </a>
          <a href="#circular" className="hover:text-slate-800 transition-colors">
            Quy chuẩn Thông tư 80/2021
          </a>
          <span className="text-slate-700 font-semibold">
            Tổng đài hỗ trợ: 1900 6868
          </span>
        </div>
      </div>
    </footer>
  );
};
