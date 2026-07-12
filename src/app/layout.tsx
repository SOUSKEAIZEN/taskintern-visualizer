// taskintern-visualizer/src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { logger } from "../../lib/logger";
import Sidebar from "../../components/workspace/Sidebar";

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
      <body className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
        
        {/* Top Navigation Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 font-bold shadow-sm z-30 shrink-0">
          <div className="flex items-center cursor-pointer">
            <Link href="/">
              <span className="text-indigo-600 mr-2 text-xl">Taskintern</span> 
              <span className="text-slate-700 text-lg">DSA Visualizer</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
               <span className="text-sm font-bold px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg cursor-pointer transition-colors border border-indigo-200 shadow-sm">
                 My Dashboard
               </span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content Canvas */}
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
        
      </body>
    </html>
  );
}