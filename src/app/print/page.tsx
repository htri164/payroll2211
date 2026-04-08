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

  // Create pages with 4 slips per page
  const pages: SalaryRecord[][] = [];
  for (let i = 0; i < salaries.length; i += 4) {
    pages.push(salaries.slice(i, i + 4));
  }

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (salaries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có bảng lương nào để in cho tháng {month}
      </div>
    );
  }

  return (
    <div className="space-y-0 p-0">
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print-page {
            page-break-after: always;
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
          }
          .print-page:last-child {
            page-break-after: avoid;
          }
        }
      `}</style>

      {pages.map((page, pageIdx) => (
        <div
          key={pageIdx}
          className="print-page"
          style={{
            width: '210mm',
            height: '297mm',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            padding: '5mm',
          }}
        >
          {page.map((salary, idx) => (
            <SalarySlip key={`${salary.id}-${idx}`} salary={salary} />
          ))}
          {/* Add empty slips if less than 4 on this page */}
          {page.length < 4 &&
            Array.from({ length: 4 - page.length }).map((_, idx) => (
              <div key={`empty-${idx}`} style={{ height: '3.8in' }}></div>
            ))}
        </div>
      ))}

      <div className="mt-8 text-center no-print">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 mr-4"
        >
          In phiếu lương
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 no-print">In Phiếu Lương</h1>

        <Suspense fallback={<div className="text-center py-8">Đang tải...</div>}>
          <PrintContent />
        </Suspense>
      </div>
    </main>
  );
}
