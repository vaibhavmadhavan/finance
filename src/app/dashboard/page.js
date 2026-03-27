'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const router = useRouter();

  // Auth + loading state
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  // Data state
  const [loadingData, setLoadingData] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalFixed, setTotalFixed] = useState(0);
  const [savingsTarget, setSavingsTarget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [view, setView] = useState('day');

  // 1) Protect route: redirect to /auth if not logged in
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

  // 2) Load current-month budget + expenses for this user
  useEffect(() => {
    if (!sessionUser) return;

    async function loadDashboardData() {
      setLoadingData(true);

      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Budgets: get this month for this user
      const { data: budgetRows, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', sessionUser.id)
        .gte('month', monthStart.toISOString())
        .lte('month', monthEnd.toISOString())
        .limit(1);

      if (budgetError) console.error(budgetError);

      const budget = budgetRows?.[0];

      setTotalIncome(budget?.total_income ?? 0);
      setTotalFixed(budget?.total_fixed_expenses ?? 0);
      setSavingsTarget(budget?.savings_target ?? 0);

      // Expenses: this month for this user
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', sessionUser.id)
        .gte('date', monthStart.toISOString())
        .lte('date', monthEnd.toISOString())
        .order('date', { ascending: false });

      if (expensesError) console.error(expensesError);

      const totalSpentCalc =
        expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) ?? 0;

      setTotalSpent(totalSpentCalc);
      setRecentExpenses((expenses || []).slice(0, 5));

      setLoadingData(false);
    }

    loadDashboardData();
  }, [sessionUser]);

  // Loading states
  if (checkingAuth) {
    return fullScreenMessage('Loading your dashboard…');
  }

  if (loadingData) {
    return fullScreenMessage('Calculating your numbers…');
  }

  // If no budget yet, send them to setup
  const hasBudget =
    totalIncome > 0 || totalFixed > 0 || savingsTarget > 0;

  if (!hasBudget) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#020617',
          color: '#e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <h2>Let’s set up your first budget</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          We need your income, fixed expenses, and savings goal to show
          spendable amounts.
        </p>
        <button
          onClick={() => router.push('/setup')}
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
          Start Setup
        </button>
      </div>
    );
  }

  // Derived values
  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const dayOfMonth = today.getDate();
  const daysRemaining = daysInMonth - dayOfMonth + 1;

  const spendable =
    totalIncome - totalFixed - savingsTarget - totalSpent;

  const spendablePerDay =
    daysRemaining > 0 ? Math.floor(spendable / daysRemaining) : 0;
  const spendablePerWeek = Math.floor(spendablePerDay * 7);

  const currentSpendable =
    view === 'day' ? spendablePerDay : spendablePerWeek;
  const viewLabel = view === 'day' ? 'today' : 'this week';

  const remainingBudget = spendable;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: '#e2e8f0',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Top bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 32px',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <h2
          style={{ margin: 0, color: '#38bdf8', fontWeight: 800 }}
        >
          FinanceUAE Dashboard
        </h2>
        <button
          style={{
            background: 'transparent',
            border: '1px solid #4b5563',
            color: '#e5e7eb',
            padding: '8px 16px',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/');
          }}
        >
          Log Out
        </button>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '24px 16px 40px',
        }}
      >
        {/* Spendable card */}
        <section
          style={{
            background:
              'radial-gradient(circle at top left, #0ea5e9, #020617)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            border: '1px solid #1f2937',
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#cbd5f5',
              fontSize: '0.9rem',
            }}
          >
            You can spend {viewLabel}
          </p>
          <h1
            style={{
              margin: '8px 0 16px',
              fontSize: '2.8rem',
              fontWeight: 800,
              color: '#f9fafb',
            }}
          >
            {Math.max(currentSpendable, 0)} AED
          </h1>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <button
              onClick={() => setView('day')}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                backgroundColor:
                  view === 'day' ? '#f9fafb' : 'transparent',
                color:
                  view === 'day' ? '#020617' : '#e5e7eb',
              }}
            >
              Per Day
            </button>
            <button
              onClick={() => setView('week')}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: '1px solid #64748b',
                cursor: 'pointer',
                fontSize: '0.9rem',
                backgroundColor:
                  view === 'week' ? '#0f172a' : 'transparent',
                color: '#e5e7eb',
              }}
            >
              Per Week
            </button>
          </div>

          <p
            style={{
              margin: 0,
              color: '#9ca3af',
              fontSize: '0.8rem',
            }}
          >
            Based on your income, fixed expenses, savings goal, and
            spending so far this month.
          </p>
        </section>

        {/* Summary cards */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <SummaryCard
            label="Total Spent"
            value={`${totalSpent} AED`}
          />
          <SummaryCard
            label="Remaining Budget"
            value={`${remainingBudget} AED`}
          />
          <SummaryCard
            label="Savings Target"
            value={`${savingsTarget} AED`}
          />
        </section>

        {/* Bottom row: recent expenses + CTA */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#020617',
              borderRadius: '16px',
              border: '1px solid #1f2937',
              padding: '16px 18px',
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '10px',
                fontSize: '1rem',
                color: '#e5e7eb',
              }}
            >
              Recent expenses
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {recentExpenses.length === 0 && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#9ca3af',
                  }}
                >
                  No expenses logged yet this month.
                </p>
              )}
              {recentExpenses.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #111827',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>
                      💸
                    </span>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          color: '#e5e7eb',
                        }}
                      >
                        {item.category}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          color: '#6b7280',
                        }}
                      >
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#f97373',
                      fontWeight: 600,
                    }}
                  >
                    -{item.amount} AED
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#020617',
              borderRadius: '16px',
              border: '1px solid #1f2937',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  marginBottom: '8px',
                  fontSize: '1rem',
                  color: '#e5e7eb',
                }}
              >
                Log a new expense
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#9ca3af',
                }}
              >
                Soon this will open a quick form with UAE student
                categories like shawarma, Metro, and remittances.
              </p>
            </div>
            <button
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '10px 0',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#38bdf8',
                color: '#020617',
                fontWeight: 700,
                cursor: 'pointer',
              }}
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

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        backgroundColor: '#020617',
        borderRadius: '16px',
        padding: '14px 16px',
        border: '1px solid #1f2937',
      }}
    >
      <p
        style={{
          margin: 0,
          marginBottom: '4px',
          fontSize: '0.8rem',
          color: '#9ca3af',
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#e5e7eb',
        }}
      >
        {value}
      </p>
    </div>
  );
}

function fullScreenMessage(text) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <p>{text}</p>
    </div>
  );
}
