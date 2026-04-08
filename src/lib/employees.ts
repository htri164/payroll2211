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

export const getCurrentDateInputValue = () => new Date().toISOString().split('T')[0];

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

const vietnameseDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const formatDate = (value?: string) =>
  value ? vietnameseDateFormatter.format(new Date(value)) : '';