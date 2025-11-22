import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frost Study OS 3.0",
  description: "Freeze the chaos. Manage with precision.",
};

import UserMenu from "@/components/UserMenu";
import { createClient } from "@/lib/supabase/server";

// ... (imports)

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-8">
              <Link className="flex items-center space-x-2" href="/">
                <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">F</span>
                </div>
                <span className="font-bold text-lg tracking-tight">Frost Study OS</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <Link className="transition-colors hover:text-primary text-foreground/80" href="/today">Today</Link>
                <Link className="transition-colors hover:text-primary text-foreground/80" href="/session">Session</Link>
                <Link className="transition-colors hover:text-primary text-foreground/80" href="/history">History</Link>
                <Link className="transition-colors hover:text-primary text-foreground/80" href="/coach">Coach</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <UserMenu user={user} />
            </div>
          </div>
        </header>
        <main className="flex-1 w-full max-w-screen-2xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
