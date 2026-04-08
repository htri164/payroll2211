import type { Metadata } from 'next';

/** Giảm chữ trong header/footer mặc định của Chrome khi in (vẫn nên tắt "Headers and footers"). */
export const metadata: Metadata = {
  title: 'Phiếu lương',
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return children;
}
