import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrainView - 電車混雑率ビジュアライザー",
  description: "電車の車両ごとの混雑率をリアルタイムで確認できるアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-900 text-white min-h-screen">
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🚇</span>
              <span className="font-bold text-lg">TrainView</span>
            </a>
            <span className="text-gray-500 text-sm ml-auto">電車混雑率ビジュアライザー</span>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
