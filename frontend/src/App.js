import React, { useState, useEffect, useCallback } from 'react';
import { getExpenses, getCategories, createExpense } from './api';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import FilterBar from './components/FilterBar';
import Summary from './components/Summary';
import './App.css';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: 'all', sort: 'date_desc' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenses(filters);
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load expenses. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  const handleAddExpense = async (formData, idempotencyKey) => {
    const expense = await createExpense(formData, idempotencyKey);
    setSuccessMsg(`Expense "${expense.description}" added successfully!`);
    setTimeout(() => setSuccessMsg(null), 3000);
    await fetchExpenses();
    // Refresh categories in case a new one was added
    getCategories().then((d) => setCategories(d.categories)).catch(() => {});
    return expense;
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">₹</span>
            <div>
              <h1>ExpenseTracker</h1>
              <p className="tagline">Track every rupee, every day</p>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="layout">
          <aside className="sidebar">
            <ExpenseForm
              categories={categories}
              onSubmit={handleAddExpense}
            />
            <Summary expenses={expenses} total={total} />
          </aside>

          <section className="content">
            {successMsg && (
              <div className="toast toast--success">{successMsg}</div>
            )}
            <FilterBar
              categories={categories}
              filters={filters}
              onChange={setFilters}
            />
            {error && (
              <div className="alert alert--error">
                {error}
                <button onClick={fetchExpenses} className="btn-retry">Retry</button>
              </div>
            )}
            <ExpenseTable
              expenses={expenses}
              loading={loading}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
