import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, where } from "firebase/firestore";

const Attendance = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default Duty Timings (Example: 9:00 AM to 6:00 PM)
  const defaultIn = "09:00";
  const defaultOut = "18:00";
  const defaultDuration = "9 Hours";

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "staff_members"));
      const staffList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaff(staffList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setLoading(false);
    }
  };

  const handleCheckIn = async (staffId) => {
    const now = new Date();
    const timeIn = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    
    try {
      const staffRef = doc(db, "staff_members", staffId);
      await updateDoc(staffRef, { 
        actualTimeIn: timeIn,
        status: 'Present',
        lastUpdated: serverTimestamp()
      });
      alert("Check-in Successful!");
      fetchStaff();
    } catch (err) { alert(err.message); }
  };

  const handleCheckOut = async (staffMember) => {
    const now = new Date();
    const timeOut = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    
    // Duration Calculation
    const [inH, inM] = staffMember.actualTimeIn.split(':');
    const [outH, outM] = [now.getHours(), now.getMinutes()];
    const diffHours = outH - parseInt(inH);
    const diffMins = outM - parseInt(inM);
    const duration = `${diffHours}h ${Math.abs(diffMins)}m`;

    try {
      const staffRef = doc(db, "staff_members", staffMember.id);
      await updateDoc(staffRef, { 
        actualTimeOut: timeOut,
        actualDuration: duration,
        status: 'Checked-Out',
        lastUpdated: serverTimestamp()
      });
      alert("Check-out Successful!");
      fetchStaff();
    } catch (err) { alert(err.message); }
  };

  return (
    <div style={{ padding: '10px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h2 style={{ color: '#f59e0b', textAlign: 'center' }}>👥 STAFF ATTENDANCE</h2>
      
      {loading ? <p>Loading Staff...</p> : (
        <div style={listContainer}>
          {staff.map((member) => (
            <div key={member.id} style={staffCard}>
              {/* Profile Header */}
              <div style={cardHeader}>
                <div style={avatar}>{member.name[0]}</div>
                <div style={{ textAlign: 'left', flex: 1, marginLeft: '15px' }}>
                  <h3 style={{ margin: 0, color: '#f59e0b', fontSize: '18px' }}>{member.name}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{member.designation} | {member.department}</p>
                </div>
                <div style={{ ...statusBadge, background: member.status === 'Present' ? '#10b981' : '#333' }}>
                  {member.status || 'Offline'}
                </div>
              </div>

              {/* Data Grid */}
              <div style={infoGrid}>
                <div style={infoBox}>
                  <span>🆔 CNIC</span>
                  <strong>{member.cnic || 'N/A'}</strong>
                </div>
                <div style={infoBox}>
                  <span>📅 Duty Schedule</span>
                  <strong>{defaultIn} - {defaultOut} ({defaultDuration})</strong>
                </div>
              </div>

              {/* Actual Timings Comparison */}
              <div style={attendanceStats}>
                <div style={statItem}>
                  <span style={{color: '#888'}}>Actual In</span>
                  <strong style={{color: '#10b981'}}>{member.actualTimeIn || '--:--'}</strong>
                </div>
                <div style={statItem}>
                  <span style={{color: '#888'}}>Actual Out</span>
                  <strong style={{color: '#ef4444'}}>{member.actualTimeOut || '--:--'}</strong>
                </div>
                <div style={statItem}>
                  <span style={{color: '#888'}}>Work Duration</span>
                  <strong style={{color: '#f59e0b'}}>{member.actualDuration || '0h 0m'}</strong>
                </div>
              </div>

              {/* Actions */}
              <div style={actionRow}>
                <button 
                  disabled={member.status === 'Present' || member.status === 'Checked-Out'}
                  onClick={() => handleCheckIn(member.id)} 
                  style={{ ...actionBtn, background: '#10b981' }}
                >
                  Check In
                </button>
                <button 
                  disabled={member.status !== 'Present'}
                  onClick={() => handleCheckOut(member)} 
                  style={{ ...actionBtn, background: '#ef4444' }}
                >
                  Check Out
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Mobile Friendly Styles ---
const listContainer = { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' };
const staffCard = { background: '#111', borderRadius: '20px', padding: '20px', border: '1px solid #333' };
const cardHeader = { display: 'flex', alignItems: 'center', marginBottom: '15px' };
const avatar = { width: '50px', height: '50px', background: '#222', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f59e0b', fontSize: '20px', border: '1px solid #f59e0b' };
const statusBadge = { padding: '5px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' };
const infoGrid = { display: 'grid', gridTemplateColumns: '1fr', gap: '10px', background: '#000', padding: '12px', borderRadius: '12px', marginBottom: '15px' };
const infoBox = { display: 'flex', justifyContent: 'space-between', fontSize: '12px' };
const attendanceStats = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', marginBottom: '15px', borderTop: '1px solid #222', paddingTop: '15px' };
const statItem = { display: 'flex', flexDirection: 'column', fontSize: '11px' };
const actionRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const actionBtn = { border: 'none', padding: '12px', borderRadius: '10px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', opacity: '1' };

export default Attendance;
