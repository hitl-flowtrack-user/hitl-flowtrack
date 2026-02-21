import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from "firebase/firestore";

const UserManagement = () => {
  const [uid, setUid] = useState('');
  const [role, setRole] = useState('user');

  const updateRole = async () => {
    if (!uid) return;
    try {
      await setDoc(doc(db, "authorized_users", uid.trim()), { role });
      alert("Role Updated!");
      setUid('');
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <h3>⚙️ SYSTEM SETTINGS</h3>
      <div style={{ background: '#111', padding: '15px', borderRadius: '15px' }}>
        <p style={{fontSize: '12px', color: '#888', marginBottom: '10px'}}>Assign roles to staff members using their UID.</p>
        <input placeholder="Enter User UID" value={uid} onChange={e => setUid(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="user">Staff (User)</option>
          <option value="admin">Manager (Admin)</option>
          <option value="super-admin">Owner (Super Admin)</option>
        </select>
        <button onClick={updateRole} style={{ width: '100%', padding: '12px', background: '#f59e0b', color: '#000', borderRadius: '10px' }}>SAVE ROLE</button>
      </div>
    </div>
  );
};

export default UserManagement;
