import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolyPharm Review - 다제약물 검토",
  description: "다제약물 처방 검토 및 상담 시스템",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <header className="bg-white border-b border-gray-200 no-print">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-700">💊 PolyPharm Review</h1>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="hover:text-blue-600">새 검토</a>
              <a href="/archive" className="hover:text-blue-600">검토 기록</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
