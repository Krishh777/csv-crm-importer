'use client';

import type { Metadata } from 'next';
import { ReactNode, useState, useEffect } from 'react';
import '../styles/globals.css';
import { Moon, Sun } from 'lucide-react';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <head>
        <title>CSV CRM Importer</title>
        <meta name="description" content="AI-powered CSV CRM importer" />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <div className="flex flex-col min-h-screen">
          <header className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 text-white p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">🚀 CSV CRM Importer</h1>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>
          <main className="flex-1 max-w-7xl mx-auto w-full p-4">
            {children}
          </main>
          <footer className="bg-gray-100 dark:bg-gray-800 text-center p-4 mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2026 CSV CRM Importer. All rights reserved.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
