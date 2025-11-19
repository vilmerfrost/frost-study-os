"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/FrostButton';
import { ContentCard } from '@/components/ui/ContentCard';

export function CalendarConnect({ isConnected }: { isConnected: boolean }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    window.location.href = '/api/auth/google';
  };

  if (isConnected) {
    return (
      <ContentCard title="Google Calendar" subtitle="Synkronisering aktiv">
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
              ✓
            </div>
            <div>
              <p className="font-medium text-gray-900">Kopplad till Google Calendar</p>
              <p className="text-sm text-gray-600">Dina sessioner synkas automatiskt</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Inställningar</Button>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard title="Google Calendar" subtitle="Synkronisera dina study sessions">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Varför koppla kalendern?</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Auto-skapar calendar blocks för varje session</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>AI anpassar planen efter dina möten</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Påminnelser 10min innan varje session</span>
            </li>
          </ul>
        </div>

        <Button
          variant="primary"
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? 'Kopplar...' : '🔗 Koppla Google Calendar'}
        </Button>
      </div>
    </ContentCard>
  );
}

