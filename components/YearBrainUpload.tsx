"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/FrostButton';
import { ContentCard } from '@/components/ui/ContentCard';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

interface YearBrainUploadProps {
  onSuccess?: () => void;
}

export function YearBrainUpload({ onSuccess }: YearBrainUploadProps = {}) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    if (!supabase) {
      console.error('❌ Supabase client not initialized. Missing env vars.');
      setError('Systemfel: Supabase-konfiguration saknas. Kontakta support.');
      setUploading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Du måste vara inloggad för att ladda upp');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user.id);

    try {
      console.log('📤 Uploading file:', file.name, file.size, 'bytes');

      const res = await fetch('/api/yearbrain/sync', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', res.status);

      const data = await res.json();
      console.log('📦 Response data:', data);

      if (!res.ok) {
        const errorMsg = data.error || data.details || 'Upload failed';
        console.error('❌ Upload failed:', errorMsg);
        throw new Error(errorMsg);
      }

      if (data.success) {
        setSuccess(true);
        console.log('✅ YearBrain synced successfully:', data);

        // Call onSuccess callback if provided, otherwise reload
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            setSuccess(false);
          }, 1500);
        } else {
          setTimeout(() => window.location.reload(), 2000);
        }
      } else {
        const errorMsg = data.error || data.details || 'Upload failed';
        console.error('❌ Sync not successful:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: unknown) {
      console.error('❌ Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ContentCard title="YearBrain Sync" subtitle="Din 12-månaders plan">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".md,.txt"
            onChange={handleUpload}
            className="hidden"
            id="yearbrain-upload"
            disabled={uploading}
          />
          <label htmlFor="yearbrain-upload" className="cursor-pointer">
            <div className="mb-4">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-2">
              {uploading ? 'Parsar YearBrain...' : 'Ladda upp YearBrain.md'}
            </p>
            <p className="text-sm text-gray-500">
              AI extraherar automatiskt phases, modules, topics & projects
            </p>
          </label>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-green-800 font-medium">✅ YearBrain synkad!</p>
              <p className="text-sm text-green-700 mt-1">Laddar om sidan...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-800 font-medium">❌ {error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ContentCard>
  );
}

