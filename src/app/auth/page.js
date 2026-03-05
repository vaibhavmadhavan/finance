'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // ← add useSearchParams here
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
    const router = useRouter();

    // ← ADD THESE 3 LINES
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const [isLogin, setIsLogin] = useState(mode !== 'signup');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    async function handleSignUp() {
        setError(null);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            setError(error.message);
        } else {
            alert('Check email to verify account');
        }
    }

    async function handleLogin() {
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError(error.message);
        } else {
            router.push('/dashboard');
        }
    }

    return (
        <div>
            <h1>{isLogin ? 'Log In' : 'Sign Up'}</h1> {/* ← dynamic title */}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {/* ← REPLACE your two buttons with this */}
            {isLogin ? (
                <button onClick={handleLogin}>Log In</button>
            ) : (
                <button onClick={handleSignUp}>Sign Up</button>
            )}

            {/* ← Toggle link */}
            <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ color: 'blue', cursor: 'pointer' }}
                >
                    {isLogin ? 'Sign Up' : 'Log In'}
                </span>
            </p>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
