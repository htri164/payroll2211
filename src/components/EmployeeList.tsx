'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { isConfigured } from '@/lib/firebase/config';
import { deleteEmployee, getEmployees } from '@/lib/firebase/employees';
import { formatCurrency, formatDate, type Employee } from '@/lib/employees';

interface EmployeeListProps {
  onRefresh?: () => void;
  refreshToken?: number;
  /** Id nhân viên đang mở trên form (để tô sáng dòng) */
  selectedEmployeeId?: string | null;
  /** Chọn nhân viên để đổ dữ liệu lên form bên trái */
  onSelectEmployee?: (employee: Employee) => void;
  onClearSelection?: () => void;
}

function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function EmployeeList({
  onRefresh,
  refreshToken = 0,
  selectedEmployeeId = null,
  onSelectEmployee,
  onClearSelection,
}: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const normalizedQuery = removeAccents(searchQuery);
    return employees.filter((emp) => removeAccents(emp.name).includes(normalizedQuery));
  }, [employees, searchQuery]);

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
      if (selectedEmployeeId === id) {
        onClearSelection?.();
      }
      toast.success('Xóa thành công');
      onRefresh?.();
    } catch (error) {
      toast.error('Lỗi xóa nhân viên');
      console.error(error);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (!isConfigured()) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Cần cấu hình Firebase trước khi quản lý danh sách nhân viên.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-8">
          <div className="group relative">
            <label htmlFor="search" className="sr-only">
              Tìm kiếm nhân viên
            </label>
            <input
              id="search"
              type="text"
              placeholder="Tìm theo tên nhân viên (VD: Bay, Tuấn...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-2xl border border-gray-100 bg-white px-6 py-4 pr-12 text-base text-gray-900 shadow-premium outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-2 text-gray-400 transition-colors hover:text-primary"
                  aria-label="Xóa tìm kiếm"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <svg className="h-6 w-6 text-gray-300 transition-colors group-focus-within:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
          {filteredEmployees.length !== employees.length && (
            <p className="ml-2 mt-3 text-sm font-medium text-gray-500">
              <span className="text-primary">{filteredEmployees.length}</span> kết quả phù hợp trên tổng số {employees.length} nhân viên
            </p>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)] font-sans">Đang tải...</span>
            </div>
            <p className="mt-4 font-medium font-sans text-gray-500">Đang tải danh sách...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-100 bg-white py-20 text-center">
            <p className="text-lg font-medium text-gray-400">
              {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có nhân viên nào trong hệ thống'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-premium">
            <table className="min-w-[780px] w-full table-auto border-collapse">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[20%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead>
                <tr className="bg-gray-100 text-sm">
                  <th className="px-5 py-4 text-left font-semibold text-gray-900">Tên</th>
                  <th className="px-5 py-4 text-right font-semibold text-gray-900">Lương cơ bản</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-900">Ngày làm việc</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-900">Xưởng</th>
                  <th className="px-5 py-4 text-center font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className={`border-t border-gray-200 align-middle hover:bg-gray-50 ${
                      employee.id === selectedEmployeeId ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                    }`}
                  >
                    <td className="px-5 py-4 text-gray-900">{employee.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-gray-900">
                      {formatCurrency(employee.salary)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-900">
                      {formatDate(employee.joinDate)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-900">{employee.factory}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => employee.id && onSelectEmployee?.(employee)}
                          className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(employee.id)}
                          className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
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
