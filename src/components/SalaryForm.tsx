'use client';

import { useState, useEffect } from 'react';
import { Employee, getEmployees } from '@/lib/firebase/employees';
import {
  SalaryRecord,
  addSalaryRecord,
  calculateTotalSalary,
  getEmployeeSalaryRecord,
} from '@/lib/firebase/salaries';
import toast from 'react-hot-toast';

interface SalaryFormProps {
  onSuccess?: () => void;
}

export default function SalaryForm({ onSuccess }: SalaryFormProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [month, setMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7)); // YYYY-MM format

  const [formData, setFormData] = useState({
    additionalFees: 0,
    deductions: 0,
    bonus: 0,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải danh sách nhân viên';
      console.warn(message);
      // Firebase not configured - this is expected
    }
  };

  const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const emp = employees.find((emp) => emp.id === e.currentTarget.value);
    setSelectedEmployee(emp || null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !selectedEmployee.id) {
      toast.error('Vui lòng chọn nhân viên');
      return;
    }

    setLoading(true);
    try {
      // Check if salary record already exists for this employee and month
      const existing = await getEmployeeSalaryRecord(selectedEmployee.id, month);
      if (existing) {
        toast.error('Đã có bảng lương cho tháng này. Vui lòng chọn tháng khác');
        setLoading(false);
        return;
      }

      const record: SalaryRecord = {
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        baseSalary: selectedEmployee.salary,
        foodAllowance: selectedEmployee.foodAllowance,
        additionalFees: formData.additionalFees,
        deductions: formData.deductions,
        bonus: formData.bonus,
        month: month,
      };

      await addSalaryRecord(record);
      toast.success('Tính lương thành công');
      setSelectedEmployee(null);
      setFormData({ additionalFees: 0, deductions: 0, bonus: 0 });
      onSuccess?.();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const previewSalary =
    selectedEmployee
      ? calculateTotalSalary({
        employeeId: selectedEmployee.id || '',
        employeeName: selectedEmployee.name,
        baseSalary: selectedEmployee.salary,
        foodAllowance: selectedEmployee.foodAllowance,
        additionalFees: formData.additionalFees,
        deductions: formData.deductions,
        bonus: formData.bonus,
        month: month,
      })
      : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
            Nhân viên *
          </label>
          <div className="relative group">
            <select
              onChange={handleChangeSelect}
              value={selectedEmployee?.id || ''}
              className="h-12 w-full rounded-xl border border-gray-100 bg-white px-4 py-2 text-[16px] leading-none text-gray-900 shadow-sm focus:border-success focus:outline-none focus:ring-4 focus:ring-success/10 transition-all duration-300 appearance-none pr-10"
              required
            >
              <option value="">-- Chọn nhân viên --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400 group-focus-within:text-success transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
            Tháng *
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-[16px] leading-none text-gray-900 focus:border-success focus:outline-none focus:ring-4 focus:ring-success/10 transition-all duration-200 [&::-webkit-calendar-picker-indicator]:hidden"
            required
          />
        </div>

        {selectedEmployee && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lương cơ bản
              </label>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
                {selectedEmployee.salary.toLocaleString('vi-VN')} đ
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phụ cấp ăn
              </label>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
                {selectedEmployee.foodAllowance.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
            Phụ phí thêm (VND)
          </label>
          <input
            type="number"
            name="additionalFees"
            value={formData.additionalFees}
            onChange={handleChange}
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-[16px] leading-none text-gray-900 focus:border-success focus:outline-none focus:ring-4 focus:ring-success/10 transition-all duration-200"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
            Thưởng (VND)
          </label>
          <input
            type="number"
            name="bonus"
            value={formData.bonus}
            onChange={handleChange}
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-[16px] leading-none text-gray-900 focus:border-success focus:outline-none focus:ring-4 focus:ring-success/10 transition-all duration-200"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
            Khấu trừ (VND)
          </label>
          <input
            type="number"
            name="deductions"
            value={formData.deductions}
            onChange={handleChange}
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-[16px] leading-none text-gray-900 focus:border-success focus:outline-none focus:ring-4 focus:ring-success/10 transition-all duration-200"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {previewSalary !== undefined && (
        <div className="mt-8 p-8 bg-success-light rounded-2xl border border-success/10 premium-shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Lương cơ bản</p>
              <p className="text-xl font-extrabold text-gray-900 group-hover:text-success transition-colors">
                {selectedEmployee?.salary.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Phụ cấp ăn</p>
              <p className="text-xl font-extrabold text-gray-900 group-hover:text-success transition-colors">
                {selectedEmployee?.foodAllowance.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Thêm/Trừ</p>
              <p className={`text-xl font-extrabold ${formData.additionalFees + formData.bonus - formData.deductions >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {(formData.additionalFees + formData.bonus - formData.deductions).toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="flex flex-col gap-1 border-t sm:border-t-0 sm:border-l border-success/20 pt-4 sm:pt-0 sm:pl-8">
              <p className="text-xs uppercase tracking-wider text-success font-bold">Tổng lương thực nhận</p>
              <p className="text-3xl font-black text-success">
                {previewSalary ? previewSalary.toLocaleString('vi-VN') : '0'} đ
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <button
          type="submit"
          disabled={loading || !selectedEmployee}
          className="w-full sm:w-auto px-10 py-4 bg-success text-white font-bold rounded-xl hover:bg-success-hover disabled:bg-gray-200 transition-all duration-300 premium-shadow group flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <>
              Xác nhận tính lương
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
