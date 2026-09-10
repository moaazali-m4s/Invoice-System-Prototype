import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'XYZ Studio — Invoice & Document System',
  description: 'Enterprise Invoicing, Document Generation, and PDF Utility Suite for XYZ Company LLC.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col font-sans">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">XYZ Company LLC</span>
              <span>•</span>
              <span>Invoice & Document Studio</span>
            </div>
            <div className="text-slate-400">
              &copy; {new Date().getFullYear()} XYZ Company LLC. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
