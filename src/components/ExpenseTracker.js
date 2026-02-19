import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const addExpense = async () => {
    if(!title || !amount) return;
    await addDoc(collection(db, "expenses"), { title, amount: parseFloat(amount), createdAt: serverTimestamp() });
    setTitle(''); setAmount('');
  };

  return (
    <div style={{padding: '20px', color: '#fff'}}>
      <h2 style={{color: '#f59e0b'}}>EXPENSE TRACKER</h2>
      <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
        <input className="search-input" style={{width:'60%'}} placeholder="Expense Title (e.g. Electricity Bill)" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="search-input" style={{width:'20%'}} type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
        <button onClick={addExpense} style={{background:'#f59e0b', padding:'10px 20px', border:'none', borderRadius:'8px', fontWeight:'900', cursor:'pointer'}}>ADD</button>
      </div>
      
      <div style={{background:'#111', borderRadius:'15px', padding:'15px'}}>
        {expenses.map(ex => (
          <div key={ex.id} style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #222'}}>
            <span>{ex.title}</span>
            <span style={{color:'#ef4444'}}>- Rs. {ex.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ExpenseTracker;
