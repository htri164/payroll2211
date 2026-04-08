'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SalaryRecord, getSalaryRecordsByMonth } from '@/lib/firebase/salaries';
import SalarySlip from '@/components/SalarySlip';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

function PrintContent() {
  const searchParams = useSearchParams();
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

  if (loading) {
    return <div className="py-8 text-center">Đang tải...</div>;
  }

  if (salaries.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Không có bảng lương nào để in cho tháng {month}
      </div>
    );
  }

  return (
    <div className="space-y-0 p-0">
      <style>{`
        @media print {
          /* Một trang = đúng A4, lưới 2×2 chia đều (4 phiếu / trang) */
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

      {pages.map((page, pageIdx) => (
        <div
          key={pageIdx}
          className="print-page mx-auto mb-8 grid grid-cols-2 grid-rows-2 gap-2 border border-dashed border-gray-300 bg-white p-2 last:mb-0 print:mb-0 print:border-0 print:p-[3mm] print:gap-[2mm]"
          style={{
            width: '210mm',
            minHeight: '297mm',
            height: '297mm',
            boxSizing: 'border-box',
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
                className="print-slip-cell min-h-0 rounded border border-dashed border-gray-100 print:border-0"
                aria-hidden
              />
            ))}
        </div>
      ))}

      <div className="no-print mt-8 text-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="mr-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          In phiếu lương
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white hover:bg-gray-700"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 print:min-h-0 print:bg-white print:p-0">
      <div className="mx-auto w-full max-w-[220mm] print:max-w-none">
        <h1 className="no-print mb-2 text-4xl font-bold text-gray-900">In phiếu lương</h1>
        <p className="no-print mb-8 max-w-xl text-sm text-gray-600">
          Khi in (Chrome): mở <strong className="font-semibold">More settings</strong> → bỏ chọn{' '}
          <strong className="font-semibold">Headers and footers</strong> để ẩn ngày, tiêu đề tab, URL và
          số trang.
        </p>

        <Suspense fallback={<div className="py-8 text-center">Đang tải...</div>}>
          <PrintContent />
        </Suspense>
      </div>
    </div>
  );
}
