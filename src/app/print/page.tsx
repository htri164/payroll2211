'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SalaryRecord, getSalaryRecordsByMonth } from '@/lib/firebase/salaries';
import SalarySlip from '@/components/SalarySlip';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

function PrintContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const month = searchParams.get('month') || new Date().toISOString().split('T')[0].slice(0, 7);

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

  const pages: SalaryRecord[][] = [];
  for (let i = 0; i < salaries.length; i += 4) {
    pages.push(salaries.slice(i, i + 4));
  }

  const formatMonth = (m: string) => {
    const [y, mo] = m.split('-');
    return `Tháng ${mo}/${y}`;
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status" />
          <p className="mt-4 font-medium text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (salaries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-500">
            Không có bảng lương nào để in cho {formatMonth(month)}
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
      {/* Top toolbar — fixed */}
      <header className="no-print fixed top-0 left-0 right-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[240mm] items-center justify-between px-4 py-3">
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
              <h1 className="text-lg font-bold text-gray-900">In phiếu lương</h1>
              <p className="text-xs text-gray-500">{formatMonth(month)} — {salaries.length} phiếu ({pages.length} trang)</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In phiếu lương
            </button>
          </div>
        </div>
      </header>

      {/* Print styles */}
      <style>{`
        @media print {
          .print-page {
            width: 210mm;
            height: 297mm !important;
            max-height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 auto;
            padding: 3mm;
            box-sizing: border-box;
            page-break-after: always;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: 1fr 1fr !important;
            gap: 2mm !important;
            align-items: stretch;
            align-content: stretch;
            background: #fff;
            color: #000;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          .print-slip-cell {
            min-height: 0;
            min-width: 0;
            max-height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print-slip-cell .salary-slip {
            flex: 1 1 auto;
            min-height: 0;
            max-height: 100%;
            overflow: hidden;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color: #000 !important;
          }
        }
      `}</style>

      {/* A4 Preview area */}
      <div className="pt-20 pb-12 print:pt-0 print:pb-0">
        {pages.map((page, pageIdx) => (
          <div
            key={pageIdx}
            className="print-page mx-auto mb-8 grid grid-cols-2 grid-rows-2 gap-2 border border-gray-300 bg-white shadow-lg last:mb-0 print:mb-0 print:border-0 print:shadow-none print:p-[3mm] print:gap-[2mm]"
            style={{
              width: '210mm',
              minHeight: '297mm',
              height: '297mm',
              boxSizing: 'border-box',
              padding: '3mm',
            }}
          >
            {page.map((salary, idx) => (
              <div key={`${salary.id}-${idx}`} className="print-slip-cell flex min-h-0 flex-col">
                <SalarySlip salary={salary} />
              </div>
            ))}
            {page.length < 4 &&
              Array.from({ length: 4 - page.length }).map((_, idx) => (
                <div
                  key={`empty-${pageIdx}-${idx}`}
                  className="print-slip-cell min-h-0 rounded border border-dashed border-gray-200 print:border-0"
                  aria-hidden
                />
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default function PrintPage() {
  return (
    <div className="min-h-screen bg-gray-100 print:min-h-0 print:bg-white">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status" />
            <p className="mt-4 font-medium text-gray-500">Đang tải...</p>
          </div>
        </div>
      }>
        <PrintContent />
      </Suspense>
    </div>
  );
}
