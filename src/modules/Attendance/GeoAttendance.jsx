import React, { useState, useEffect } from 'react';
import { db, logActivity } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';

const GeoAttendance = ({ currentUser }) => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  // Company ki fixed location (Office ya Shop ki Lat/Lng)
  // Aap isay database se bhi utha sakte hain, filhal sample coordinates hain:
  const COMPANY_LOCATION = { lat: 31.3454, lng: 73.5123 }; // Jaranwala Sample
  const ALLOWED_DISTANCE = 200; // 200 Meters

  // 1. Distance Calculate Karne ka Formula (Haversine Formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Zameen ka radius meters mein
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Meter mein fasla
  };

  // 2. User ki Current Location Check Karna
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          const dist = calculateDistance(
            latitude, longitude, 
            COMPANY_LOCATION.lat, COMPANY_LOCATION.lng
          );

          if (dist <= ALLOWED_DISTANCE) {
            setIsWithinRange(true);
          } else {
            setIsWithinRange(false);
          }
        },
        (err) => setError("Location access denied. Please enable GPS."),
        { enableHighAccuracy: true }
      );
    } else {
      setError("Aap ka browser GPS support nahi karta.");
    }
  }, []);

  // 3. Attendance Save Karna
  const markAttendance = async () => {
    if (!isWithinRange) {
      alert("Aap office se door hain! Attendance nahi lag sakti.");
      return;
    }

    try {
      await addDoc(collection(db, "attendance"), {
        userId: currentUser.uid,
        userName: currentUser.name,
        companyId: currentUser.companyId,
        timestamp: serverTimestamp(),
        location: location,
        status: "Present"
      });

      // Activity log mein record save karna
      await logActivity(
        currentUser.uid,
        currentUser.companyId,
        "ATTENDANCE_MARKED",
        "Attendance",
        `Marked attendance at ${new Date().toLocaleTimeString()}`
      );

      setAttendanceMarked(true);
      alert("Attendance lag gayi hai!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <Clock className="mx-auto text-blue-500 mb-2" size={48} />
        <h2 className="text-2xl font-bold text-gray-800">Geo Attendance</h2>
        <p className="text-gray-500 text-sm">HITL-FlowTrack Verification System</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <XCircle size={20} /> {error}
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${isWithinRange ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Location Status:</span>
              {isWithinRange ? (
                <span className="text-green-600 flex items-center gap-1 font-bold">
                  <CheckCircle size={18} /> In Range
                </span>
              ) : (
                <span className="text-orange-600 flex items-center gap-1 font-bold">
                  <MapPin size={18} /> Out of Range
                </span>
              )}
            </div>
            <p className="text-xs mt-2 text-gray-500">
              Note: Attendance sirf 200m ke radius mein lag sakti hai.
            </p>
          </div>

          <button
            onClick={markAttendance}
            disabled={!isWithinRange || attendanceMarked}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
              isWithinRange && !attendanceMarked 
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {attendanceMarked ? "Attendance Lag Chuki Hai" : "Check-In Karen"}
          </button>
        </div>
      )}

      {/* Security Note */}
      <div className="mt-6 text-[10px] text-center text-gray-400 uppercase tracking-widest">
        Encrypted & Geo-Restricted by HITL-FlowTrack
      </div>
    </div>
  );
};

export default GeoAttendance;