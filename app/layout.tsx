import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'antd/dist/reset.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Реестр информационных систем',
  description: 'Приложение для управления информационными системами',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  );
}