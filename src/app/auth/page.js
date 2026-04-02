// src/app/auth/page.js
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else alert('Check your email to verify your account!');
  }

  async function handleLogin() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push('/dashboard');
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1f2937',
        borderRadius: '20px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Logo */}
        <h2 style={{ margin: '0 0 4px', color: '#38bdf8', fontWeight: 800, fontSize: '1.3rem' }}>
          💰 FinanceUAE
        </h2>

        {/* Title */}
        <h1 style={{ margin: '0 0 28px', color: '#f9fafb', fontSize: '1.6rem', fontWeight: 700 }}>
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>

        {/* Email */}
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          placeholder=""
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        {/* Password */}
        <label style={labelStyle}>Password</label>
        <input
          type="password"
          placeholder=""
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          onKeyDown={(e) => e.key === 'Enter' && (isLogin ? handleLogin() : handleSignUp())}
        />

        {/* Submit button */}
        <button
          onClick={isLogin ? handleLogin : handleSignUp}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: '999px',
            border: 'none',
            backgroundColor: loading ? '#0ea5e9' : '#38bdf8',
            color: '#020617',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '8px',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Please wait…' : isLogin ? 'Log In' : 'Sign Up'}
        </button>

        {/* Error */}
        {error && (
          <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '12px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Toggle */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#9ca3af' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: '#9ca3af',
  marginBottom: '6px',
  marginTop: '16px',
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid #1f2937',
  backgroundColor: '#020617',
  color: '#f9fafb',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
};

// ⚠️ useSearchParams must be wrapped in Suspense for Next.js App Router
export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}