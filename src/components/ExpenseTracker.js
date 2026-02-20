import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

const ExpenseTracker = () => {
  const [expense, setExpense] = useState({ title: '', amount: '' });
  const [list, setList] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "expenses_records"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) => {
      setList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!expense.title || !expense.amount) return;
    await addDoc(collection(db, "expenses_records"), {
      ...expense,
      amount: parseFloat(expense.amount),
      timestamp: new Date(),
      dateString: new Date().toLocaleDateString()
    });
    setExpense({ title: '', amount: '' });
  };

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ color: '#ef4444' }}>Dukan Expenses</h3>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} placeholder="Expense Title" value={expense.title} onChange={e => setExpense({...expense, title: e.target.value})} />
        <input style={{ width: '120px', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} type="number" placeholder="Amount" value={expense.amount} onChange={e => setExpense({...expense, amount: e.target.value})} />
        <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>ADD</button>
      </form>
      {list.map(ex => (
        <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
          <span>{ex.title}</span>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>- Rs. {ex.amount}</span>
        </div>
      ))}
    </div>
  );
};

export default ExpenseTracker;
