'use client';

import { useState, useEffect } from 'react';
import { Employee, getEmployees, deleteEmployee } from '@/lib/firebase/employees';
import { isConfigured } from '@/lib/firebase/config';
import toast from 'react-hot-toast';
import EmployeeForm from './EmployeeForm';

interface EmployeeListProps {
  onRefresh?: () => void;
}

export default function EmployeeList({ onRefresh }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (isConfigured()) {
      fetchEmployees();
    }
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải danh sách nhân viên';
      console.warn(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa nhân viên này?')) {
      try {
        await deleteEmployee(id);
        toast.success('Xóa thành công');
        await fetchEmployees();
        onRefresh?.();
      } catch (error) {
        toast.error('Lỗi xóa nhân viên');
        console.error(error);
      }
    }
  };

  const editingEmployee = employees.find((e) => e.id === editingId);

  return (
    <div className="space-y-6">
      {editingId && editingEmployee && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Chỉnh sửa nhân viên</h3>
          <EmployeeForm
            employee={editingEmployee}
            onSuccess={() => {
              setEditingId(null);
              fetchEmployees();
              onRefresh?.();
            }}
          />
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Danh sách nhân viên</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có nhân viên nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 border border-gray-300">
                  <th className="px-4 py-2 text-left font-semibold text-gray-900">Tên</th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-900">Lương cơ bản</th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-900">Phụ cấp ăn</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border border-gray-300 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{emp.name}</td>
                    <td className="px-4 py-2 text-right text-gray-900">{emp.salary.toLocaleString('vi-VN')} đ</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {emp.foodAllowance.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => setEditingId(emp.id || null)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id || '')}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
