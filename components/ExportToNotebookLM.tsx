"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/FrostButton';
import { motion, AnimatePresence } from 'framer-motion';

export function ExportToNotebookLM({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false);
  const [exported, setExported] = useState(false);
  const [docUrl, setDocUrl] = useState('');

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notebooklm/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (data.success) {
        setDocUrl(data.notebooklmUrl);
        setExported(true);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="secondary" onClick={handleExport} disabled={loading || exported}>
        {loading && '⏳ Skapar dokument...'}
        {exported && '✅ Exporterad'}
        {!loading && !exported && '📝 Exportera till NotebookLM'}
      </Button>

      <AnimatePresence>
        {exported && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-sm text-green-800 mb-2">✅ Session exporterad!</p>
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Öppna i NotebookLM →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

