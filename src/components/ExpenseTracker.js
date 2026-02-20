import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

const ExpenseTracker = () => {
  const [expense, setExpense] = useState({ title: '', amount: '' });
  const [list, setList] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "expenses_records"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setList(snap.docs.map(doc => doc.data()));
    });
    return unsub;
  }, []);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!expense.title || !expense.amount) return;
    await addDoc(collection(db, "expenses_records"), {
      ...expense,
      timestamp: new Date(),
      dateString: new Date().toLocaleDateString()
    });
    setExpense({ title: '', amount: '' });
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ color: '#f59e0b' }}>💸 Expense Tracker</h2>
      <form onSubmit={addExpense} style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <input style={inputStyle} placeholder="Expense Title" value={expense.title} onChange={e => setExpense({...expense, title: e.target.value})} />
        <input style={inputStyle} type="number" placeholder="Amount" value={expense.amount} onChange={e => setExpense({...expense, amount: e.target.value})} />
        <button style={{ background: '#f59e0b', padding: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>ADD</button>
      </form>

      <div style={{ background: '#111', borderRadius: '10px' }}>
        {list.map((ex, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #222' }}>
            <span>{ex.title} <br/><small style={{color:'#444'}}>{ex.dateString}</small></span>
            <span style={{ color: '#ef4444' }}>- Rs. {ex.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const inputStyle = { padding: '10px', background: '#000', border: '1px solid #333', color: '#fff', flex: 1, borderRadius: '5px' };

export default ExpenseTracker;
