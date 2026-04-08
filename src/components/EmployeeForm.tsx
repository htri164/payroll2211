'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  type Employee,
  createEmployeeDraft,
  FACTORIES,
  formatNumberInput,
  parseFormattedNumber,
} from '@/lib/employees';
import { addEmployee, updateEmployee } from '@/lib/firebase/employees';

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess?: () => void;
}

const inputClassName =
  'w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function EmployeeForm({ employee, onSuccess }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => createEmployeeDraft(employee));

  useEffect(() => {
    setFormData(createEmployeeDraft(employee));
  }, [employee]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        name === 'salary' || name === 'foodAllowance'
          ? parseFormattedNumber(value)
          : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedPosition = formData.position?.trim() ?? '';

    if (!trimmedName || formData.salary <= 0) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    const payload: Employee = {
      ...formData,
      name: trimmedName,
      position: trimmedPosition,
    };

    setLoading(true);

    try {
      if (employee?.id) {
        await updateEmployee(employee.id, payload);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await addEmployee(payload);
        toast.success('Thêm nhân viên thành công');
        setFormData(createEmployeeDraft());
      }

      onSuccess?.();
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="employee-name" className="mb-1 block text-sm font-medium text-gray-700">
          Tên nhân viên *
        </label>
        <input
          id="employee-name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={inputClassName}
          required
        />
      </div>

      <div>
        <label htmlFor="employee-position" className="mb-1 block text-sm font-medium text-gray-700">
          Chức vụ
        </label>
        <input
          id="employee-position"
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="employee-salary" className="mb-1 block text-sm font-medium text-gray-700">
          Lương cơ bản (VND) *
        </label>
        <input
          id="employee-salary"
          type="text"
          inputMode="numeric"
          name="salary"
          value={formatNumberInput(formData.salary)}
          onChange={handleChange}
          className={inputClassName}
          required
        />
      </div>

      <div>
        <label htmlFor="employee-food-allowance" className="mb-1 block text-sm font-medium text-gray-700">
          Phụ cấp ăn (VND)
        </label>
        <input
          id="employee-food-allowance"
          type="text"
          inputMode="numeric"
          name="foodAllowance"
          value={formatNumberInput(formData.foodAllowance)}
          onChange={handleChange}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="employee-join-date" className="mb-1 block text-sm font-medium text-gray-700">
          Ngày làm việc
        </label>
        <input
          id="employee-join-date"
          type="date"
          name="joinDate"
          value={formData.joinDate}
          onChange={handleChange}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="employee-factory" className="mb-1 block text-sm font-medium text-gray-700">
          Xưởng
        </label>
        <select
          id="employee-factory"
          name="factory"
          value={formData.factory}
          onChange={handleChange}
          className={inputClassName}
        >
          {FACTORIES.map((factory) => (
            <option key={factory} value={factory}>
              {factory}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang xử lý...' : employee ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
}