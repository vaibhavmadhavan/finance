// src/app/setup/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SetupPage() {
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [income, setIncome] = useState('');
  const [fixedExpenses, setFixedExpenses] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

  if (checkingAuth) {
    return fullScreenMessage('Loading…');
  }

  // Derived preview values
  const inc = parseFloat(income) || 0;
  const fixed = parseFloat(fixedExpenses) || 0;
  const savings = parseFloat(savingsTarget) || 0;
  const spendable = inc - fixed - savings;
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - today.getDate() + 1;
  const perDay = daysRemaining > 0 ? Math.floor(spendable / daysRemaining) : 0;

  async function handleSave() {
    setError(null);

    if (!sessionUser?.id) {
    setError('Session not found. Please log in again.');
    router.push('/auth?mode=login');
    return;
    }

    if (!income || !fixedExpenses || !savingsTarget) {
      setError('Please fill in all three fields.');
      return;
    }
    if (spendable < 0) {
      setError('Your fixed expenses + savings exceed your income. Please adjust.');
      return;
    }

    setSaving(true);

    // Store month as first day of current month (ISO string)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const { error: upsertError } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: sessionUser.id,
          month: monthStart,
          total_income: parseFloat(income),
          total_fixed_expenses: parseFloat(fixedExpenses),
          savings_target: parseFloat(savingsTarget),
        },
        { onConflict: 'user_id,month' }   // update if same user+month exists
      );

    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#0f172a',
        border: '1px solid #1f2937',
        borderRadius: '20px',
        padding: '36px 32px',
      }}>

        {/* Header */}
        <h2 style={{ margin: '0 0 4px', color: '#38bdf8', fontWeight: 800, fontSize: '1.2rem' }}>
          💰 FinanceUAE
        </h2>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>
          Set up your budget
        </h1>
        <p style={{ margin: '0 0 28px', color: '#9ca3af', fontSize: '0.88rem' }}>
          Takes 30 seconds. You can update this any time.
        </p>

        {/* Income */}
        <label style={labelStyle}>Monthly Income (AED)</label>
        <div style={inputWrapperStyle}>
          <span style={prefixStyle}>AED</span>
          <input
            type="number"
            placeholder="e.g. 4000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            style={inputStyle}
          />
        </div>
        <p style={hintStyle}>Your salary, allowance, or any monthly money coming in.</p>

        {/* Fixed Expenses */}
        <label style={labelStyle}>Fixed Monthly Expenses (AED)</label>
        <div style={inputWrapperStyle}>
          <span style={prefixStyle}>AED</span>
          <input
            type="number"
            placeholder="e.g. 1500"
            value={fixedExpenses}
            onChange={(e) => setFixedExpenses(e.target.value)}
            style={inputStyle}
          />
        </div>
        <p style={hintStyle}>Rent, phone bill, subscriptions — things you pay every month regardless.</p>

        {/* Savings Target */}
        <label style={labelStyle}>Monthly Savings Target (AED)</label>
        <div style={inputWrapperStyle}>
          <span style={prefixStyle}>AED</span>
          <input
            type="number"
            placeholder="e.g. 500"
            value={savingsTarget}
            onChange={(e) => setSavingsTarget(e.target.value)}
            style={inputStyle}
          />
        </div>
        <p style={hintStyle}>How much you want to save this month before spending on anything else.</p>

        {/* Live Preview */}
        {inc > 0 && (
          <div style={{
            backgroundColor: '#020617',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '14px 16px',
            marginTop: '20px',
            marginBottom: '4px',
          }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Preview
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Monthly spendable</span>
              <span style={{ color: spendable >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                {spendable.toFixed(0)} AED
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Per day (rest of month)</span>
              <span style={{ color: perDay >= 0 ? '#38bdf8' : '#f87171', fontWeight: 700 }}>
                {perDay} AED
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '12px', marginBottom: 0 }}>
            ⚠️ {error}
          </p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '13px 0',
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
          {saving ? 'Saving…' : 'Save & Go to Dashboard →'}
        </button>

        {/* Back link */}
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#4b5563' }}>
          <span
            onClick={() => router.push('/dashboard')}
            style={{ cursor: 'pointer', color: '#6b7280' }}
          >
            ← Back to dashboard
          </span>
        </p>
      </div>
    </div>
  );
}

// Styles
const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: '#9ca3af',
  marginBottom: '6px',
  marginTop: '18px',
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
  padding: '11px 12px',
  color: '#4b5563',
  fontSize: '0.85rem',
  borderRight: '1px solid #1f2937',
  backgroundColor: '#0a0f1e',
};
const inputStyle = {
  flex: 1,
  padding: '11px 14px',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#f9fafb',
  fontSize: '0.95rem',
  outline: 'none',
};
const hintStyle = {
  margin: '5px 0 0',
  fontSize: '0.78rem',
  color: '#4b5563',
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