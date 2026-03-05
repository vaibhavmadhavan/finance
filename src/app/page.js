'use client'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
      
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid #1e293b'
      }}>
        <h2 style={{ margin: 0, color: '#ffffff' }}>💰 FinanceUAE</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/auth?mode=login">
            <button style={outlineBtn}>Log In</button>
          </Link>
          <Link href="/auth?mode=signup">
            <button style={solidBtn}>Sign Up</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 20px 40px' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px' }}>
          Know exactly how much<br />you can spend today
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '500px', margin: '0 auto 32px' }}>
          Built for UAE university students. Track expenses, set savings goals,
          and get AI-powered tips tailored to Dubai life.
        </p>
        <Link href="/auth?mode=signup">
          <button style={{ ...solidBtn, fontSize: '1rem', padding: '14px 32px' }}>
            Get Started — It's Free
          </button>
        </Link>
      </section>

      {/* Fake Dashboard Preview */}
      <section style={{ maxWidth: '480px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Spendable Card */}
        <div style={card}>
          <p style={{ color: '#94a3b8', marginBottom: '8px' }}>You can spend today</p>
          <h1 style={{ fontSize: '3rem', color: '#38bdf8', margin: '0 0 16px' }}>126 AED</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={activeToggle}>Per Day</button>
            <button style={inactiveToggle}>Per Week</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px' }}>
          <div style={smallCard}>
            <p style={smallLabel}>Total Spent</p>
            <p style={smallValue}>1,240 AED</p>
          </div>
          <div style={smallCard}>
            <p style={smallLabel}>Remaining</p>
            <p style={smallValue}>880 AED</p>
          </div>
          <div style={smallCard}>
            <p style={smallLabel}>Savings</p>
            <p style={smallValue}>500 / 800</p>
          </div>
        </div>

        {/* Recent Expenses */}
        <div style={{ ...card, marginTop: '16px' }}>
          <p style={{ color: '#94a3b8', marginBottom: '12px', fontSize: '0.9rem' }}>Recent Expenses</p>
          {[
            { icon: '🍔', label: 'Food & Eating Out', amount: '-32 AED' },
            { icon: '🚇', label: 'Transport', amount: '-8 AED' },
            { icon: '☕', label: 'Coffee', amount: '-18 AED' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid #1e293b' : 'none' }}>
              <span>{item.icon} {item.label}</span>
              <span style={{ color: '#f87171' }}>{item.amount}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '12px' }}>
          ↑ Preview only — sign up to see your real data
        </p>
      </section>

    </div>
  )
}

// Styles
const solidBtn = {
  backgroundColor: '#38bdf8', color: '#0f172a', border: 'none',
  padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700
}
const outlineBtn = {
  backgroundColor: 'transparent', color: '#38bdf8',
  border: '1px solid #38bdf8', padding: '10px 20px',
  borderRadius: '8px', cursor: 'pointer', fontWeight: 700
}
const card = {
  backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px'
}
const smallCard = {
  backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px', textAlign: 'center'
}
const smallLabel = { color: '#94a3b8', fontSize: '0.75rem', margin: '0 0 4px' }
const smallValue = { color: '#f8fafc', fontWeight: 700, margin: 0 }
const activeToggle = {
  backgroundColor: '#38bdf8', color: '#0f172a', border: 'none',
  padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
}
const inactiveToggle = {
  backgroundColor: 'transparent', color: '#94a3b8',
  border: '1px solid #334155', padding: '6px 16px',
  borderRadius: '6px', cursor: 'pointer'
}

