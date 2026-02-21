'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Page() {
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBudgets() {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .limit(5);

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        setBudgets(data);
      }
    }

    loadBudgets();
  }, []);

  return (
    <div>
      <h1>Student Budget App</h1>
      {error && <p>Error: {error}</p>}
      <pre>{JSON.stringify(budgets, null, 2)}</pre>
    </div>
  );
}
