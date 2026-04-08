'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import EmployeeForm from './EmployeeForm';
import { isConfigured } from '@/lib/firebase/config';
import { deleteEmployee, getEmployees } from '@/lib/firebase/employees';
import { formatCurrency, formatDate, type Employee } from '@/lib/employees';

interface EmployeeListProps {
  onRefresh?: () => void;
  refreshToken?: number;
}

export default function EmployeeList({ onRefresh, refreshToken = 0 }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured()) {
      setEmployees([]);
      return;
    }

    const fetchEmployees = async () => {
      setLoading(true);

      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Không thể tải danh sách nhân viên';
        console.warn(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchEmployees();
  }, [refreshToken]);

  const editingEmployee = useMemo(
    () => employees.find((employee) => employee.id === editingId),
    [employees, editingId]
  );

  const handleDelete = async (id?: string) => {
    if (!id) {
      return;
    }

    if (!window.confirm('Bạn chắc chắn muốn xóa nhân viên này?')) {
      return;
    }

    try {
      await deleteEmployee(id);
      setEmployees((current) => current.filter((employee) => employee.id !== id));
      if (editingId === id) {
        setEditingId(null);
      }
      toast.success('Xóa thành công');
      onRefresh?.();
    } catch (error) {
      toast.error('Lỗi xóa nhân viên');
      console.error(error);
    }
  };

  if (!isConfigured()) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
        Cần cấu hình Firebase trước khi quản lý danh sách nhân viên.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {editingEmployee && (
        <section className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa nhân viên</h3>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Hủy
            </button>
          </div>
          <EmployeeForm
            employee={editingEmployee}
            onSuccess={async () => {
              setEditingId(null);
              const data = await getEmployees();
              setEmployees(data);
              onRefresh?.();
            }}
          />
        </section>
      )}

      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Danh sách nhân viên</h3>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Đang tải...</div>
        ) : employees.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Chưa có nhân viên nào</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gray-100 text-sm">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Tên</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Chức vụ</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Lương cơ bản</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Phụ cấp ăn</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Ngày làm việc</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Xưởng</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{employee.name}</td>
                    <td className="px-4 py-3 text-gray-600">{employee.position || '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatCurrency(employee.salary)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatCurrency(employee.foodAllowance)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{formatDate(employee.joinDate)}</td>
                    <td className="px-4 py-3 text-gray-900">{employee.factory}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(employee.id ?? null)}
                          className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(employee.id)}
                          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}