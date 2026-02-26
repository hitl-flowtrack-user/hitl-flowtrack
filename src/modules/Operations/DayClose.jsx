import React, { useState, useEffect } from 'react';
import { db, logActivity } from '../../firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { Lock, Unlock, TrendingUp, ShoppingBag, Users, CheckCircle } from 'lucide-react';

const DayClose = ({ currentUser }) => {
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, attendanceCount: 0 });
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0]; // Aaj ki date (YYYY-MM-DD)

  // 1. Aaj ka Data aur Lock Status Check Karna
  const fetchDailyStats = async () => {
    setLoading(true);
    try {
      // Sales Check
      const salesQuery = query(
        collection(db, "orders"),
        where("companyId", "==", currentUser.companyId),
        where("timestamp", ">=", new Date(todayDate))
      );
      const salesSnap = await getDocs(salesQuery);
      let total = 0;
      salesSnap.forEach(doc => total += doc.data().total);

      // Attendance Check
      const attendQuery = query(
        collection(db, "attendance"),
        where("companyId", "==", currentUser.companyId),
        where("timestamp", ">=", new Date(todayDate))
      );
      const attendSnap = await getDocs(attendQuery);

      // Lock Status Check (Hum "locks" collection mein check karenge)
      const lockSnap = await getDocs(query(
        collection(db, "day_locks"),
        where("companyId", "==", currentUser.companyId),
        where("date", "==", todayDate)
      ));

      setStats({
        totalSales: total,
        totalOrders: salesSnap.size,
        attendanceCount: attendSnap.size
      });
      setIsLocked(!lockSnap.empty);

    } catch (e) {
      console.error("Stats error: ", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser?.companyId) fetchDailyStats();
  }, [currentUser]);

  // 2. Day Close (Lock) Activate Karna
  const handleDayClose = async () => {
    if (window.confirm("Kya aap waqai Day Close karna chahte hain? Iske baad aaj ka data edit nahi ho sakega.")) {
      try {
        await addDoc(collection(db, "day_locks"), {
          companyId: currentUser.companyId,
          date: todayDate,
          closedBy: currentUser.uid,
          closedAt: serverTimestamp(),
          finalSales: stats.totalSales
        });

        await logActivity(
          currentUser.uid, 
          currentUser.companyId, 
          "DAY_CLOSED", 
          "Operations", 
          `Day closed for ${todayDate}. Total Sales: ${stats.totalSales}`
        );

        setIsLocked(true);
        alert("System Locked! Din ka ikhtitam ho gaya.");
      } catch (e) {
        alert("Lock lagane mein masla: " + e.message);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-2 mb-8">
        <Lock className="text-red-600" size={32} />
        <h1 className="text-2xl font-bold text-gray-800">Day Close & Daily Analytics</h1>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <TrendingUp className="text-green-500" />
            <span className="text-xs font-bold text-gray-400">TOTAL SALES</span>
          </div>
          <h2 className="text-3xl font-black">Rs. {stats.totalSales}</h2>
          <p className="text-sm text-gray-500 mt-1">Aaj ki kul farokht</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <ShoppingBag className="text-blue-500" />
            <span className="text-xs font-bold text-gray-400">TOTAL ORDERS</span>
          </div>
          <h2 className="text-3xl font-black">{stats.totalOrders}</h2>
          <p className="text-sm text-gray-500 mt-1">Book kiye gaye orders</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-orange-500">
          <div className="flex justify-between items-center mb-4">
            <Users className="text-orange-500" />
            <span className="text-xs font-bold text-gray-400">ATTENDANCE</span>
          </div>
          <h2 className="text-3xl font-black">{stats.attendanceCount}</h2>
          <p className="text-sm text-gray-500 mt-1">Staff jo hazir hai</p>
        </div>
      </div>

      {/* Lock Action Area */}
      <div className="bg-white p-8 rounded-3xl shadow-lg text-center border-2 border-dashed border-gray-200">
        {isLocked ? (
          <div className="space-y-4">
            <div className="bg-red-100 text-red-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Aaj ka Din Lock Hai</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Security ki wajah se aaj ki tarikh mein mazeed koi tabdeeli nahi ki ja sakti. 
              Naye orders kal ki tarikh mein book honge.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
              <CheckCircle size={16} /> Closed by Admin
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-100 text-blue-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Unlock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Day Close System Active</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Chutti karne se pehle "Day Close" ka button dabayen taake sara data mahfooz (Lock) ho jaye.
            </p>
            <button 
              onClick={handleDayClose}
              disabled={loading}
              className="bg-red-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-200"
            >
              {loading ? "Locking..." : "Close Day Now"}
            </button>
          </div>
        )}
      </div>

      {/* DocVault Note */}
      <p className="text-center mt-8 text-gray-400 text-sm">
        Generated reports will be saved in <b>DocVault</b> automatically after Day Close.
      </p>
    </div>
  );
};

export default DayClose;