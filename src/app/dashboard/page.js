'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
      } else {
        setUser(session.user);
      }
    }
    getSession();
  }, []);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome!</h1>
      <p>{user.email}</p>
      <button onClick={async () => {
        await supabase.auth.signOut();
        router.push('/auth');
      }}>Log Out</button>
    </div>
  );
}
