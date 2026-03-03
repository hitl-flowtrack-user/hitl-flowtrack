import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { Calendar, CheckCircle, Clock, Users, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function GeoAttendance() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Aaj ki date (Format: DD-MM-YYYY)
  const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

  useEffect(() => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }

    // 1. Fetch Staff
    const qStaff = query(collection(db, "staff"), where("companyId", "==", user.companyId));
    const unsubStaff = onSnapshot(qStaff, (snapshot) => {
      const staffData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setStaff(staffData);
    }, (error) => {
      console.error("Staff Error:", error);
    });

    // 2. Fetch Attendance
    const qAtt = query(
      collection(db, "daily_attendance"), 
      where("date", "==", today),
      where("companyId", "==", user.companyId)
    );
    
    const unsubAtt = onSnapshot(qAtt, (snapshot) => {
      const markedIds = snapshot.docs.map(d => d.data().staffId);
      setAttendanceList(markedIds);
      setLoading(false); // Sirf yahan set karein taake loop na bane
    }, (error) => {
      console.error("Attendance Error:", error);
      setLoading(false);
    });

    return () => { unsubStaff(); unsubAtt(); };
  }, [user?.companyId, today]);

  const markAttendance = async (member) => {
    try {
      await addDoc(collection(db, "daily_attendance"), {
        staffId: member.id,
        staffName: member.name,
        role: member.role || "User",
        companyId: user.companyId,
        date: today,
        checkInTime: new Date().toLocaleTimeString(),
        timestamp: serverTimestamp(),
        status: "Present"
      });
    } catch (err) {
      alert("Failed to mark attendance.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading Gatekeeper...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-slate-950 min-h-screen text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black italic uppercase flex items-center gap-3 tracking-tighter text-white">
            <Calendar className="text-amber-500" size={32} /> Attendance Logs
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            Session Date: <span className="text-amber-500">{today}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {staff.map((member) => {
          const isPresent = attendanceList.includes(member.id);
          return (
            <div key={member.id} className={`p-6 rounded-[2.5rem] border transition-all ${isPresent ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#121212] border-white/5'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black italic text-xl ${isPresent ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                    {member.name ? member.name[0] : '?'}
                  </div>
                  <div>
                    <h3 className="font-black uppercase italic text-sm">{member.name}</h3>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase">{member.role}</p>
                  </div>
                </div>
                {isPresent && <CheckCircle className="text-emerald-500" size={20} />}
              </div>

              {!isPresent ? (
                <button 
                  onClick={() => markAttendance(member)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl font-black uppercase text-[10px] transition-all italic shadow-lg"
                >
                  Mark Present
                </button>
              ) : (
                <div className="w-full bg-emerald-500/20 py-4 rounded-2xl text-center">
                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">On Duty</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-24 bg-[#121212] rounded-[3rem] border border-dashed border-white/10">
          <AlertCircle className="mx-auto text-zinc-800 mb-4" size={56} />
          <p className="text-zinc-600 font-black uppercase text-xs">No Staff Registered</p>
        </div>
      )}
    </div>
  );
}