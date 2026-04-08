'use client';

import { useEffect, useMemo, useState } from 'react';
import { Employee, getEmployees } from '@/lib/firebase/employees';
import {
  FACTORIES,
  formatCurrency,
  formatNumberInput,
  parseFormattedNumber,
} from '@/lib/employees';
import {
  type ManualAllowanceLine,
  type SalaryRecord,
  STANDARD_WORKING_DAYS,
  NIGHT_SHIFT_ALLOWANCE,
  FOOD_ALLOWANCE_PER_WORKING_DAY,
  MAX_MANUAL_ALLOWANCE_LINES,
  addSalaryRecord,
  buildSalaryRecord,
  getSalaryRecordsByMonth,
  updateSalaryRecord,
} from '@/lib/firebase/salaries';
import toast from 'react-hot-toast';

interface SalaryFormProps {
  editingRecord?: SalaryRecord | null;
  refreshToken?: number;
  onCancelEdit?: () => void;
  onSuccess?: () => void;
}

type SalaryNumericField =
  | 'dayShifts'
  | 'nightShifts'
  | 'leaveDays'
  | 'advancePayment'
  | 'attendanceBonus'
  | 'otherAllowance'
  | 'otherDeduction';

interface SalaryFormState {
  dayShifts: number;
  nightShifts: number;
  leaveDays: number;
  advancePayment: number;
  attendanceBonus: number;
  otherAllowance: number;
  manualAllowanceLines: ManualAllowanceLine[];
  otherDeduction: number;
}

const getCurrentMonthValue = () => new Date().toISOString().slice(0, 7);

const emptyManualLine = (): ManualAllowanceLine => ({ label: '', amount: 0 });

const initialFormState: SalaryFormState = {
  dayShifts: 0,
  nightShifts: 0,
  leaveDays: 0,
  advancePayment: 0,
  attendanceBonus: 0,
  otherAllowance: 0,
  manualAllowanceLines: [emptyManualLine()],
  otherDeduction: 0,
};

const fieldClassName =
  'h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-[16px] leading-none text-gray-900 focus:border-success focus:outline-none focus:ring-4 focus:ring-success/10 transition-all duration-200';

const mapRecordToFormState = (record: SalaryRecord): SalaryFormState => ({
  dayShifts: record.dayShifts,
  nightShifts: record.nightShifts,
  leaveDays: record.leaveDays,
  advancePayment: record.advancePayment,
  attendanceBonus: record.attendanceBonus,
  otherAllowance: record.otherAllowance,
  manualAllowanceLines:
    record.manualAllowanceLines && record.manualAllowanceLines.length > 0
      ? record.manualAllowanceLines.map((line) => ({
          label: line.label,
          amount: line.amount,
        }))
      : [emptyManualLine()],
  otherDeduction: record.otherDeduction,
});

