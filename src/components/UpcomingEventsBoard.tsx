"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, User, Car, Bell } from "lucide-react";

export function UpcomingEventsBoard({ data }: { data: any[] }) {
  const [selectedDate, setSelectedDate] = useState<string>("today");

  // Helper to get today's date in YYYY-MM-DD using IST timezone
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = tomorrowObj.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

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
            if (visitDay.toLowerCase() === "today") {
              dateString = callDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
            } else if (visitDay.toLowerCase() === "tomorrow") {
              const tmrw = new Date(callDate);
              tmrw.setDate(tmrw.getDate() + 1);
              dateString = tmrw.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-mahindra-red/5 to-transparent rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover/board:bg-mahindra-red/10 transition-colors duration-500">
            <Bell className="w-5 h-5 text-gray-400 group-hover/board:text-mahindra-red transition-colors duration-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 dark:text-white">Notice Board</h2>
            <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">Upcoming Appointments & Bookings</p>
          </div>
        </div>
        
        {/* Date Selector */}
        <div className="flex bg-gray-50 dark:bg-black/50 p-1.5 rounded-xl border border-gray-100 dark:border-white/5 relative z-10 backdrop-blur-xl overflow-x-auto max-w-full hide-scrollbar snap-x">
          <button 
            onClick={() => setSelectedDate("today")}
            className={`px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all duration-300 ${selectedDate === "today" ? "bg-white dark:bg-[#222] text-mahindra-red shadow-sm" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
          >
            Today
          </button>
          <button 
            onClick={() => setSelectedDate("tomorrow")}
            className={`px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all duration-300 ${selectedDate === "tomorrow" ? "bg-white dark:bg-[#222] text-mahindra-red shadow-sm" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
          >
            Tomorrow
          </button>
          <button 
            onClick={() => setSelectedDate("all")}
            className={`px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all duration-300 ${selectedDate === "all" ? "bg-white dark:bg-[#222] text-mahindra-red shadow-sm" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
          >
            All
          </button>
          <div className="flex items-center border-l border-gray-200 dark:border-white/10 pl-3 ml-2">
            <input 
              type="date"
              value={selectedDate !== "today" && selectedDate !== "tomorrow" && selectedDate !== "all" ? selectedDate : ""}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="bg-transparent text-gray-500 dark:text-gray-400 text-xs font-mono focus:outline-none focus:text-mahindra-red dark:focus:text-white [&::-webkit-calendar-picker-indicator]:opacity-50 dark:[&::-webkit-calendar-picker-indicator]:invert hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="p-8 bg-gray-50/50 dark:bg-black/20 flex-1 min-h-[300px] max-h-[450px] overflow-y-auto">
        {displayEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 pt-12">
            <Calendar className="w-12 h-12 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">No Events Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((evt, i) => (
              <div 
                key={i} 
                className="group relative bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 p-6 rounded-2xl hover:border-mahindra-red/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
              >
                {/* Accent glow on hover */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${evt.type === 'service' ? 'bg-blue-500' : 'bg-green-500'}`} />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <h3 className="font-extrabold text-gray-900 dark:text-white uppercase text-xs tracking-widest">{evt.title}</h3>
                  <span className={`text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest shadow-sm ${evt.type === 'service' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                    {evt.type}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6 relative z-10">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-200 capitalize font-medium">{evt.customer}</span> <span className="font-mono text-xs opacity-50">({evt.phone})</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-bold uppercase tracking-wider text-xs">{evt.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-xs">Mahindra South Kalamassery</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold relative z-10">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                    <Calendar className="w-4 h-4 text-mahindra-red" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                    <Clock className="w-4 h-4 text-mahindra-red" />
                    <span>{evt.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
