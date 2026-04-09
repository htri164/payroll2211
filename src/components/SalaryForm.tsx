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
  'h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-base leading-none text-gray-900 focus:border-success focus:outline-none focus:ring-4 focus:ring-success/10 transition-all duration-300';

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
        error instanceof Error ? error.message : 'Không thể tải danh sách nhân viên';
      console.warn(message);
    }
  };

  const fetchMonthRecords = async (targetMonth: string) => {
    try {
      const data = await getSalaryRecordsByMonth(targetMonth);
      setMonthRecords(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể tải bảng lương theo tháng';
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
      toast.error('Vui lòng chọn nhân viên');
      return;
    }

    if (
      !isEditing &&
      monthRecords.some((record) => record.employeeId === selectedEmployee.id)
    ) {
      toast.error('Nhân viên này đã có bảng lương trong tháng đã chọn');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && editingRecord?.id) {
        await updateSalaryRecord(editingRecord.id, salaryPreview);
        toast.success('Cập nhật bảng lương thành công');
        onCancelEdit?.();
      } else {
        await addSalaryRecord(salaryPreview);
        toast.success('Tính lương thành công');
        resetCreateForm();
      }

      onSuccess?.();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu bảng lương');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /** Dropdown trống: hoặc chưa có NV trong hệ thống, hoặc mọi NV đã có bảng lương tháng này — tách 2 trường hợp. */
  const noEmployeesInSystem = !isEditing && employees.length === 0;
  const allHaveSalaryForMonth =
    !isEditing && employees.length > 0 && availableEmployees.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">1. Thông tin cơ bản</h3>
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
            <div className="relative">
              <select
                onChange={handleChangeSelect}
                value={selectedEmployee?.id || ''}
                className={fieldClassName + ' appearance-none pr-10'}
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
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
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
            <h3 className="text-lg font-bold text-gray-900">2. Chấm công</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tiền ăn được tính tự động theo tổng công (ngày + đêm) x {formatCurrency(FOOD_ALLOWANCE_PER_WORKING_DAY)}. Phụ cấp đêm được tính theo công đêm x {formatCurrency(NIGHT_SHIFT_ALLOWANCE)}. Ô số dùng dấu
              <span className="font-semibold">.</span> phân cách hàng nghìn; khi trống tương đương 0.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                Số công ngày
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
                Số công đêm
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
                Số ngày nghỉ
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p>
                Tiền ăn hiện tại:{' '}
                <span className="font-bold">{formatCurrency(salaryPreview?.foodAllowance ?? 0)}</span>
              </p>
              <p className="mt-1 text-amber-700">
                {formData.dayShifts + formData.nightShifts} công x{' '}
                {formatCurrency(FOOD_ALLOWANCE_PER_WORKING_DAY)}
              </p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
              <p>
                Phụ cấp đêm:{' '}
                <span className="font-bold">{formatCurrency(salaryPreview?.nightAllowance ?? 0)}</span>
              </p>
              <p className="mt-1 text-indigo-700">
                {formData.nightShifts} công đêm x {formatCurrency(NIGHT_SHIFT_ALLOWANCE)}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-6 lg:col-span-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">3. Thêm / Trừ</h3>
            <p className="mt-1 text-sm text-gray-500">
              Nhập các khoản phát sinh thực tế trong tháng. Phần &quot;Khoản cộng thêm (tự nhập)&quot; dùng khi cần nhiều dòng có tên riêng (ví dụ trực CN, mua đồ). Chuyên cần vẫn nhập một ô riêng.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                Tạm ứng
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
                Chuyên cần
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
                Trợ cấp khác (một số)
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
                Khấu trừ khác
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
                <p className="text-sm font-bold text-gray-900">Khoản cộng thêm (tự nhập)</p>
                <p className="text-xs text-gray-500">
                  Mỗi dòng: tên khoản + số tiền. Chỉ tính dòng có tên. Tối đa {MAX_MANUAL_ALLOWANCE_LINES} dòng.
                </p>
              </div>
              <button
                type="button"
                onClick={addManualLine}
                disabled={formData.manualAllowanceLines.length >= MAX_MANUAL_ALLOWANCE_LINES}
                className="mt-2 shrink-0 rounded-lg border border-success bg-success/5 px-4 py-2 text-sm font-semibold text-success transition hover:bg-success/10 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0"
              >
                + Thêm dòng
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
                      Tên khoản
                    </label>
                    <input
                      type="text"
                      value={line.label}
                      onChange={(e) => handleManualLineLabelChange(index, e.target.value)}
                      placeholder="Ví dụ: trực CN, cân điều…"
                      className={fieldClassName}
                      maxLength={80}
                    />
                  </div>
                  <div className="w-full sm:w-44">
                    <label className="mb-1 ml-1 block text-xs font-semibold text-gray-600">
                      Số tiền
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
                    aria-label="Xóa dòng"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
            {salaryPreview && (salaryPreview.manualAllowanceTotal ?? 0) !== 0 && (
              <p className="mt-3 text-sm font-semibold text-success">
                Tổng các khoản tự nhập: {formatCurrency(salaryPreview.manualAllowanceTotal ?? 0)}
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
                4. Tổng kết động
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                Lương thực lãnh được cập nhật ngay khi bạn nhập
              </h3>
            </div>
            <div className="rounded-2xl bg-white px-5 py-4 text-right shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Lương thực lãnh</p>
              <p className="text-3xl font-black text-success">{formatCurrency(salaryPreview.totalSalary ?? 0)}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Lương công</p>
              <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(salaryPreview.grossWorkSalary ?? 0)}</p>
              <p className="mt-2 text-sm text-gray-500">
                {formData.dayShifts + formData.nightShifts} công / {STANDARD_WORKING_DAYS} ngày chuẩn
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Tổng phụ cấp</p>
              <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(salaryPreview.totalAllowance ?? 0)}</p>
              <p className="mt-2 text-sm text-gray-500">Cơm + đêm + chuyên cần + trợ cấp + khoản tự nhập</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Tổng bị trừ</p>
              <p className="mt-2 text-2xl font-black text-red-600">{formatCurrency(salaryPreview.totalDeduction ?? 0)}</p>
              <p className="mt-2 text-sm text-gray-500">Tạm ứng + khấu trừ khác</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Nghỉ / Phụ cấp đêm</p>
              <p className="mt-2 text-2xl font-black text-gray-900">{formData.leaveDays} ngày</p>
              <p className="mt-2 text-sm text-gray-500">Đêm: {formatCurrency(salaryPreview.nightAllowance ?? 0)}</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-success/10 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-100 text-sm md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="space-y-3 p-5">
                <p className="font-bold text-gray-900">Chi tiết công và phụ cấp</p>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Tiền ăn</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(salaryPreview.foodAllowance)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Phụ cấp đêm</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(salaryPreview.nightAllowance ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Chuyên cần</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(formData.attendanceBonus)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Trợ cấp khác (một số)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(formData.otherAllowance)}</span>
                </div>
                {(salaryPreview.manualAllowanceLines?.length ?? 0) > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Khoản tự nhập
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
                        <span className="font-medium">Tổng khoản tự nhập</span>
                        <span className="font-bold text-success">
                          {formatCurrency(salaryPreview.manualAllowanceTotal ?? 0)}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
              <div className="space-y-3 p-5">
                <p className="font-bold text-gray-900">Chi tiết trừ</p>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Tạm ứng</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(formData.advancePayment)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Khấu trừ khác</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(formData.otherDeduction)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Ngày công quy đổi</span>
                  <span className="font-semibold text-gray-900">{formData.dayShifts + formData.nightShifts}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Ngày công chuẩn</span>
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
              ? 'Đang cập nhật bảng lương...'
              : 'Đang lưu bảng lương...'
            : 'Xác nhận tính lương'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="w-full rounded-xl border border-gray-200 bg-white px-10 py-4 font-bold text-gray-700 transition-all duration-300 hover:bg-gray-50 sm:w-auto"
          >
            Hủy chỉnh sửa
          </button>
        )}
      </div>
    </form>
  );
}


