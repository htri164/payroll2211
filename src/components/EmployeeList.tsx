'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { isConfigured } from '@/lib/firebase/config';
import { deleteEmployee, getEmployees } from '@/lib/firebase/employees';
import {
  formatCurrency,
  formatDate,
  getWorkScheduleLabel,
  type Employee,
} from '@/lib/employees';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
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
    } finally {
      setDeletingId(null);
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
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="mt-4 text-base font-medium text-gray-500">
              {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có nhân viên nào trong hệ thống'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-premium">
            <table className="min-w-[920px] w-full table-auto">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[18%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Tên</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Lương cơ bản</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Ngày làm việc</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Xưởng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Chế độ làm việc</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className={`align-middle transition-colors hover:bg-gray-50 ${
                      employee.id === selectedEmployeeId ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{employee.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-gray-700">
                      {formatCurrency(employee.salary)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                      {formatDate(employee.joinDate)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-700">{employee.factory}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                      {getWorkScheduleLabel(employee.workSchedule)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        {deletingId === employee.id ? (
                          <>
                            <span className="text-sm text-gray-500">Xác nhận xóa?</span>
                            <button
                              type="button"
                              onClick={() => employee.id && void handleDelete(employee.id)}
                              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-600"
                            >
                              Xóa
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50"
                            >
                              Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => employee.id && onSelectEmployee?.(employee)}
                              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-accent-hover"
                              aria-label={`Sửa nhân viên ${employee.name}`}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(employee.id ?? null)}
                              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-300 hover:bg-red-50"
                              aria-label={`Xóa nhân viên ${employee.name}`}
                            >
                              Xóa
                            </button>
                          </>
                        )}
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
