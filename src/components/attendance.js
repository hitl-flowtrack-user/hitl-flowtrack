import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Attendance = ({ onMarked }) => {
  const [status, setStatus] = useState("Mark Attendance to Unlock System");
  const [loading, setLoading] = useState(false);

  const markAttendance = async () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          await addDoc(collection(db, "daily_attendance"), {
            userId: "Admin", // Baad mein Auth se connect karenge
            time: new Date().toLocaleString(),
            lat: latitude,
            lng: longitude,
            date: new Date().toLocaleDateString()
          });
          
          localStorage.setItem("attendance_done", new Date().toLocaleDateString());
          setStatus("Attendance Marked! System Unlocked.");
          onMarked(true);
        } catch (e) {
          alert("Error marking attendance: " + e.message);
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">HITL FlowTrack</h1>
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-blue-500 text-center">
        <p className="mb-6 text-gray-300">{status}</p>
        <button 
          onClick={markAttendance}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
        >
          {loading ? "Verifying..." : "Mark Attendance (Face/GPS)"}
        </button>
      </div>
    </div>
  );
};

export default Attendance;