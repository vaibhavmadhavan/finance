'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    async function handleSignUp(){
        setError(null); 
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            setError(error.message);
        } else {
            alert('Check email to verify account');
        }
    }

    async function handleLogin(){
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
            <h1>Student Budget App</h1>

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

        <button onClick={handleSignUp}>Sign Up</button>
        <button onClick={handleLogin}>Log In</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
    )

}