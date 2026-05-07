'use client';

import { useEffect, useMemo, useState } from 'react';
import { Employee, getEmployees } from '@/lib/firebase/employees';
import {
  FACTORIES,
  formatCurrency,
  formatNumberInput,
  getStandardWorkingDays,
  getWorkScheduleLabel,
  isoMonthToMmYyyy,
  normalizeMonthToIso,
  parseFormattedNumber,
} from '@/lib/employees';
import {
  type ManualAllowanceLine,
  type SalaryRecord,
  STANDARD_WORKING_DAYS,
  NIGHT_SHIFT_ALLOWANCE,
  FOOD_ALLOWANCE_PER_DAY,
  FULL_ATTENDANCE_BONUS,
  MAX_MANUAL_ALLOWANCE_LINES,
  addSalaryRecord,
  buildSalaryRecord,
  getSalaryRecordsByMonth,
  updateSalaryRecord,
} from '@/lib/firebase/salaries';
import toast from 'react-hot-toast';
import { MonthPickerField } from './DateTimePickerField';

interface SalaryFormProps {
  editingRecord?: SalaryRecord | null;
  refreshToken?: number;
  onCancelEdit?: () => void;
  onSuccess?: () => void;
}

type SalaryNumericField =
  | 'nightShifts'
  | 'leaveDays'
  | 'foodAllowanceDays'
  | 'advancePayment';

interface SalaryFormState {
  nightShifts: number;
  leaveDays: number;
  foodAllowanceDays: number;
  advancePayment: number;
  manualAllowanceLines: ManualAllowanceLine[];
}

const getCurrentMonthValue = () => new Date().toISOString().slice(0, 7);

const emptyManualLine = (): ManualAllowanceLine => ({ label: '', amount: 0 });

const initialFormState: SalaryFormState = {
  nightShifts: 0,
  leaveDays: 0,
  foodAllowanceDays: 0,
  advancePayment: 0,
  manualAllowanceLines: [],
};

const fieldClassName =
  'h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-base leading-none text-gray-900 focus:border-success focus:outline-none focus:ring-4 focus:ring-success/10 transition-all duration-300';

const readOnlyFieldClassName =
  'h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-base leading-none text-gray-400 cursor-not-allowed select-none transition-all duration-300';

