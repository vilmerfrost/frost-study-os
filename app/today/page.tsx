import React from 'react';
import { redirect } from 'next/navigation';
import { DashboardOrchestrator } from '@/components/dashboard/DashboardOrchestrator';
import { getMorningBrief } from '@/app/actions/morning-brief';
import { createClient } from '@/lib/supabase/server';

export default async function TodayPage() {
  // 1. Get User
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Get Morning Brief (Bibliotekarien)
  const morningBrief = await getMorningBrief(user.id);

  return (
    <main className="min-h-screen bg-[#020617] text-white pb-20">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-8">
        <DashboardOrchestrator userId={user.id} morningBrief={morningBrief} />
      </div>
    </main>
  );
}
