// taskintern-visualizer/src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  // Step 1: Server-side log to track when the application shell successfully mounts
  logger.info("RootLayout initialized: Mounting main application shell.");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        
        {/* Top Navigation Header */}
        <header className="h-16 border-b bg-white flex items-center px-6 font-bold shadow-sm z-10">
          <span className="text-blue-600 mr-2">Taskintern</span> 
          <span>DSA Visualizer</span>
        </header>

        {/* Main Application Workspace */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Navigation */}
          <aside className="w-64 border-r bg-white p-4 hidden md:block shadow-inner z-0">
            <nav className="space-y-2 text-sm font-medium">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-md cursor-pointer">
                Array Operations
              </div>
              <div className="p-2 hover:bg-slate-100 rounded-md cursor-pointer text-slate-600 transition-colors">
                Linked Lists
              </div>
              <div className="p-2 hover:bg-slate-100 rounded-md cursor-pointer text-slate-600 transition-colors">
                Binary Trees
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