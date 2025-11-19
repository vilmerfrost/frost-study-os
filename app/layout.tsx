// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { StudySidebar } from "@/components/StudySidebar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="bg-[#FAFBFC] text-[#1A1D29]">
        <div className="flex min-h-screen">
          {/* Sidebar - Fixed left */}
          <aside className="w-64 fixed h-screen z-10">
            <StudySidebar />
          </aside>
          
          {/* Main Content - Offset by sidebar */}
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
