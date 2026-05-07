'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SalaryRecord, getSalaryRecordsByMonth } from '@/lib/firebase/salaries';
import { formatCurrency, isoMonthToMmYyyy } from '@/lib/employees';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const fmt = (v: number | undefined) => formatCurrency(v ?? 0);

function SummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const month =
    searchParams.get('month') ||
    new Date().toISOString().split('T')[0].slice(0, 7);

  useEffect(() => {
    fetchSalaries();
  }, [month]);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const data = await getSalaryRecordsByMonth(month);
      setSalaries(data);
      if (data.length === 0) {
        toast.error('Không có bảng lương cho tháng này');
      }
    } catch (error) {
      toast.error('Lỗi tải dữ liệu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (m: string) => {
    const [y, mo] = m.split('-');
    return `Tháng ${mo}/${y}`;
  };

  /* ---- Totals row ---- */
  const totals = salaries.reduce(
    (acc, s) => ({
      baseSalary: acc.baseSalary + (s.baseSalary ?? 0),
      standardWorkingDays: acc.standardWorkingDays + (s.standardWorkingDays ?? 0),
      leaveDays: acc.leaveDays + (s.leaveDays ?? 0),
      dayShifts: acc.dayShifts + (s.dayShifts ?? 0),
      nightShifts: acc.nightShifts + (s.nightShifts ?? 0),
      grossWorkSalary: acc.grossWorkSalary + (s.grossWorkSalary ?? 0),
      foodAllowance: acc.foodAllowance + (s.foodAllowance ?? 0),
      nightAllowance: acc.nightAllowance + (s.nightAllowance ?? 0),
      attendanceBonus: acc.attendanceBonus + (s.attendanceBonus ?? 0),
      otherAllowance:
        acc.otherAllowance +
        (s.otherAllowance ?? 0) +
        (s.manualAllowanceTotal ?? 0),
      totalAllowance: acc.totalAllowance + (s.totalAllowance ?? 0),
      advancePayment: acc.advancePayment + (s.advancePayment ?? 0),
      totalDeduction: acc.totalDeduction + (s.totalDeduction ?? 0),
      totalSalary: acc.totalSalary + (s.totalSalary ?? 0),
    }),
    {
      baseSalary: 0,
      standardWorkingDays: 0,
      leaveDays: 0,
      dayShifts: 0,
      nightShifts: 0,
      grossWorkSalary: 0,
      foodAllowance: 0,
      nightAllowance: 0,
      attendanceBonus: 0,
      otherAllowance: 0,
      totalAllowance: 0,
      advancePayment: 0,
      totalDeduction: 0,
      totalSalary: 0,
    }
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"
            role="status"
          />
          <p className="mt-4 font-medium text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (salaries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-500">
            Không có bảng lương nào cho {formatMonth(month)}
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ===== Toolbar (hidden when printing) ===== */}
      <header className="no-print fixed top-0 left-0 right-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50"
              aria-label="Quay lại trang trước"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Bảng tổng hợp lương</h1>
              <p className="text-xs text-gray-500">
                {formatMonth(month)} — {salaries.length} nhân viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden text-xs text-gray-400 sm:block">
              Mẹo: Tắt <strong>Headers and footers</strong> trong Chrome khi in
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-primary-hover"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              In bảng lương
            </button>
          </div>
        </div>
      </header>

      {/* ===== Print-only styles: landscape + table formatting ===== */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-summary-wrapper {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-summary-title {
            font-size: 15px !important;
            margin-bottom: 4px !important;
          }
          .print-summary-subtitle {
            font-size: 11px !important;
            margin-bottom: 8px !important;
          }
          .print-summary-table {
            font-size: 10px !important;
          }
          .print-summary-table th,
          .print-summary-table td {
            padding: 3px 5px !important;
          }
        }
      `}</style>

      {/* ===== Content ===== */}
      <div className="print-summary-wrapper pt-20 pb-12 print:pt-0 print:pb-0">
        <div className="mx-auto max-w-7xl px-4 print:max-w-none print:px-0">
          {/* Title block */}
          <h2 className="print-summary-title mb-1 text-center text-xl font-bold text-gray-900 print:text-black">
            BẢNG TỔNG HỢP LƯƠNG
          </h2>
          <p className="print-summary-subtitle mb-6 text-center text-sm text-gray-600 print:text-black">
            {formatMonth(month)} — Tổng: {salaries.length} nhân viên
          </p>

          {/* The table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
            <table className="print-summary-table w-full border-collapse text-xs print:text-[10px]">
              <thead>
                <tr className="bg-gray-50 print:bg-transparent">
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700 print:text-black">
                    STT
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-bold text-gray-700 print:text-black">
                    Họ tên
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-gray-700 print:text-black">
                    Lương cơ bản
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700 print:text-black">
                    Công tháng
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700 print:text-black">
                    Ngày nghỉ
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700 print:text-black">
                    Công thực tế
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700 print:text-black">
                    Công đêm
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-gray-700 print:text-black">
                    Lương công
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-gray-700 print:text-black">
                    Phụ cấp Ăn
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-gray-700 print:text-black">
                    Phụ cấp Đêm
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-gray-700 print:text-black">
                    Chuyên cần
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-gray-700 print:text-black">
                    Phụ cấp Khác
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-gray-700 print:text-black">
                    Tạm ứng
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-gray-900 print:text-black">
                    Tổng nhận
                  </th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-gray-50/60 print:hover:bg-transparent"
                  >
                    <td className="border border-gray-200 px-2 py-1.5 text-center tabular-nums text-gray-600 print:border-gray-400 print:text-black">
                      {idx + 1}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-900 whitespace-nowrap print:border-gray-400 print:text-black">
                      {s.employeeName}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {fmt(s.baseSalary)}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {s.standardWorkingDays}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {s.leaveDays || '-'}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {s.dayShifts}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {s.nightShifts || '-'}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {fmt(s.grossWorkSalary)}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {fmt(s.foodAllowance)}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {(s.nightAllowance ?? 0) > 0 ? fmt(s.nightAllowance) : '-'}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {(s.attendanceBonus ?? 0) > 0 ? fmt(s.attendanceBonus) : '-'}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {((s.otherAllowance ?? 0) + (s.manualAllowanceTotal ?? 0)) > 0
                        ? fmt((s.otherAllowance ?? 0) + (s.manualAllowanceTotal ?? 0))
                        : '-'}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700 print:border-gray-400 print:text-black">
                      {(s.advancePayment ?? 0) > 0 ? `-${fmt(s.advancePayment)}` : '-'}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums font-bold text-gray-900 print:border-gray-400 print:text-black">
                      {fmt(s.totalSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* ===== Totals row ===== */}
              <tfoot>
                <tr className="bg-gray-50 font-bold print:bg-transparent">
                  <td
                    colSpan={2}
                    className="border border-gray-300 px-2 py-2 text-center font-bold text-gray-900 print:border-gray-400 print:text-black"
                  >
                    Tổng
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {/* Không tính tổng lương CB theo yêu cầu */}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {totals.standardWorkingDays}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {totals.leaveDays}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {totals.dayShifts}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {totals.nightShifts}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {fmt(totals.grossWorkSalary)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {fmt(totals.foodAllowance)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {fmt(totals.nightAllowance)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {fmt(totals.attendanceBonus)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {fmt(totals.otherAllowance)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {totals.advancePayment > 0 ? `-${fmt(totals.advancePayment)}` : '-'}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right tabular-nums text-gray-900 print:border-gray-400 print:text-black">
                    {fmt(totals.totalSalary)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PrintSummaryPage() {
  return (
    <div className="min-h-screen bg-gray-100 print:min-h-0 print:bg-white">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"
                role="status"
              />
              <p className="mt-4 font-medium text-gray-500">Đang tải...</p>
            </div>
          </div>
        }
      >
        <SummaryContent />
      </Suspense>
    </div>
  );
}
