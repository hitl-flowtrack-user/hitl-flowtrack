import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login'; 
import Navbar from './components/navbar';
import AddItem from './components/additem';
import InventoryView from './components/inventoryview';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("flowtrack_session");
    const attendance = localStorage.getItem("attendance_done");
    if (session === "active") setIsAuthenticated(true);
    if (attendance === "true") setIsAttendanceMarked(true);
  }, []);

  const markAttendance = () => {
    localStorage.setItem("attendance_done", "true");
    setIsAttendanceMarked(true);
  };

  return (
    <Router>
      <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
        {isAuthenticated && (
          <Navbar setAuth={setIsAuthenticated} setAttendanceMarked={setIsAttendanceMarked} />
        )}
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
          <Route path="/" element={isAuthenticated ? (
            !isAttendanceMarked ? (
              <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h2 style={{fontSize: '30px', fontWeight: 'bold'}}>SYSTEM LOCKED</h2>
                <button onClick={markAttendance} style={{ padding: '15px 40px', marginTop: '20px', cursor: 'pointer', borderRadius: '50px', border: 'none', fontWeight: 'bold' }}>
                  MARK ATTENDANCE
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h1 style={{fontSize: '40px'}}>HITL FLOWTRACK PRO</h1>
                <p style={{color: '#f59e0b'}}>Authorized Access Only</p>
              </div>
            )
          ) : <Navigate to="/login" />} />
          <Route path="/additem" element={isAuthenticated && isAttendanceMarked ? <AddItem /> : <Navigate to="/" />} />
          <Route path="/inventoryview" element={isAuthenticated && isAttendanceMarked ? <InventoryView /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};
export default App;