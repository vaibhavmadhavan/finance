'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const CATEGORIES = [
  { emoji: '🍔', label: 'Food & Eating Out' },
  { emoji: '🌯', label: 'Shawarma & Fast Food' },
  { emoji: '☕', label: 'Coffee & Drinks' },
  { emoji: '🚇', label: 'Metro & Transport' },
  { emoji: '🚕', label: 'Uber / Careem' },
  { emoji: '🛒', label: 'Groceries' },
  { emoji: '💸', label: 'Remittances' },
  { emoji: '📱', label: 'Phone & Internet' },
  { emoji: '🎮', label: 'Entertainment' },
  { emoji: '👕', label: 'Shopping & Clothes' },
  { emoji: '📚', label: 'Education & Books' },
  { emoji: '🏠', label: 'Rent & Housing' },
  { emoji: '💊', label: 'Health & Medicine' },
  { emoji: '🧴', label: 'Personal Care' },
  { emoji: '📦', label: 'Other' },
];

export default function LogExpensePage() {
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Protect route
  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/auth?mode=login');
      } else {
        setSessionUser(data.user);
        setCheckingAuth(false);
      }
    }
    checkSession();
  }, [router]);

  if (checkingAuth) return fullScreenMessage('Loading…');

  async function handleSubmit() {
    setError(null);

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase.from('expenses').insert({
      user_id: sessionUser.id,
      amount: parseFloat(amount),
      category,
      note: note.trim() || null,
      date: new Date(date).toISOString(),
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      // Reset form
      setAmount('');
      setCategory('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      // Auto-dismiss success after 2s
      setTimeout(() => setSuccess(false), 2000);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #1f2937',
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 0',
          }}
        >
          ← Dashboard
        </button>
        <h2 style={{ margin: 0, color: '#38bdf8', fontWeight: 800, fontSize: '1rem' }}>
          💰 FinanceUAE
        </h2>
      </header>

      {/* Main */}
      <main style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '28px 16px 60px',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px', color: '#f9fafb' }}>
          Log an expense
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '28px' }}>
          What did you spend today?
        </p>

        {/* Amount */}
        <label style={labelStyle}>Amount (AED)</label>
        <div style={inputWrapperStyle}>
          <span style={prefixStyle}>AED</span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ ...inputStyle, fontSize: '1.4rem', fontWeight: 700 }}
            autoFocus
          />
        </div>

        {/* Date */}
        <label style={{ ...labelStyle, marginTop: '20px' }}>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            ...inputStyle,
            width: '100%',
            padding: '11px 14px',
            border: '1px solid #1f2937',
            borderRadius: '10px',
            backgroundColor: '#020617',
            colorScheme: 'dark',
          }}
        />

        {/* Category */}
        <label style={{ ...labelStyle, marginTop: '20px' }}>Category</label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '8px',
          marginTop: '2px',
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setCategory(cat.label)}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                border: category === cat.label
                  ? '2px solid #38bdf8'
                  : '1px solid #1f2937',
                backgroundColor: category === cat.label ? '#0c2233' : '#0a0f1e',
                color: category === cat.label ? '#38bdf8' : '#9ca3af',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: category === cat.label ? 600 : 400,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Note (optional) */}
        <label style={{ ...labelStyle, marginTop: '20px' }}>Note <span style={{ color: '#4b5563', fontWeight: 400 }}>(optional)</span></label>
        <input
          type="text"
          placeholder="e.g. Lunch with friends at Al Baik"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            ...inputStyle,
            width: '100%',
            padding: '11px 14px',
            border: '1px solid #1f2937',
            borderRadius: '10px',
            backgroundColor: '#020617',
          }}
        />

        {/* Error */}
        {error && (
          <p style={{
            color: '#f87171',
            fontSize: '0.85rem',
            marginTop: '14px',
            padding: '10px 14px',
            backgroundColor: '#1a0a0a',
            borderRadius: '8px',
            border: '1px solid #3b1a1a',
          }}>
            ⚠️ {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <p style={{
            color: '#34d399',
            fontSize: '0.85rem',
            marginTop: '14px',
            padding: '10px 14px',
            backgroundColor: '#021a10',
            borderRadius: '8px',
            border: '1px solid #065535',
          }}>
            ✅ Expense logged successfully!
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: '100%',
            marginTop: '24px',
            padding: '14px 0',
            borderRadius: '999px',
            border: 'none',
            backgroundColor: saving ? '#0ea5e9' : '#38bdf8',
            color: '#020617',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : '+ Log Expense'}
        </button>

        {/* Log another / back */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '12px 0',
            borderRadius: '999px',
            border: '1px solid #1f2937',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </main>
    </div>
  );
}

// Styles
const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: '#9ca3af',
  marginBottom: '8px',
  fontWeight: 600,
};
const inputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#020617',
  border: '1px solid #1f2937',
  borderRadius: '10px',
  overflow: 'hidden',
};
const prefixStyle = {
  padding: '11px 14px',
  color: '#4b5563',
  fontSize: '0.85rem',
  borderRight: '1px solid #1f2937',
  backgroundColor: '#0a0f1e',
  whiteSpace: 'nowrap',
};
const inputStyle = {
  flex: 1,
  padding: '11px 14px',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#f9fafb',
  fontSize: '0.95rem',
  outline: 'none',
  width: '100%',
};

function fullScreenMessage(text) {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#020617', color: '#e5e7eb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <p>{text}</p>
    </div>
  );
}