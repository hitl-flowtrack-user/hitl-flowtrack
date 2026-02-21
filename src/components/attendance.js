import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

const Attendance = () => {
  const [staffName, setStaffName] = useState('');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "attendance_records"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) => {
      setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const markAttendance = async (status) => {
    if (!staffName) return alert("Bhai, pehle naam to likhen!");
    try {
      await addDoc(collection(db, "attendance_records"), {
        name: staffName,
        status: status,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        timestamp: new Date()
      });
      setStaffName('');
      alert(`Attendance marked: ${status}`);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '15px', color: '#fff' }}>
      <h2 style={{ color: '#f59e0b', textAlign: 'center' }}>👥 Staff Attendance</h2>
      
      <div style={{ background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #333', marginBottom: '20px' }}>
        <input 
          style={inputStyle} 
          placeholder="Enter Staff Name" 
          value={staffName} 
          onChange={(e) => setStaffName(e.target.value)} 
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
          <button onClick={() => markAttendance('PRESENT')} style={btnStyle('#10b981')}>PRESENT</button>
          <button onClick={() => markAttendance('ABSENT')} style={btnStyle('#ef4444')}>ABSENT</button>
        </div>
      </div>

      <div style={{ background: '#111', borderRadius: '15px', overflow: 'hidden', border: '1px solid #333' }}>
        <div style={{ background: '#222', padding: '10px', fontWeight: 'bold', color: '#f59e0b' }}>Recent History</div>
        {records.map(r => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #222' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{r.name}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>{r.date} | {r.time}</div>
            </div>
            <span style={{ color: r.status === 'PRESENT' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #f59e0b', background: '#000', color: '#fff', boxSizing: 'border-box' };
const btnStyle = (col) => ({ background: col, color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' });

export default Attendance;