export default function SalaryForm({
  editingRecord = null,
  refreshToken = 0,
  onCancelEdit,
  onSuccess,
}: SalaryFormProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [monthRecords, setMonthRecords] = useState<SalaryRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [month, setMonth] = useState(getCurrentMonthValue());
  const [formData, setFormData] = useState<SalaryFormState>(initialFormState);

  const isEditing = Boolean(editingRecord?.id);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (isEditing && editingRecord) {
      setMonth(editingRecord.month);
      setFormData(mapRecordToFormState(editingRecord));
    }
  }, [editingRecord, isEditing]);

  useEffect(() => {
    if (!employees.length) {
      return;
    }

    if (isEditing && editingRecord) {
      const employee =
        employees.find((item) => item.id === editingRecord.employeeId) ?? {
          id: editingRecord.employeeId,
          name: editingRecord.employeeName,
          salary: editingRecord.baseSalary,
          joinDate: '',
          factory: FACTORIES[0],
        };
      setSelectedEmployee(employee);
      return;
    }

    setSelectedEmployee((current) => {
      if (!current?.id) {
        return null;
      }

      return employees.find((item) => item.id === current.id) ?? null;
    });
  }, [employees, editingRecord, isEditing]);

  useEffect(() => {
    fetchMonthRecords(month);
  }, [month, refreshToken]);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch nhÃ¢n viÃªn';
      console.warn(message);
    }
  };

  const fetchMonthRecords = async (targetMonth: string) => {
    try {
      const data = await getSalaryRecordsByMonth(targetMonth);
      setMonthRecords(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ táº£i báº£ng lÆ°Æ¡ng theo thÃ¡ng';
      console.warn(message);
      setMonthRecords([]);
    }
  };

  const availableEmployees = useMemo(() => {
    if (isEditing && editingRecord?.employeeId) {
      return employees.filter(
        (employee) =>
          employee.id === editingRecord.employeeId ||
          !monthRecords.some((record) => record.employeeId === employee.id)
      );
    }

    return employees.filter(
      (employee) => !monthRecords.some((record) => record.employeeId === employee.id)
    );
  }, [editingRecord, employees, isEditing, monthRecords]);

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setSelectedEmployee((current) => {
      if (!current?.id) {
        return null;
      }

      return availableEmployees.some((employee) => employee.id === current.id) ? current : null;
    });
  }, [availableEmployees, isEditing]);

  const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employee = availableEmployees.find((item) => item.id === e.currentTarget.value) ?? null;
    setSelectedEmployee(employee);
  };

  const handleFormattedNumberChange = (name: SalaryNumericField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseFormattedNumber(e.target.value);
    setFormData((prev) => ({ ...prev, [name]: n }));
  };

  const selectAllOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleManualLineLabelChange = (index: number, label: string) => {
    setFormData((prev) => {
      const next = [...prev.manualAllowanceLines];
      next[index] = { ...next[index], label };
      return { ...prev, manualAllowanceLines: next };
    });
  };

  const handleManualLineAmountChange = (index: number, raw: string) => {
    const amount = parseFormattedNumber(raw);
    setFormData((prev) => {
      const next = [...prev.manualAllowanceLines];
      next[index] = { ...next[index], amount };
      return { ...prev, manualAllowanceLines: next };
    });
  };

  const addManualLine = () => {
    setFormData((prev) => {
      if (prev.manualAllowanceLines.length >= MAX_MANUAL_ALLOWANCE_LINES) {
        return prev;
      }
      return {
        ...prev,
        manualAllowanceLines: [...prev.manualAllowanceLines, emptyManualLine()],
      };
    });
  };

  const removeManualLine = (index: number) => {
    setFormData((prev) => {
      if (prev.manualAllowanceLines.length <= 1) {
        return { ...prev, manualAllowanceLines: [emptyManualLine()] };
      }
      return {
        ...prev,
        manualAllowanceLines: prev.manualAllowanceLines.filter((_, i) => i !== index),
      };
    });
  };

  const resetCreateForm = () => {
    setSelectedEmployee(null);
    setFormData(initialFormState);
    setMonth(getCurrentMonthValue());
  };

  const handleCancelEdit = () => {
    onCancelEdit?.();
    resetCreateForm();
  };

  const salaryPreview: SalaryRecord | null = selectedEmployee
    ? buildSalaryRecord({
        id: editingRecord?.id,
        employeeId: selectedEmployee.id ?? '',
        employeeName: selectedEmployee.name,
        baseSalary: isEditing && editingRecord ? editingRecord.baseSalary : selectedEmployee.salary,
        foodAllowance: 0,
        standardWorkingDays: STANDARD_WORKING_DAYS,
        dayShifts: formData.dayShifts,
        nightShifts: formData.nightShifts,
        leaveDays: formData.leaveDays,
        advancePayment: formData.advancePayment,
        attendanceBonus: formData.attendanceBonus,
        otherAllowance: formData.otherAllowance,
        manualAllowanceLines: formData.manualAllowanceLines,
        otherDeduction: formData.otherDeduction,
        month,
        createdAt: editingRecord?.createdAt,
      })
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee?.id || !salaryPreview) {
      toast.error('Vui lÃ²ng chá»n nhÃ¢n viÃªn');
      return;
    }

    if (
      !isEditing &&
      monthRecords.some((record) => record.employeeId === selectedEmployee.id)
    ) {
      toast.error('NhÃ¢n viÃªn nÃ y Ä‘Ã£ cÃ³ báº£ng lÆ°Æ¡ng trong thÃ¡ng Ä‘Ã£ chá»n');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && editingRecord?.id) {
        await updateSalaryRecord(editingRecord.id, salaryPreview);
        toast.success('Cáº­p nháº­t báº£ng lÆ°Æ¡ng thÃ nh cÃ´ng');
        onCancelEdit?.();
      } else {
        await addSalaryRecord(salaryPreview);
        toast.success('TÃ­nh lÆ°Æ¡ng thÃ nh cÃ´ng');
        resetCreateForm();
      }

      onSuccess?.();
    } catch (error) {
      toast.error('CÃ³ lá»—i xáº£y ra khi lÆ°u báº£ng lÆ°Æ¡ng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /** Dropdown trá»‘ng: hoáº·c chÆ°a cÃ³ NV trong há»‡ thá»‘ng, hoáº·c má»i NV Ä‘Ã£ cÃ³ báº£ng lÆ°Æ¡ng thÃ¡ng nÃ y â€” tÃ¡ch 2 trÆ°á»ng há»£p. */
  const noEmployeesInSystem = !isEditing && employees.length === 0;
  const allHaveSalaryForMonth =
    !isEditing && employees.length > 0 && availableEmployees.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">1. ThÃ´ng tin cÆ¡ báº£n</h3>
            <p className="mt-1 text-sm text-gray-500">
              Chọn nhân viên và tháng tính lương. Lương cơ bản lấy từ hồ sơ, tiền ăn tự tính theo tổng ngày công x 40.000.
            </p>
          </div>

                    {isEditing && editingRecord && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Đang chỉnh sửa bảng lương của <span className="font-bold">{editingRecord.employeeName}</span> tháng{' '}
              <span className="font-bold">{editingRecord.month}</span>.
            </div>
          )}

          <div>
            <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
              Nhân viên *
            </label>
            <select
              onChange={handleChangeSelect}
              value={selectedEmployee?.id || ''}
              className={fieldClassName}
              disabled={isEditing}
              required
            >
              <option value="">-- Chọn nhân viên --</option>
              {availableEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            {noEmployeesInSystem && (
              <p className="mt-2 text-sm text-gray-600">
                Chưa có nhân viên trong hệ thống. Hãy thêm nhân viên ở mục <span className="font-semibold">Nhân viên</span> trước khi
                tính lương.
              </p>
            )}
            {allHaveSalaryForMonth && (
              <p className="mt-2 text-sm text-amber-700">
                Tất cả nhân viên đã được tạo bảng lương trong tháng này. Muốn sửa, hãy bấm Chỉnh sửa ở danh sách bên dưới.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
              Tháng *
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={fieldClassName}
              disabled={isEditing}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                Lương cơ bản
              </label>
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900">
                {salaryPreview ? formatCurrency(salaryPreview.baseSalary) : '--'}
              </div>
            </div>
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                Tiền ăn
              </label>
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900">
                {salaryPreview ? formatCurrency(salaryPreview.foodAllowance) : '--'}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">2. Cháº¥m cÃ´ng</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tiền ăn được tính tự động theo tổng công (ngày + đêm) x {formatCurrency(FOOD_ALLOWANCE_PER_WORKING_DAY)}. Phụ cấp đêm được tính theo công đêm x {formatCurrency(NIGHT_SHIFT_ALLOWANCE)}. Ô số dùng dấu
              <span className="font-semibold">.</span> phÃ¢n cÃ¡ch hÃ ng nghÃ¬n; khi trá»‘ng tÆ°Æ¡ng Ä‘Æ°Æ¡ng 0.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                Sá»‘ cÃ´ng ngÃ y
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="dayShifts"
                autoComplete="off"
                value={formatNumberInput(formData.dayShifts)}
                onChange={handleFormattedNumberChange('dayShifts')}
                onFocus={selectAllOnFocus}
                className={fieldClassName}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                Sá»‘ cÃ´ng Ä‘Ãªm
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="nightShifts"
                autoComplete="off"
                value={formatNumberInput(formData.nightShifts)}
                onChange={handleFormattedNumberChange('nightShifts')}
                onFocus={selectAllOnFocus}
                className={fieldClassName}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                Sá»‘ ngÃ y nghá»‰
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="leaveDays"
                autoComplete="off"
                value={formatNumberInput(formData.leaveDays)}
                onChange={handleFormattedNumberChange('leaveDays')}
                onFocus={selectAllOnFocus}
                className={fieldClassName}
                placeholder="0"
              />
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Tiền ăn hiện tại: <span className="font-bold">{formatCurrency(salaryPreview?.foodAllowance ?? 0)}</span>{' '}
            <span className="text-amber-700">({formData.dayShifts + formData.nightShifts} công x {formatCurrency(FOOD_ALLOWANCE_PER_WORKING_DAY)})</span>
            <span className="mx-2 text-amber-300">•</span>
            Phụ cấp đêm: <span className="font-bold">{formatCurrency(salaryPreview?.nightAllowance ?? 0)}</span>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-6 lg:col-span-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">3. ThÃªm / Trá»«</h3>
            <p className="mt-1 text-sm text-gray-500">
              Nháº­p cÃ¡c khoáº£n phÃ¡t sinh thá»±c táº¿ trong thÃ¡ng. Pháº§n â€œKhoáº£n cá»™ng thÃªm (tá»± nháº­p)â€ dÃ¹ng khi cáº§n nhiá»u dÃ²ng cÃ³ tÃªn riÃªng (vÃ­ dá»¥ trá»±c CN, mua Ä‘á»“). ChuyÃªn cáº§n váº«n nháº­p má»™t Ã´ riÃªng.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                Táº¡m á»©ng
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="advancePayment"
                autoComplete="off"
                value={formatNumberInput(formData.advancePayment)}
                onChange={handleFormattedNumberChange('advancePayment')}
                onFocus={selectAllOnFocus}
                className={fieldClassName}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                ChuyÃªn cáº§n
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="attendanceBonus"
                autoComplete="off"
                value={formatNumberInput(formData.attendanceBonus)}
                onChange={handleFormattedNumberChange('attendanceBonus')}
                onFocus={selectAllOnFocus}
                className={fieldClassName}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                Trá»£ cáº¥p khÃ¡c (má»™t sá»‘)
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="otherAllowance"
                autoComplete="off"
                value={formatNumberInput(formData.otherAllowance)}
                onChange={handleFormattedNumberChange('otherAllowance')}
                onFocus={selectAllOnFocus}
                className={fieldClassName}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                Kháº¥u trá»« khÃ¡c
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="otherDeduction"
                autoComplete="off"
                value={formatNumberInput(formData.otherDeduction)}
                onChange={handleFormattedNumberChange('otherDeduction')}
                onFocus={selectAllOnFocus}
                className={fieldClassName}
                placeholder="0"
              />
            </div>
          </div>

          <div className="rounded-xl border border-success/20 bg-white p-4">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Khoáº£n cá»™ng thÃªm (tá»± nháº­p)</p>
                <p className="text-xs text-gray-500">
                  Má»—i dÃ²ng: tÃªn khoáº£n + sá»‘ tiá»n. Chá»‰ tÃ­nh dÃ²ng cÃ³ tÃªn. Tá»‘i Ä‘a {MAX_MANUAL_ALLOWANCE_LINES} dÃ²ng.
                </p>
              </div>
              <button
                type="button"
                onClick={addManualLine}
                disabled={formData.manualAllowanceLines.length >= MAX_MANUAL_ALLOWANCE_LINES}
                className="mt-2 shrink-0 rounded-lg border border-success bg-success/5 px-4 py-2 text-sm font-semibold text-success transition hover:bg-success/10 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0"
              >
                + ThÃªm dÃ²ng
              </button>
            </div>
            <div className="space-y-3">
              {formData.manualAllowanceLines.map((line, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 ml-1 block text-xs font-semibold text-gray-600">
                      TÃªn khoáº£n
                    </label>
                    <input
                      type="text"
                      value={line.label}
                      onChange={(e) => handleManualLineLabelChange(index, e.target.value)}
                      placeholder="VÃ­ dá»¥: trá»±c CN, cÃ¢n Ä‘iá»uâ€¦"
                      className={fieldClassName}
                      maxLength={80}
                    />
                  </div>
                  <div className="w-full sm:w-44">
                    <label className="mb-1 ml-1 block text-xs font-semibold text-gray-600">
                      Sá»‘ tiá»n
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={formatNumberInput(line.amount)}
                      onChange={(e) => handleManualLineAmountChange(index, e.target.value)}
                      onFocus={selectAllOnFocus}
                      className={fieldClassName}
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeManualLine(index)}
                    className="h-12 shrink-0 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                    aria-label="XÃ³a dÃ²ng"
                  >
                    XÃ³a
                  </button>
                </div>
              ))}
            </div>
            {salaryPreview && (salaryPreview.manualAllowanceTotal ?? 0) !== 0 && (
              <p className="mt-3 text-sm font-semibold text-success">
                Tá»•ng cÃ¡c khoáº£n tá»± nháº­p: {formatCurrency(salaryPreview.manualAllowanceTotal ?? 0)}
              </p>
            )}
          </div>
        </section>
      </div>

      {salaryPreview && (
        <section className="rounded-3xl border border-success/10 bg-success-light p-8 shadow-premium">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-success">
                4. Tá»•ng káº¿t Ä‘á»™ng
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                LÆ°Æ¡ng thá»±c lÃ£nh Ä‘Æ°á»£c cáº­p nháº­t ngay khi báº¡n nháº­p
              </h3>
            </div>
            <div className="rounded-2xl bg-white px-5 py-4 text-right shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">LÆ°Æ¡ng thá»±c lÃ£nh</p>
              <p className="text-3xl font-black text-success">{formatCurrency(salaryPreview.totalSalary ?? 0)}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">LÆ°Æ¡ng cÃ´ng</p>
              <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(salaryPreview.grossWorkSalary ?? 0)}</p>
              <p className="mt-2 text-sm text-gray-500">
                {formData.dayShifts + formData.nightShifts} cÃ´ng / {STANDARD_WORKING_DAYS} ngÃ y chuáº©n
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Tá»•ng phá»¥ cáº¥p</p>
              <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(salaryPreview.totalAllowance ?? 0)}</p>
              <p className="mt-2 text-sm text-gray-500">CÆ¡m + Ä‘Ãªm + chuyÃªn cáº§n + trá»£ cáº¥p + khoáº£n tá»± nháº­p</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Tá»•ng bá»‹ trá»«</p>
              <p className="mt-2 text-2xl font-black text-red-600">{formatCurrency(salaryPreview.totalDeduction ?? 0)}</p>
              <p className="mt-2 text-sm text-gray-500">Táº¡m á»©ng + kháº¥u trá»« khÃ¡c</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Nghá»‰ / Phá»¥ cáº¥p Ä‘Ãªm</p>
              <p className="mt-2 text-2xl font-black text-gray-900">{formData.leaveDays} ngÃ y</p>
              <p className="mt-2 text-sm text-gray-500">ÄÃªm: {formatCurrency(salaryPreview.nightAllowance ?? 0)}</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-success/10 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-100 text-sm md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="space-y-3 p-5">
                <p className="font-bold text-gray-900">Chi tiáº¿t cÃ´ng vÃ  phá»¥ cáº¥p</p>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Tiền ăn</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(salaryPreview.foodAllowance)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Phá»¥ cáº¥p Ä‘Ãªm</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(salaryPreview.nightAllowance ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>ChuyÃªn cáº§n</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(formData.attendanceBonus)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Trá»£ cáº¥p khÃ¡c (má»™t sá»‘)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(formData.otherAllowance)}</span>
                </div>
                {(salaryPreview.manualAllowanceLines?.length ?? 0) > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Khoáº£n tá»± nháº­p
                      </p>
                      {salaryPreview.manualAllowanceLines?.map((line, i) => (
                        <div key={i} className="flex items-center justify-between text-gray-600">
                          <span className="pr-2">{line.label}</span>
                          <span className="shrink-0 font-semibold text-gray-900">
                            {formatCurrency(line.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-200 pt-2 text-gray-700">
                        <span className="font-medium">Tá»•ng khoáº£n tá»± nháº­p</span>
                        <span className="font-bold text-success">
                          {formatCurrency(salaryPreview.manualAllowanceTotal ?? 0)}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
              <div className="space-y-3 p-5">
                <p className="font-bold text-gray-900">Chi tiáº¿t trá»«</p>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Táº¡m á»©ng</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(formData.advancePayment)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Kháº¥u trá»« khÃ¡c</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(formData.otherDeduction)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>NgÃ y cÃ´ng quy Ä‘á»•i</span>
                  <span className="font-semibold text-gray-900">{formData.dayShifts + formData.nightShifts}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>NgÃ y cÃ´ng chuáº©n</span>
                  <span className="font-semibold text-gray-900">{STANDARD_WORKING_DAYS}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading || !selectedEmployee}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-success px-10 py-4 font-bold text-white transition-all duration-300 hover:bg-success-hover disabled:bg-gray-200 sm:w-auto"
        >
          {loading
            ? isEditing
              ? 'Äang cáº­p nháº­t báº£ng lÆ°Æ¡ng...'
              : 'Äang lÆ°u báº£ng lÆ°Æ¡ng...'
            : 'XÃ¡c nháº­n tÃ­nh lÆ°Æ¡ng'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="w-full rounded-xl border border-gray-200 bg-white px-10 py-4 font-bold text-gray-700 transition-all duration-300 hover:bg-gray-50 sm:w-auto"
          >
            Há»§y chá»‰nh sá»­a
          </button>
        )}
      </div>
    </form>
  );
}



