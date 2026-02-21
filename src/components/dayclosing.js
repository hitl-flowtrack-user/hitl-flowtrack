import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from "firebase/firestore";

export default function Dayclosing() {
  const [closing, setClosing] = useState({ cashInHand: '', remarks: '' });

  const handleClosing = async () => {
    if (!closing.cashInHand) return alert("Cash in hand lazmi likhen!");
    await addDoc(collection(db, "day_closings"), {
      ...closing,
      timestamp: new Date(),
      date: new Date().toLocaleDateString()
    });
    alert("Day Closed Successfully!");
    setClosing({ cashInHand: '', remarks: '' });
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '15px', color: '#fff' }}>
      <h2 style={{ color: '#f59e0b', textAlign: 'center' }}>⏳ Day Closing</h2>
      <div style={{ background: '#111', padding: '20px', borderRadius: '20px', border: '2px solid #f59e0b' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>Total Cash in Counter:</label>
        <input 
          type="number" style={inputStyle} placeholder="Enter Amount" 
          value={closing.cashInHand} onChange={e => setClosing({...closing, cashInHand: e.target.value})} 
        />
        <textarea 
          style={{ ...inputStyle, marginTop: '15px', height: '80px' }} placeholder="Any Notes/Remarks" 
          value={closing.remarks} onChange={e => setClosing({...closing, remarks: e.target.value})}
        />
        <button onClick={handleClosing} style={{ ...btnStyle('#f59e0b'), color: '#000', width: '100%', marginTop: '20px' }}>SUBMIT CLOSING</button>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', boxSizing: 'border-box' };
const btnStyle = (col) => ({ background: col, border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold' });
