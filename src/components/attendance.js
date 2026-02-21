import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";

const Attendance = () => {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '', cnic: '', designation: '', department: '', 
    defaultIn: '09:00', defaultOut: '18:00'
  });

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    const querySnapshot = await getDocs(collection(db, "staff_members"));
    setStaff(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "staff_members"), {
        ...newStaff,
        status: 'Offline',
        actualTimeIn: '',
        actualTimeOut: '',
        actualDuration: ''
      });
      alert("Staff Member Added!");
      setShowForm(false);
      fetchStaff();
    } catch (err) { alert(err.message); }
  };

  const handleCheckIn = async (id) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    await updateDoc(doc(db, "staff_members", id), { status: 'Present', actualTimeIn: time });
    fetchStaff();
  };

  const handleCheckOut = async (id) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    await updateDoc(doc(db, "staff_members", id), { status: 'Checked-Out', actualTimeOut: time });
    fetchStaff();
  };

  return (
    <div style={{ padding: '10px', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', color: '#f59e0b' }}>👥 STAFF & ATTENDANCE</h2>

      {/* Add Staff Button */}
      <button onClick={() => setShowForm(!showForm)} style={addBtnStyle}>
        {showForm ? '✖ Close Form' : '➕ Register New Staff'}
      </button>

      {showForm && (
        <form onSubmit={handleAddStaff} style={formStyle}>
          <input placeholder="Full Name" onChange={e => setNewStaff({...newStaff, name: e.target.value})} required />
          <input placeholder="CNIC Number" onChange={e => setNewStaff({...newStaff, cnic: e.target.value})} required />
          <input placeholder="Designation" onChange={e => setNewStaff({...newStaff, designation: e.target.value})} required />
          <input placeholder="Department" onChange={e => setNewStaff({...newStaff, department: e.target.value})} required />
          <button type="submit" style={submitBtn}>Save Staff Member</button>
        </form>
      )}

      {/* Staff List */}
      <div style={{ marginTop: '20px' }}>
        {staff.map(member => (
          <div key={member.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ color: '#f59e0b' }}>{member.name}</h4>
                <p style={{ fontSize: '11px', color: '#888' }}>{member.designation} ({member.cnic})</p>
              </div>
              <div style={{ background: member.status === 'Present' ? '#10b981' : '#333', padding: '5px 10px', borderRadius: '5px', fontSize: '10px' }}>
                {member.status}
              </div>
            </div>

            <div style={timeRow}>
              <div>In: {member.actualTimeIn || '--'}</div>
              <div>Out: {member.actualTimeOut || '--'}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <button disabled={member.status === 'Present'} onClick={() => handleCheckIn(member.id)} style={{...actionBtn, background: '#10b981'}}>Check In</button>
              <button disabled={member.status !== 'Present'} onClick={() => handleCheckOut(member.id)} style={{...actionBtn, background: '#ef4444'}}>Check Out</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Styles ---
const addBtnStyle = { width: '100%', padding: '12px', background: '#222', color: '#f59e0b', border: '1px dashed #f59e0b', borderRadius: '10px', fontWeight: 'bold' };
const formStyle = { background: '#111', padding: '15px', borderRadius: '15px', marginTop: '10px', border: '1px solid #333' };
const submitBtn = { width: '100%', padding: '12px', background: '#f59e0b', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginTop: '10px' };
const cardStyle = { background: '#111', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #333' };
const timeRow = { display: 'flex', justifyContent: 'space-around', fontSize: '12px', marginTop: '10px', color: '#aaa' };
const actionBtn = { padding: '10px', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold' };

export default Attendance;
