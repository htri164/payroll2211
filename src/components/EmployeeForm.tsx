'use client';

import { useState, useEffect } from 'react';
import { Employee, addEmployee, updateEmployee } from '@/lib/firebase/employees';
import toast from 'react-hot-toast';

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess?: () => void;
}

// Format number with thousands separator (e.g., 1000000 -> 1.000.000)
const formatNumber = (num: number): string => {
  if (num === 0 || !num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parse formatted string back to number (e.g., 1.000.000 -> 1000000)
const parseNumber = (str: string): number => {
  return parseFloat(str.replace(/\./g, '')) || 0;
};

export default function EmployeeForm({ employee, onSuccess }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Employee>({
    name: employee?.name || '',
    salary: employee?.salary || 0,
    foodAllowance: employee?.foodAllowance || 0,
    position: employee?.position || '',
    joinDate: employee?.joinDate || new Date().toISOString().split('T')[0],
    factory: employee?.factory || 'Xưởng 1',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update form data
    if (name === 'salary' || name === 'foodAllowance') {
      // Parse formatted number (remove dots) back to raw number
      const rawNumber = parseNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: rawNumber,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Toggle visual class so we can style empty vs filled inputs
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const isNumberField = name === 'salary' || name === 'foodAllowance';
    const hasValue = isNumberField ? target.value !== '' && target.value !== '0' : target.value !== '';
    target.classList.toggle('has-value', !!hasValue);
  };

  useEffect(() => {
    // Initialize input classes based on current formData (useful on mount or when editing existing employee)
    const root = document.getElementById('employee-form');
    if (!root) return;
    const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[name]'));
    inputs.forEach((input) => {
      const name = input.getAttribute('name') || '';
      const val = (formData as any)[name];
      if (name === 'salary' || name === 'foodAllowance') {
        // For number fields, check if value is greater than 0
        input.classList.toggle('has-value', val > 0);
      } else {
        input.classList.toggle('has-value', !!val);
      }
    });
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.salary <= 0) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      if (employee?.id) {
        await updateEmployee(employee.id, formData);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await addEmployee(formData);
        toast.success('Thêm nhân viên thành công');
        setFormData({
          name: '',
          salary: 0,
          foodAllowance: 0,
          position: '',
          joinDate: new Date().toISOString().split('T')[0],
          factory: 'Xưởng 1',
        });
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
    <form id="employee-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên nhân viên *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chức vụ
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lương cơ bản (VND) *
          </label>
          <input
            type="text"
            name="salary"
            value={formatNumber(formData.salary)}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phụ cấp ăn (VND)
          </label>
          <input
            type="text"
            name="foodAllowance"
            value={formatNumber(formData.foodAllowance)}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày làm việc
          </label>
          <input
            type="date"
            name="joinDate"
            value={formData.joinDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xưởng
          </label>
          <select
            name="factory"
            value={formData.factory}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Xưởng 1">Xưởng 1</option>
            <option value="Xưởng 2">Xưởng 2</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang xử lý...' : employee ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
}
