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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhân viên *
          </label>
          <select
            onChange={handleChangeSelect}
            value={selectedEmployee?.id || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Chọn nhân viên --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tháng *
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phụ phí thêm (VND)
          </label>
          <input
            type="number"
            name="additionalFees"
            value={formData.additionalFees}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thưởng (VND)
          </label>
          <input
            type="number"
            name="bonus"
            value={formData.bonus}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khấu trừ (VND)
          </label>
          <input
            type="number"
            name="deductions"
            value={formData.deductions}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {previewSalary !== undefined && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Lương cơ bản</p>
              <p className="text-lg font-bold text-gray-900">
                {selectedEmployee?.salary.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phụ cấp ăn</p>
              <p className="text-lg font-bold text-gray-900">
                {selectedEmployee?.foodAllowance.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Thêm/Trừ</p>
              <p className="text-lg font-bold text-gray-900">
                {(formData.additionalFees + formData.bonus - formData.deductions).toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng lương</p>
              <p className="text-lg font-bold text-green-600">
                {previewSalary ? previewSalary.toLocaleString('vi-VN') : '0'} đ
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={loading || !selectedEmployee}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang xử lý...' : 'Tính lương'}
        </button>
      </div>
    </form>
  );
}
