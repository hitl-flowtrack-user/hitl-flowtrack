import React, { useState, useEffect } from 'react';
// Path: ../firebase kyunke ye file components folder ke andar hai
import { db } from '../firebase'; 
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";

const ExpenseTracker = () => {
  const [expense, setExpense] = useState({ title: '', amount: '', note: '' });
  const [list, setList] = useState([]);

  useEffect(() => {
    // Firebase se expenses mangwana
    const q = query(collection(db, "expenses_records"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!expense.title || !expense.amount) return alert("Please fill Title and Amount!");
    
    try {
      await addDoc(collection(db, "expenses_records"), {
        title: expense.title,
        amount: parseFloat(expense.amount),
        note: expense.note || "",
        timestamp: new Date(),
        dateString: new Date().toLocaleDateString()
      });
      // Form khali karna
      setExpense({ title: '', amount: '', note: '' });
      alert("Expense Added Successfully!");
    } catch (err) { 
      console.error("Error adding expense: ", err);
      alert("Error: " + err.message);
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteDoc(doc(db, "expenses_records", id));
      } catch (err) {
        console.error("Error deleting: ", err);
      }
    }
  };

  // UI Styles
  const containerStyle = { maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' };
  const cardStyle = { background: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
  const inputStyle = { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px', width: '100%', boxSizing: 'border-box' };
  const btnStyle = { background: '#ef4444', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#1e3a8a', marginTop: 0 }}>💸 Expense Tracker</h2>
        <form onSubmit={addExpense}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input 
              style={inputStyle} placeholder="Expense Title (e.g. Electricity Bill)" 
              value={expense.title} onChange={e => setExpense({...expense, title: e.target.value})} 
            />
            <input 
              style={inputStyle} type="number" placeholder="Amount (Rs.)" 
              value={expense.amount} onChange={e => setExpense({...expense, amount: e.target.value})} 
            />
          </div>
          <input 
            style={inputStyle} placeholder="Optional Note" 
            value={expense.note} onChange={e => setExpense({...expense, note: e.target.value})} 
          />
          <button type="submit" style={btnStyle}>SAVE EXPENSE</button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: '15px', border: '1px solid #e2e8f0
