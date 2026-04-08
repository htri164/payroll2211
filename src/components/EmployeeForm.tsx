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
  'h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-[16px] leading-none text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300';

const selectClassName =
  'h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 pr-10 text-[16px] leading-none text-gray-900 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300';

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
    setLoading(true);

    try {
      const trimmedName = formData.name.trim();
      if (!trimmedName) throw new Error("Vui lòng nhập tên nhân viên");
      if (formData.salary <= 0) throw new Error("Lương cơ bản phải lớn hơn 0");

      const payload: Employee = {
        ...formData,
        name: trimmedName,
      };

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
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="employee-name" className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
          Tên nhân viên *
        </label>
        <input
          id="employee-name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={inputClassName}
          placeholder="Nhập tên nhân viên"
          required
        />
      </div>

      <div>
        <label htmlFor="employee-salary" className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
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
          placeholder="Ví dụ: 8.500.000"
          required
        />
      </div>

      <div>
        <label htmlFor="employee-food-allowance" className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
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
          placeholder="Ví dụ: 500.000"
        />
      </div>

      <div>
        <label htmlFor="employee-join-date" className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
          Ngày làm việc
        </label>
        <input
          id="employee-join-date"
          type="date"
          name="joinDate"
          value={formData.joinDate}
          onChange={handleChange}
          className={`${inputClassName} [&::-webkit-calendar-picker-indicator]:hidden`}
        />
      </div>

      <div>
        <label htmlFor="employee-factory" className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
          Xưởng
        </label>
        <div className="relative">
          <select
            id="employee-factory"
            name="factory"
            value={formData.factory}
            onChange={handleChange}
            className={`${selectClassName} appearance-none pr-10`}
          >
            {FACTORIES.map((factory) => (
              <option key={factory} value={factory}>
                {factory}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-gray-400"
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

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary-hover disabled:bg-gray-300 transition-all duration-300 premium-shadow group flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : employee ? (
            'Cập nhật thông tin'
          ) : (
            <>
              Thêm nhân viên
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}