// taskintern-visualizer/src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { logger } from "../../lib/logger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taskintern DSA Visualizer",
  description: "Interactive Data Structures and Algorithms Visualizer Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side log to track when the application shell successfully mounts
  logger.info("RootLayout initialized: Mounting main application shell.");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        
        {/* Top Navigation Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 font-bold shadow-sm z-10">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">Taskintern</span> 
            <span>DSA Visualizer</span>
          </div>
          <Link href="/dashboard">
             <span className="text-sm font-medium px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors text-slate-700">
               My Dashboard
             </span>
          </Link>
        </header>

        {/* Main Application Workspace */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Navigation */}
          <aside className="w-64 border-r bg-white p-4 hidden md:block shadow-inner z-0 flex-shrink-0">
            <nav className="space-y-2 text-sm font-medium">
              
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4 px-2">
                Learning Modules
              </div>
              
              <Link href="/">
                <div className="p-2 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md cursor-pointer transition-colors block">
                  Array Operations
                </div>
              </Link>
              
              <div className="p-2 hover:bg-slate-100 rounded-md cursor-pointer text-slate-500 transition-colors">
                Linked Lists (Locked)
              </div>
              
              <div className="p-2 hover:bg-slate-100 rounded-md cursor-pointer text-slate-500 transition-colors">
                Binary Trees (Locked)
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100">
                <Link href="/dashboard">
                  <div className="p-2 bg-indigo-50 text-indigo-700 rounded-md cursor-pointer font-bold hover:bg-indigo-100 transition-colors flex items-center justify-between">
                    <span>Analytics Dashboard</span>
                    <span>→</span>
                  </div>
                </Link>
              </div>

            </nav>
          </aside>

          {/* Dynamic Page Content Canvas */}
          <main className="flex-1 overflow-y-auto p-6 relative">
            {children}
          </main>
          
        </div>
      </body>
    </html>
  );
}