const mapRecordToFormState = (record: SalaryRecord): SalaryFormState => ({
  nightShifts: record.nightShifts,
  leaveDays: record.leaveDays,
  foodAllowanceDays:
    record.foodAllowanceDays ?? Math.round((record.foodAllowance ?? 0) / FOOD_ALLOWANCE_PER_DAY),
  advancePayment: record.advancePayment,
  manualAllowanceLines:
    record.manualAllowanceLines && record.manualAllowanceLines.length > 0
      ? record.manualAllowanceLines.map((line) => ({
          label: line.label,
          amount: line.amount,
        }))
      : [],
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
  const [monthText, setMonthText] = useState(() => isoMonthToMmYyyy(getCurrentMonthValue()));
  const [formData, setFormData] = useState<SalaryFormState>(initialFormState);

  const isEditing = Boolean(editingRecord?.id);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (isEditing && editingRecord) {
      setMonth(editingRecord.month);
      setMonthText(isoMonthToMmYyyy(editingRecord.month));
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
          workSchedule: editingRecord.workSchedule ?? 'sunday-off',
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
    setFormData((prev) => ({
      ...prev,
      manualAllowanceLines: prev.manualAllowanceLines.filter((_, i) => i !== index),
    }));
  };

  const resetCreateForm = () => {
    setSelectedEmployee(null);
    setFormData(initialFormState);
    const currentMonth = getCurrentMonthValue();
    setMonth(currentMonth);
    setMonthText(isoMonthToMmYyyy(currentMonth));
  };

  const commitMonthText = () => {
    const normalized = normalizeMonthToIso(monthText);
    if (!normalized) {
      toast.error('Tháng không hợp lệ. Dùng định dạng mm/yyyy');
      setMonthText(isoMonthToMmYyyy(month));
      return;
    }

    setMonth(normalized);
    setMonthText(isoMonthToMmYyyy(normalized));
  };

  const handleCancelEdit = () => {
    onCancelEdit?.();
    resetCreateForm();
  };

  const previewWorkSchedule =
    (isEditing
      ? editingRecord?.workSchedule ?? selectedEmployee?.workSchedule
      : selectedEmployee?.workSchedule) ?? 'sunday-off';
  const previewStandardWorkingDays =
    isEditing && editingRecord
      ? editingRecord.standardWorkingDays
      : getStandardWorkingDays(month, previewWorkSchedule) || STANDARD_WORKING_DAYS;

  const maxDays = getStandardWorkingDays(month, previewWorkSchedule);
  const workedDays = Math.max(0, previewStandardWorkingDays - formData.leaveDays);
  const attendanceBonus = formData.leaveDays === 0 ? FULL_ATTENDANCE_BONUS : 0;
  const foodAllowance = formData.foodAllowanceDays * FOOD_ALLOWANCE_PER_DAY;
  const isOverMaxDays = formData.leaveDays > maxDays;
  const isOverNightShiftDays = formData.nightShifts > workedDays;

  const salaryPreview: SalaryRecord | null = selectedEmployee
    ? buildSalaryRecord({
        id: editingRecord?.id,
        employeeId: selectedEmployee.id ?? '',
        employeeName: selectedEmployee.name,
        baseSalary: isEditing && editingRecord ? editingRecord.baseSalary : selectedEmployee.salary,
        workSchedule: previewWorkSchedule,
        foodAllowanceDays: formData.foodAllowanceDays,
        foodAllowance,
        standardWorkingDays: previewStandardWorkingDays,
        dayShifts: workedDays,
        nightShifts: formData.nightShifts,
        leaveDays: formData.leaveDays,
        advancePayment: formData.advancePayment,
        attendanceBonus,
        otherAllowance: 0,
        manualAllowanceLines: formData.manualAllowanceLines,
        otherDeduction: 0,
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

    if (isOverMaxDays) {
      toast.error(`Số ngày nghỉ (${formData.leaveDays}) vượt quá giới hạn của tháng (${maxDays})`);
      return;
    }

    if (isOverNightShiftDays) {
      toast.error(`Số công đêm (${formData.nightShifts}) không được lớn hơn số ngày đi làm (${workedDays})`);
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
              Chọn nhân viên và tháng tính lương. Lương cơ bản lấy từ hồ sơ.
            </p>
          </div>

          {isEditing && editingRecord && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Đang chỉnh sửa bảng lương của <span className="font-bold">{editingRecord.employeeName}</span> tháng{' '}
              <span className="font-bold">{isoMonthToMmYyyy(editingRecord.month)}</span>.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={`mb-1.5 ml-1 block text-sm font-semibold ${isEditing ? 'text-gray-400' : 'text-gray-700'}`}>
                Nhân viên *
              </label>
              {isEditing ? (
                <div className={readOnlyFieldClassName + ' flex items-center'}>
                  {selectedEmployee?.name ?? '--'}
                </div>
              ) : (
                <div className="relative">
                  <select
                    onChange={handleChangeSelect}
                    value={selectedEmployee?.id || ''}
                    className={fieldClassName + ' appearance-none pr-10'}
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
              )}
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
              <label className={`mb-1.5 ml-1 block text-sm font-semibold ${isEditing ? 'text-gray-400' : 'text-gray-700'}`}>
                Tháng *
              </label>
              {isEditing ? (
                <div className={readOnlyFieldClassName + ' flex items-center'}>
                  {isoMonthToMmYyyy(month)}
                </div>
              ) : (
                <MonthPickerField
                  value={monthText}
                  selectedMonth={month}
                  inputClassName={fieldClassName}
                  placeholder="mm/yyyy"
                  accentClassName="bg-success text-white"
                  onTextChange={setMonthText}
                  onTextBlur={commitMonthText}
                  onSelectMonth={(nextMonth) => {
                    setMonth(nextMonth);
                    setMonthText(isoMonthToMmYyyy(nextMonth));
                  }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-400">
                Lương cơ bản
              </label>
              <div className={readOnlyFieldClassName + ' flex items-center font-semibold'}>
                {salaryPreview ? formatCurrency(salaryPreview.baseSalary) : '--'}
              </div>
            </div>
            <div>
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-400">
                Chế độ làm việc
              </label>
              <div className={readOnlyFieldClassName + ' flex items-center font-semibold'}>
                {salaryPreview ? getWorkScheduleLabel(salaryPreview.workSchedule) : '--'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-400">
                Định mức tháng
              </label>
              <div className={readOnlyFieldClassName + ' flex items-center font-semibold'}>
                {salaryPreview
                  ? `${salaryPreview.standardWorkingDays} ngày - ${formatCurrency(
                      salaryPreview.workingDayRate ?? 0
                    )}/công`
                  : '--'}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">2. Chấm công</h3>
            <p className="mt-1 text-sm text-gray-500">
              Lương công tính theo ngày công chuẩn trừ ngày nghỉ. Công đêm chỉ dùng để cộng phụ cấp x {formatCurrency(NIGHT_SHIFT_ALLOWANCE)}. Ô số dùng dấu
              <span className="font-semibold">.</span> phân cách hàng nghìn; khi trống tương đương 0.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-3">
            {selectedEmployee && (
              <>
                <div className="rounded-xl border border-blue-50 bg-blue-50/50 px-4 py-2 text-xs text-blue-700">
                  <span className="font-semibold">Định mức tháng {isoMonthToMmYyyy(month)}:</span>{' '}
                  <span className="font-bold">{maxDays} ngày</span> ({getWorkScheduleLabel(selectedEmployee?.workSchedule)})
                </div>

                {isOverMaxDays && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <p className="flex items-center gap-2 font-bold">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      Vượt định mức ngày nghỉ!
                    </p>
                    <p className="mt-1 text-red-700">
                      Số ngày nghỉ ({formData.leaveDays} ngày) vượt quá số ngày làm việc tối đa của tháng ({maxDays} ngày). Vui lòng kiểm tra lại.
                    </p>
                  </div>
                )}

                {isOverNightShiftDays && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <p className="font-bold">Số công đêm lớn hơn ngày đi làm</p>
                    <p className="mt-1 text-red-700">
                      Nhân viên đang có {workedDays} ngày công, nhưng nhập {formData.nightShifts} công đêm.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
                  <p>
                    Ngày công tính lương:{' '}
                    <span className="font-bold">{workedDays} ngày</span>
                  </p>
                  <p className="mt-1">
                    Phụ cấp đêm:{' '}
                    <span className="font-bold">{formatCurrency(salaryPreview?.nightAllowance ?? 0)}</span>
                  </p>
                  <p className="mt-1 text-indigo-700">
                    {formData.nightShifts} công đêm x {formatCurrency(NIGHT_SHIFT_ALLOWANCE)}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-6 lg:col-span-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">3. Thêm / Trừ</h3>
            <p className="mt-1 text-sm text-gray-500">
              Nhập các khoản phát sinh thực tế trong tháng. Tiền ăn, nhà trọ và chuyên cần được hệ thống tính tự động.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-success">Khoản cộng (+)</p>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                    Số ngày ăn
                  </label>
                  <div className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-base text-gray-900 transition-all duration-300 focus-within:border-success focus-within:ring-4 focus-within:ring-success/10">
                    <input
                      type="text"
                      inputMode="numeric"
                      name="foodAllowanceDays"
                      autoComplete="off"
                      value={formatNumberInput(formData.foodAllowanceDays)}
                      onChange={handleFormattedNumberChange('foodAllowanceDays')}
                      onFocus={selectAllOnFocus}
                      className="min-w-0 flex-1 bg-transparent text-base leading-none text-gray-900 outline-none"
                      placeholder="0"
                    />
                    <span className="shrink-0 pl-3 text-sm font-semibold text-gray-400">
                      x {formatCurrency(FOOD_ALLOWANCE_PER_DAY)} ={' '}
                      <span className="text-success">{formatCurrency(foodAllowance)}</span>
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                    Nhà trọ
                  </label>
                  <div className={readOnlyFieldClassName + ' flex items-center justify-between gap-3'}>
                    <span>{formatCurrency(salaryPreview?.otherAllowance ?? 0)}</span>
                    <span className="text-xs font-semibold text-gray-400">
                      {workedDays} công
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
                    Chuyên cần
                  </label>
                  <div className={readOnlyFieldClassName + ' flex items-center'}>
                    <span>{formatCurrency(salaryPreview?.attendanceBonus ?? attendanceBonus)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-500">Khoản trừ (-)</p>
              <div className="grid grid-cols-1 gap-4">
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
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-success/10 bg-success/5 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Khoản cộng thêm (tự nhập)</p>
                <p className="text-xs text-gray-500">
                  Mỗi dòng: tên khoản + số tiền. Tối đa {MAX_MANUAL_ALLOWANCE_LINES} dòng.
                </p>
              </div>
              <button
                type="button"
                onClick={addManualLine}
                disabled={formData.manualAllowanceLines.length >= MAX_MANUAL_ALLOWANCE_LINES}
                className="flex items-center justify-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-success-hover active:scale-95 disabled:opacity-50 sm:mt-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Thêm dòng
              </button>
            </div>

            {formData.manualAllowanceLines.length > 0 && (
              <div className="mt-4 space-y-3">
                {formData.manualAllowanceLines.map((line, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-xl border border-success/10 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <label className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
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
                    <div className="w-full sm:w-48">
                      <label className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
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
                      className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-red-50 px-4 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                      aria-label="Xóa dòng"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Xóa
                    </button>
                  </div>
                ))}

                {salaryPreview && (salaryPreview.manualAllowanceTotal ?? 0) !== 0 && (
                  <p className="mt-4 text-right text-sm font-black text-success">
                    Tổng các khoản tự nhập: {formatCurrency(salaryPreview.manualAllowanceTotal ?? 0)}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {salaryPreview && (
        <section className="rounded-3xl border border-success/15 bg-gradient-to-br from-success-light via-white to-primary-light/50 p-6 shadow-premium sm:p-8">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-success">
                  4. Tổng kết động
                </p>
                <h3 className="mt-2 text-2xl font-black text-gray-900">
                  Kết quả lương cập nhật theo từng thay đổi
                </h3>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Công thức thực lãnh</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-black text-gray-900">
                  <span>{formatCurrency(salaryPreview.grossWorkSalary ?? 0)}</span>
                  <span className="text-success">+</span>
                  <span>{formatCurrency(salaryPreview.totalAllowance ?? 0)}</span>
                  <span className="text-red-500">-</span>
                  <span>{formatCurrency(salaryPreview.totalDeduction ?? 0)}</span>
                  <span className="text-gray-400">=</span>
                  <span className="text-success">{formatCurrency(salaryPreview.totalSalary ?? 0)}</span>
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-success/15 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Lương thực lãnh</p>
              <p className="mt-2 text-4xl font-black text-success">
                {formatCurrency(salaryPreview.totalSalary ?? 0)}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Sau khi cộng lương công, phụ cấp và trừ các khoản phát sinh.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryMetric
              label="Lương công"
              value={formatCurrency(salaryPreview.grossWorkSalary ?? 0)}
              description={`${workedDays} công / ${salaryPreview.standardWorkingDays} ngày chuẩn`}
              tone="neutral"
            />
            <SummaryMetric
              label="Tổng phụ cấp"
              value={formatCurrency(salaryPreview.totalAllowance ?? 0)}
              description="Gồm tiền ăn, nhà trọ, ca đêm, chuyên cần và khoản cộng thêm"
              tone="positive"
            />
            <SummaryMetric
              label="Tổng bị trừ"
              value={formatCurrency(salaryPreview.totalDeduction ?? 0)}
              description="Tạm ứng"
              tone="negative"
            />
            <SummaryMetric
              label="Ngày công"
              value={`${workedDays}/${salaryPreview.standardWorkingDays}`}
              description={`Nghỉ ${formData.leaveDays} ngày, ca đêm ${formData.nightShifts} công`}
              tone="info"
            />
          </div>

          <div className="mt-6 rounded-3xl border border-white/80 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-5 text-sm lg:grid-cols-3">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-success">
                  Khoản cộng vào lương
                </p>
                <div className="divide-y divide-gray-100">
                  <BreakdownRow
                    label="Lương công"
                    value={formatCurrency(salaryPreview.grossWorkSalary ?? 0)}
                    tone="positive"
                  />
                  <BreakdownRow
                    label="Tiền ăn"
                    value={formatCurrency(salaryPreview.foodAllowance)}
                    tone="positive"
                  />
                  <BreakdownRow
                    label="Nhà trọ"
                    value={formatCurrency(salaryPreview.otherAllowance)}
                    tone="positive"
                  />
                  <BreakdownRow
                    label="Phụ cấp đêm"
                    value={formatCurrency(salaryPreview.nightAllowance ?? 0)}
                    tone="positive"
                  />
                  <BreakdownRow
                    label="Chuyên cần"
                    value={formatCurrency(salaryPreview.attendanceBonus)}
                    tone="positive"
                  />
                  {salaryPreview.manualAllowanceLines?.map((line, i) => (
                    <BreakdownRow
                      key={i}
                      label={line.label}
                      value={formatCurrency(line.amount)}
                      tone={line.amount < 0 ? 'negative' : 'positive'}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-red-500">
                  Khoản trừ
                </p>
                <div className="divide-y divide-gray-100">
                  <BreakdownRow
                    label="Tạm ứng"
                    value={formatCurrency(formData.advancePayment)}
                    tone="negative"
                  />
                  <BreakdownRow
                    label="Tổng bị trừ"
                    value={formatCurrency(salaryPreview.totalDeduction ?? 0)}
                    tone="negative"
                    strong
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                  Công và lịch
                </p>
                <div className="divide-y divide-gray-100">
                  <BreakdownRow label="Ngày tính lương" value={`${workedDays} công`} />
                  <BreakdownRow label="Số ngày nghỉ" value={`${formData.leaveDays} ngày`} />
                  <BreakdownRow label="Số ca đêm" value={`${formData.nightShifts} ca`} />
                  <BreakdownRow label="Định mức tháng" value={`${salaryPreview.standardWorkingDays} ngày`} />
                  <BreakdownRow
                    label="Lương/Ngày"
                    value={formatCurrency(salaryPreview.workingDayRate ?? 0)}
                  />
                  <BreakdownRow
                    label="Chế độ làm việc"
                    value={getWorkScheduleLabel(salaryPreview.workSchedule)}
                    alignTop
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading || !selectedEmployee || isOverMaxDays || isOverNightShiftDays}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-10 py-4 font-bold text-white transition-all duration-300 hover:bg-accent-hover disabled:bg-gray-200 sm:w-auto"
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

function SummaryMetric({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: 'neutral' | 'positive' | 'negative' | 'info';
}) {
  const toneClassName = {
    neutral: 'text-gray-900',
    positive: 'text-success',
    negative: 'text-red-600',
    info: 'text-primary',
  }[tone];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${toneClassName}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  tone = 'neutral',
  strong = false,
  alignTop = false,
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'positive' | 'negative';
  strong?: boolean;
  alignTop?: boolean;
}) {
  const valueClassName = {
    neutral: 'text-gray-900',
    positive: 'text-success',
    negative: 'text-red-600',
  }[tone];

  return (
    <div
      className={`flex justify-between gap-4 py-3 text-gray-600 ${
        alignTop ? 'items-start' : 'items-center'
      } ${strong ? 'font-bold' : ''}`}
    >
      <span>{label}</span>
      <span className={`shrink-0 text-right font-semibold tabular-nums ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}
