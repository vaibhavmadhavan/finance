'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Budget
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalFixed, setTotalFixed] = useState(0);
  const [savingsTarget, setSavingsTarget] = useState(0);
  const [savingsSlider, setSavingsSlider] = useState(0);
  const [savingSlider, setSavingSlider] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);

  // Expenses
  const [totalSpentMonth, setTotalSpentMonth] = useState(0);
  const [spentToday, setSpentToday] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // Auth check
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

  // Load data
  const loadData = useCallback(async () => {
    if (!sessionUser) return;
    setLoadingData(true);

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Today boundaries
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Budget
    const { data: budgetRows } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', sessionUser.id)
      .gte('month', monthStart.toISOString())
      .lte('month', monthEnd.toISOString())
      .limit(1);

    const budget = budgetRows?.[0];
    const inc = budget?.total_income ?? 0;
    const fixed = budget?.total_fixed_expenses ?? 0;
    const savings = budget?.savings_target ?? 0;

    setTotalIncome(inc);
    setTotalFixed(fixed);
    setSavingsTarget(savings);
    setSavingsSlider(savings);

    // All expenses this month
    const { data: monthExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', sessionUser.id)
      .gte('date', monthStart.toISOString())
      .lte('date', monthEnd.toISOString())
      .order('date', { ascending: false });

    const monthTotal = monthExpenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) ?? 0;
    setTotalSpentMonth(monthTotal);
    setRecentExpenses((monthExpenses || []).slice(0, 5));

    // Today's expenses only
    const { data: todayExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', sessionUser.id)
      .gte('date', todayStart.toISOString())
      .lt('date', todayEnd.toISOString());

    const todayTotal = todayExpenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) ?? 0;
    setSpentToday(todayTotal);

    setLoadingData(false);
  }, [sessionUser]);

  useEffect(() => { loadData(); }, [loadData]);

  // Delete expense
  async function handleDelete(id) {
    setDeletingId(id);
    await supabase.from('expenses').delete().eq('id', id);
    await loadData();
    setDeletingId(null);
  }

  // Save savings slider
  async function handleSaveSlider() {
    setSavingSlider(true);
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    await supabase.from('budgets').upsert(
      {
        user_id: sessionUser.id,
        month: monthStart,
        total_income: totalIncome,
        total_fixed_expenses: totalFixed,
        savings_target: savingsSlider,
      },
      { onConflict: 'user_id,month' }
    );

    setSavingsTarget(savingsSlider);
    setSavingSlider(false);
  }

  if (checkingAuth) return fullScreenMessage('Loading your dashboard…');
  if (loadingData) return fullScreenMessage('Calculating your numbers…');

  const hasBudget = totalIncome > 0 || totalFixed > 0 || savingsTarget > 0;
  if (!hasBudget) {
    return (
      <div style={centeredPage}>
        <h2>Let's set up your first budget</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          We need your income, fixed expenses, and savings goal.
        </p>
        <button onClick={() => router.push('/setup')} style={primaryBtn}>
          Start Setup
        </button>
      </div>
    );
  }

  // Derived values
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthlySpendable = totalIncome - totalFixed - savingsTarget;
  const dailyAllowance = Math.floor(monthlySpendable / daysInMonth);
  const leftToday = Math.max(dailyAllowance - spentToday, 0);
  const remainingMonth = monthlySpendable - totalSpentMonth;

  // Slider max = income - fixed (can't save more than you have after fixed)
  const sliderMax = Math.max(totalIncome - totalFixed, 0);
  const sliderChanged = savingsSlider !== savingsTarget;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #1f2937' }}>
        <h2 style={{ margin: 0, color: '#38bdf8', fontWeight: 800 }}>💰 FinanceUAE</h2>
        <button style={{ background: 'transparent', border: '1px solid #4b5563', color: '#e5e7eb', padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '0.9rem' }}
          onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}>
          Log Out
        </button>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Hero: Per Day + Left Today */}
        <section style={{
          background: 'radial-gradient(circle at top left, #0ea5e9, #020617)',
          borderRadius: '20px', padding: '28px', marginBottom: '16px',
          border: '1px solid #1f2937',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Per Day */}
            <div>
              <p style={{ margin: '0 0 6px', color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Daily Allowance
              </p>
              <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 800, color: '#f9fafb' }}>
                {dailyAllowance} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#94a3b8' }}>AED</span>
              </h1>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.78rem' }}>
                Same every day this month
              </p>
            </div>

            {/* Left Today */}
            <div style={{
              backgroundColor: 'rgba(2,6,23,0.5)',
              borderRadius: '14px',
              padding: '16px 20px',
              border: '1px solid #1e3a5f',
            }}>
              <p style={{ margin: '0 0 6px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Left Today
              </p>
              <h2 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 800, color: leftToday < dailyAllowance * 0.25 ? '#f87171' : '#34d399' }}>
                {leftToday} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#94a3b8' }}>AED</span>
              </h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.78rem' }}>
                Resets at midnight · spent {spentToday} AED today
              </p>
            </div>

          </div>
        </section>

        {/* Summary cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <SummaryCard label="Spent This Month" value={`${totalSpentMonth} AED`} />
          <SummaryCard label="Remaining (Month)" value={`${remainingMonth} AED`} color={remainingMonth < 0 ? '#f87171' : undefined} />
          <SummaryCard label="Savings Target" value={`${savingsTarget} AED`} />
        </section>

        {/* Budget breakdown (collapsible) */}
        <section style={{ backgroundColor: '#0a0f1e', borderRadius: '16px', border: '1px solid #1f2937', marginBottom: '16px', overflow: 'hidden' }}>
          <button
            onClick={() => setBudgetOpen(!budgetOpen)}
            style={{ width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#e5e7eb' }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>📊 Budget Breakdown</span>
            <span style={{ color: '#4b5563', fontSize: '0.85rem' }}>{budgetOpen ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {budgetOpen && (
            <div style={{ padding: '0 18px 20px', borderTop: '1px solid #1f2937' }}>

              {/* Breakdown rows */}
              {[
                { label: 'Monthly Income', value: totalIncome, color: '#34d399' },
                { label: 'Fixed Expenses', value: totalFixed, color: '#f87171' },
                { label: 'Savings Target', value: savingsTarget, color: '#fbbf24' },
                { label: 'Monthly Spendable', value: monthlySpendable, color: '#38bdf8' },
                { label: 'Daily Allowance', value: dailyAllowance, color: '#a78bfa' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #111827' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>{row.label}</span>
                  <span style={{ color: row.color, fontWeight: 700, fontSize: '0.95rem' }}>{row.value} AED</span>
                </div>
              ))}

              {/* Savings slider */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>
                    Adjust Savings Target
                  </label>
                  <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.95rem' }}>
                    {savingsSlider} AED
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={sliderMax}
                  step={50}
                  value={savingsSlider}
                  onChange={(e) => setSavingsSlider(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#4b5563', marginTop: '4px' }}>
                  <span>0</span>
                  <span>{sliderMax} AED</span>
                </div>

                {sliderChanged && (
                  <button
                    onClick={handleSaveSlider}
                    disabled={savingSlider}
                    style={{ ...primaryBtn, marginTop: '12px', width: '100%', opacity: savingSlider ? 0.6 : 1 }}
                  >
                    {savingSlider ? 'Saving…' : `Save — ${savingsSlider} AED savings`}
                  </button>
                )}
              </div>

              {/* Edit full budget */}
              <button
                onClick={() => router.push('/setup')}
                style={{ marginTop: '14px', width: '100%', padding: '10px 0', borderRadius: '999px', border: '1px solid #1f2937', background: 'transparent', color: '#9ca3af', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 600 }}
              >
                ✏️ Edit Full Budget
              </button>
            </div>
          )}
        </section>

        {/* Bottom row */}
        <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

          {/* Recent expenses */}
          <div style={{ backgroundColor: '#020617', borderRadius: '16px', border: '1px solid #1f2937', padding: '16px 18px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#e5e7eb' }}>Recent Expenses</h3>

            {recentExpenses.length === 0 && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>No expenses logged yet this month.</p>
            )}

            {recentExpenses.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #111827' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>💸</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#e5e7eb' }}>{item.category}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280' }}>
                      {new Date(item.date).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })}
                      {item.note ? ` · ${item.note}` : ''}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#f97373', fontWeight: 600, fontSize: '0.9rem' }}>-{item.amount} AED</span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: deletingId === item.id ? '#4b5563' : '#6b7280',
                      fontSize: '1rem', lineHeight: 1, padding: '2px 4px',
                      transition: 'color 0.15s',
                    }}
                    title="Delete expense"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Log expense CTA */}
          <div style={{ backgroundColor: '#020617', borderRadius: '16px', border: '1px solid #1f2937', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#e5e7eb' }}>Log an expense</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#9ca3af' }}>
                Add what you spent and watch your Left Today update instantly.
              </p>
            </div>
            <button
              style={{ ...primaryBtn, marginTop: '16px', width: '100%' }}
              onClick={() => router.push('/log')}
            >
              + Log Expense
            </button>
          </div>

        </section>
      </main>
    </div>
  );
}

// Reusable components
function SummaryCard({ label, value, color }) {
  return (
    <div style={{ backgroundColor: '#020617', borderRadius: '16px', padding: '14px 16px', border: '1px solid #1f2937' }}>
      <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#9ca3af' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: color || '#e5e7eb' }}>{value}</p>
    </div>
  );
}

function fullScreenMessage(text) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <p>{text}</p>
    </div>
  );
}

// Shared styles
const primaryBtn = {
  padding: '10px 24px', borderRadius: '999px', border: 'none',
  backgroundColor: '#38bdf8', color: '#020617', fontWeight: 700,
  cursor: 'pointer', fontSize: '0.95rem',
};

const centeredPage = {
  minHeight: '100vh', backgroundColor: '#020617', color: '#e5e7eb',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: '12px',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
};