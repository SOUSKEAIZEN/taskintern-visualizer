// taskintern-visualizer/src/app/layout.tsx

import type { Metadata } from "next";

import Link from "next/link";
import "./globals.css";
import { logger } from "../../lib/logger";
import ThemeToggle from "../../components/ThemeToggle";
export const metadata: Metadata = {
  title: "Taskintern DSA Visualizer",
  description: "Interactive Data Structures and Algorithms Visualizer Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  logger.info("RootLayout initialized: Mounting main application shell.");

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="font-sans h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="h-screen flex flex-col bg-bg-main text-text-body overflow-hidden">
        
        {/* Top Navigation Header - Premium Redesign */}
        <header className="sticky top-0 h-16 border-b border-border-default bg-bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8 font-bold z-50 shrink-0 shadow-sm transition-all">
          <div className="flex items-center cursor-pointer gap-2">
            <Link href="/portal" className="flex items-center gap-2 group">
              <span className="text-primary text-2xl group-hover:scale-110 transition-transform">⚡</span>
              <span className="text-primary mr-2 text-xl tracking-tight font-extrabold group-hover:text-primary-hover transition-colors">Taskintern</span> 
              <span className="text-text-heading text-lg font-bold tracking-tight">DSA Visualizer</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link href="/dashboard">
               <span className="text-sm font-bold px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-btn cursor-pointer transition-all shadow-sm flex items-center gap-2">
                 <span>📊</span> My Dashboard
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