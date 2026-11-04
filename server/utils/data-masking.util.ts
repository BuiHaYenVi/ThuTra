// ==============================================================================
// Tiện ích Che mờ Bảo vệ Dữ liệu Cá nhân (Data Masking Utility)
// Tuân thủ: Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân
// Hệ thống: ThuTra TNCN - Giai đoạn 4.2
// ==============================================================================

/**
 * Che mờ số Căn cước công dân (12 chữ số):
 * Giữ 3 số đầu và 3 số cuối, che mờ 6 số ở giữa (Ví dụ: 079095012345 -> 079******345)
 */
export function maskCccd(cccd?: string | null): string {
  if (!cccd) return '***';
  const clean = cccd.trim().replace(/\s/g, '');
  if (clean.length < 6) return '***';
  const start = clean.slice(0, 3);
  const end = clean.slice(-3);
  const middleMaskLength = Math.max(clean.length - 6, 4);
  return `${start}${'*'.repeat(middleMaskLength)}${end}`;
}

/**
 * Che mờ Mã số thuế cá nhân / doanh nghiệp:
 * Giữ 3 số đầu và 2 số cuối, che mờ phần giữa (Ví dụ: 8492019381 -> 849*****81)
 */
export function maskMst(mst?: string | null): string {
  if (!mst) return '***';
  const clean = mst.trim().replace(/\s/g, '');
  if (clean.length < 5) return '***';
  const start = clean.slice(0, 3);
  const end = clean.slice(-2);
  const middleMaskLength = Math.max(clean.length - 5, 4);
  return `${start}${'*'.repeat(middleMaskLength)}${end}`;
}

/**
 * Che mờ địa chỉ Email cá nhân:
 * Giữ chữ cái đầu và chữ cái cuối của phần username (Ví dụ: nam.nguyen@example.com -> n***n@example.com)
 */
export function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return '***';
  const [username, domain] = email.trim().toLowerCase().split('@');
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  const firstChar = username[0];
  const lastChar = username[username.length - 1];
  return `${firstChar}***${lastChar}@${domain}`;
}

/**
 * Tiện ích che mờ tổng hợp trên một đối tượng chứa dữ liệu nhạy cảm
 */
export function maskSensitiveData<T extends Record<string, any>>(obj: T): T {
  const result: any = { ...obj };

  if ('cccd' in result && typeof result.cccd === 'string') {
    result.cccd = maskCccd(result.cccd);
  }
  if ('maskedCccd' in result && typeof result.maskedCccd === 'string') {
    result.maskedCccd = maskCccd(result.maskedCccd);
  }
  if ('mst' in result && typeof result.mst === 'string') {
    result.mst = maskMst(result.mst);
  }
  if ('maskedMst' in result && typeof result.maskedMst === 'string') {
    result.maskedMst = maskMst(result.maskedMst);
  }
  if ('email' in result && typeof result.email === 'string') {
    result.email = maskEmail(result.email);
  }

  return result as T;
}
