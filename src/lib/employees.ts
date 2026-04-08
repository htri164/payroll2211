export const FACTORIES = ['Xưởng 1', 'Xưởng 2'] as const;

export type Factory = (typeof FACTORIES)[number];

export interface Employee {
  id?: string;
  name: string;
  position?: string;
  salary: number;
  foodAllowance: number;
  joinDate: string;
  factory: Factory;
}

export type EmployeeDraft = Omit<Employee, 'id'>;

/** Ngày hiện tại theo lịch Việt Nam (Asia/Ho_Chi_Minh), chuỗi yyyy-mm-dd để lưu DB */
export const getCurrentDateInputValue = (): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPart['type']) =>
    parts.find((p) => p.type === type)?.value ?? '';
  const y = get('year');
  const m = get('month');
  const d = get('day');
  if (!y || !m || !d) return new Date().toISOString().split('T')[0];
  return `${y}-${m}-${d}`;
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DDMMYYYY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/** Chuẩn hóa về yyyy-mm-dd (chấp nhận yyyy-mm-dd hoặc dd/mm/yyyy) */
export const normalizeJoinDateToIso = (value: string): string | null => {
  const t = value.trim();
  if (!t) return null;

  let match = t.match(ISO_DATE);
  if (match) {
    const y = Number(match[1]);
    const mo = Number(match[2]);
    const d = Number(match[3]);
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
      return null;
    }
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  match = t.match(DDMMYYYY);
  if (match) {
    const d = Number(match[1]);
    const mo = Number(match[2]);
    const y = Number(match[3]);
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
      return null;
    }
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return null;
};

/** yyyy-mm-dd → hiển thị dd/mm/yyyy */
export const isoDateToDdMmYyyy = (iso: string): string => {
  const n = normalizeJoinDateToIso(iso);
  if (!n) return '';
  const [y, m, d] = n.split('-');
  return `${d}/${m}/${y}`;
};

export const createEmployeeDraft = (
  employee?: Partial<Employee>
): EmployeeDraft => ({
  name: employee?.name ?? '',
  position: employee?.position ?? '',
  salary: employee?.salary ?? 0,
  foodAllowance: employee?.foodAllowance ?? 0,
  joinDate: employee?.joinDate ?? getCurrentDateInputValue(),
  factory: employee?.factory ?? FACTORIES[0],
});

export const formatNumberInput = (value: number) => {
  if (!value) {
    return '';
  }

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseFormattedNumber = (value: string) =>
  Number(value.replace(/\./g, '').replace(/[^\d]/g, '')) || 0;

export const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

/** Hiển thị ngày theo dd/mm/yyyy (đồng bộ với ô nhập; tránh lệch ngày do parse UTC) */
export const formatDate = (value?: string) => {
  if (!value?.trim()) return '';
  const iso = normalizeJoinDateToIso(value.trim());
  if (!iso) return value.trim();
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};