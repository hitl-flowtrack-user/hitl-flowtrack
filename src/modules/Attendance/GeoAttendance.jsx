import React, { useState, useEffect } from 'react';
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { MapPin, Clock, Calendar, Loader2 } from "lucide-react";

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const q = query(collection(db, "attendance"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Attendance Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return (
    <div className="flex justify-center p-20 text-amber-500">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black italic uppercase text-white flex items-center gap-3">
        <Calendar className="text-amber-500" size={32} /> Attendance Logs
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map((data) => {
          // Google Maps Link (Using open source logic if no API Key)
          const mapPreviewUrl = `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${data.longitude},${data.latitude}&z=14&l=map&size=450,300&pt=${data.longitude},${data.latitude},pm2rdm`;

          return (
            <div key={data.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-black uppercase text-sm">
                    {data.userName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase text-sm">{data.userName || "Unknown User"}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                      <Clock size={10} /> {data.time || "N/A"}
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-3 py-1 rounded-full font-black uppercase border border-emerald-500/20">Present</span>
              </div>

              {/* READ-ONLY MAP PREVIEW */}
              <div className="w-full h-44 bg-zinc-800 rounded-2xl overflow-hidden border border-white/5 relative">
                <img 
                  src={mapPreviewUrl} 
                  alt="Location" 
                  className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-700"
                />
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black text-white flex items-center gap-1 border border-white/10 uppercase tracking-widest">
                  <MapPin size={10} className="text-amber-500" /> Verified Location
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Attendance;