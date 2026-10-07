"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, User, Car, Bell, AlertTriangle } from "lucide-react";

export function UpcomingEventsBoard({ data }: { data: any[] }) {
  const [selectedDate, setSelectedDate] = useState<string>("today");

  // Helper to get today's date in YYYY-MM-DD using IST timezone
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = tomorrowObj.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const isDateOver = (dateStr: string) => {
    if (!dateStr || dateStr.toLowerCase() === "today" || dateStr.toLowerCase() === "tomorrow") return false;
    try {
      const evtDate = new Date(dateStr);
      const todayDate = new Date(today);
      if (!isNaN(evtDate.getTime()) && evtDate < todayDate) {
        return true;
      }
    } catch(e) {}
    return false;
  };

  // Extract all events from logs
  const allEvents: any[] = [];

  data.forEach((log) => {
    const visitDay = log["Visit Day"]?.trim() || "";
    const serviceType = log["Service Type"]?.trim() || "";
    const time = log["Visit Time"]?.trim() || "Time TBD";
    
    if (visitDay && visitDay !== "-") {
      let dateString = visitDay;
      const callDateStr = log["Call Date"];
      
      if (callDateStr && callDateStr !== "-") {
        try {
          const callDate = new Date(callDateStr);
          if (callDate && !isNaN(callDate.getTime())) {
            const vLower = visitDay.toLowerCase();
            if (vLower === "today") {
              dateString = callDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
            } else if (vLower === "tomorrow") {
              const tmrw = new Date(callDate);
              tmrw.setDate(tmrw.getDate() + 1);
              dateString = tmrw.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
            } else {
              // Normalize date by removing day names like "Wednesday, " to fix Firefox/Safari parsing
              const cleanVisitDay = visitDay.replace(/^[A-Za-z]+,\s*/, "").trim();
              
              let vDate = new Date(cleanVisitDay);
              if (!isNaN(vDate.getTime())) {
                if (vDate.getFullYear() === 2001 || vDate.getFullYear() < 2020) {
                  vDate = new Date(`${cleanVisitDay} ${callDate.getFullYear()}`);
                }
                if (!isNaN(vDate.getTime())) {
                  dateString = vDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                }
              } else {
                let vDateWithYear = new Date(`${cleanVisitDay} ${callDate.getFullYear()}`);
                if (!isNaN(vDateWithYear.getTime())) {
                   dateString = vDateWithYear.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                }
              }
            }
          }
        } catch (e) {}
      } else {
        if (visitDay.toLowerCase() === "today") dateString = today;
        if (visitDay.toLowerCase() === "tomorrow") dateString = tomorrow;
      }
      
      allEvents.push({
        id: `${log["Phone Number"] || "x"}_${log["Call Date"] || "x"}_${log["Visit Day"] || "x"}`,
        type: serviceType && serviceType !== "-" ? "service" : "showroom",
        title: serviceType && serviceType !== "-" ? `Service: ${serviceType}` : "Showroom Visit",
        customer: log["Customer Name"] || "Unknown",
        phone: log["Phone Number"] || "-",
        vehicle: log["Vehicle Model"] || "Unknown",
        date: dateString,
        time: time,
      });
    }
  });

  // Filter events
  let displayEvents = allEvents;
  if (selectedDate === "today") {
    displayEvents = allEvents.filter(e => e.date === today || e.date.toLowerCase() === "today");
  } else if (selectedDate === "tomorrow") {
    displayEvents = allEvents.filter(e => e.date === tomorrow || e.date.toLowerCase() === "tomorrow");
  } else if (selectedDate === "all") {
    displayEvents = allEvents;
  } else {
    // If user picks a specific date
    displayEvents = allEvents.filter(e => e.date === selectedDate);
  }

  return (
    <div className="bg-white dark:bg-black border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden flex flex-col group/board transition-all duration-500">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-volvo-blue/5 to-transparent rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover/board:bg-volvo-blue/10 transition-colors duration-500">
            <Bell className="w-5 h-5 text-gray-400 group-hover/board:text-volvo-blue transition-colors duration-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 dark:text-white">Notice Board</h2>
            <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">Upcoming Appointments & Bookings</p>
          </div>
        </div>
        
        <div className="flex items-center bg-gray-50 dark:bg-white/5 p-1 rounded-xl relative z-10 w-full lg:w-auto overflow-x-auto">
          {["today", "tomorrow", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedDate(tab)}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                selectedDate === tab 
                  ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-300 dark:bg-white/20 mx-2" />
          <button className="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2">
            mm/dd/yyyy <Calendar className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 min-h-[300px] relative">
        {displayEvents.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 animate-in fade-in duration-500">
            <Calendar className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">No Events Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((evt, i) => {
              const over = isDateOver(evt.date);
              return (
                <div 
                  key={evt.id} 
                  className={`group relative bg-white dark:bg-[#050505] border p-6 rounded-2xl transition-all duration-500 overflow-hidden ${
                    over 
                      ? 'border-gray-200 dark:border-white/5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0' 
                      : 'border-gray-100 dark:border-white/5 hover:border-volvo-blue/30 hover:shadow-xl hover:-translate-y-1'
                  }`}
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
                >
                  {/* Accent glow on hover */}
                  {!over && <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${evt.type === 'service' ? 'bg-orange-500' : 'bg-volvo-blue'}`} />}
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <h3 className={`font-extrabold uppercase text-xs tracking-widest ${over ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {evt.title}
                    </h3>
                    <span className={`text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest shadow-sm ${
                      over 
                        ? 'bg-gray-100 text-gray-500 dark:bg-white/5' 
                        : evt.type === 'service' 
                          ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' 
                          : 'bg-volvo-blue/10 text-volvo-blue'
                    }`}>
                      {evt.type}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6 relative z-10">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="capitalize font-medium">{evt.customer}</span> <span className="font-mono text-xs opacity-50">({evt.phone})</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Car className="w-4 h-4 text-gray-400" />
                      <span className="font-bold uppercase tracking-wider text-xs">{evt.vehicle}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-xs">Kerala Volvo, Kochi</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold relative z-10">
                    <div className="flex items-center gap-2 text-gray-500 transition-colors">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className={over ? 'line-through opacity-70' : ''}>{evt.date}</span>
                    </div>
                    {over ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-[9px] uppercase tracking-widest">Date Over</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-volvo-blue">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-mono">{evt.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
