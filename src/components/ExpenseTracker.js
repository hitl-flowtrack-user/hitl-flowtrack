import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";

const ExpenseTracker = () => {
  const [expense, setExpense] = useState({ title: '', amount: '', note: '' });
  const [list, setList] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "expenses_records"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!expense.title || !expense.amount) return alert("Title aur Amount zaroori hain!");
    
    try {
      await addDoc(collection(db, "expenses_records"), {
        title: expense.title,
        amount: parseFloat(expense.amount),
        note: expense.note || "",
        timestamp: new Date(),
        dateString: new Date().toLocaleDateString()
      });
      setExpense({ title: '', amount: '', note: '' });
    } catch (err) { console.error(err); }
  };

  const deleteExpense = async (id) => {
    if (window.confirm("Kya aap ye kharcha delete karna chahte hain?")) {
      await deleteDoc(doc(db, "expenses_records", id));
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#1e3a8a', marginTop: 0 }}>💸 Daily Expenses</h2>
        <form onSubmit={addExpense} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px' }}>
          <input 
            style={inputStyle} placeholder="Kharchay ka Naam" 
            value={expense.title} onChange={e => setExpense({...expense, title: e.target.value})} 
          />
          <input 
            style={inputStyle} type="number" placeholder="Raqam (Rs.)" 
            value={expense.amount} onChange={e => setExpense({...expense, amount: e.target.value})} 
          />
          <button style={{ background: '#ef4444', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            ADD
          </button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Expense List</span>
          <span style={{ color: '#ef4444' }}>Total: Rs. {list.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
        </div>
        {list.map((ex) => (
          <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{ex.title}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{ex.dateString}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Rs. {ex.amount}</span>
              <button onClick={() => deleteExpense(ex.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const inputStyle = { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' };

export default ExpenseTracker;
