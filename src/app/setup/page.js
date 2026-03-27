'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SetupPage() {
  const router = useRouter();

  // temporary simple page – we'll build the real wizard later
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: '#e5e7eb',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      <h1>Budget setup coming soon</h1>
      <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
        This page will collect your income, fixed expenses, and savings goal.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        style={{
          padding: '10px 24px',
          borderRadius: '999px',
          border: 'none',
          backgroundColor: '#38bdf8',
          color: '#020617',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Back to dashboard
      </button>
    </div>
  );
}
