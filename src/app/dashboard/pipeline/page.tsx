import Papa from "papaparse";
import { Clock, CheckCircle2, AlertCircle, Phone, Calendar } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function PipelinePage() {
  let logs: any[] = [];
  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/1EuYUHCElFWq6AgsA-FWFGfnRCxQTOdKG_73725C0fXg/export?format=csv";
    const res = await fetch(csvUrl, { cache: "no-store" });
    if (res.ok) {
      const csvText = await res.text();
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      logs = parsed.data;
    }
  } catch (e) {
    console.error(e);
  }

  // Group leads into stages
  const discoveryPending: any[] = [];
  const hotLeads: any[] = [];
  const scheduled: any[] = [];
  const serviceBooked: any[] = [];

  logs.forEach(rawLog => {
    // Spread to avoid mutating the original parsed CSV object
    const log = { ...rawLog };
    const vehicle = log["Vehicle Model"]?.trim() || "";
    const visitDayRaw = log["Visit Day"]?.trim() || "";
    let visitDay = visitDayRaw;
    const callDateStr = log["Call Date"];
    if (callDateStr && callDateStr !== "-") {
      try {
        const callDate = new Date(callDateStr);
        if (!isNaN(callDate.getTime())) {
          if (visitDayRaw.toLowerCase() === "today") {
            visitDay = callDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
            log["Visit Day"] = visitDay;
          } else if (visitDayRaw.toLowerCase() === "tomorrow") {
            const tmrw = new Date(callDate);
            tmrw.setDate(tmrw.getDate() + 1);
            visitDay = tmrw.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
            log["Visit Day"] = visitDay;
          }
        }
      } catch(e) {}
    }
    const serviceType = log["Service Type"]?.trim() || "";
    const enquiry = (log["Enquiry Type"] || "").toLowerCase();

    if (serviceType && serviceType !== "-") {
      serviceBooked.push(log);
    } else if (visitDay && visitDay !== "-") {
      scheduled.push(log);
    } else if (vehicle && vehicle !== "-" && enquiry.includes("sales")) {
      hotLeads.push(log);
    } else {
      discoveryPending.push(log);
    }
  });

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-[#F8F9FA] dark:bg-black">
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 flex-shrink-0 animate-fade-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter mb-2 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
            Sales Pipeline
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">AI-generated pipeline based on conversational outcomes.</p>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-mahindra-red uppercase tracking-widest hover:text-mahindra-red-dark transition-colors bg-mahindra-red/10 px-4 py-2.5 sm:py-2 rounded-full hover:scale-105 transform duration-300 w-full sm:w-auto text-center">
          &larr; Back to Dashboard
        </Link>
      </header>

      <div className="flex-1 overflow-x-auto pb-8">
        <div className="flex gap-6 h-full min-w-[1300px] px-2">
          <PipelineColumn title="Discovery Pending" count={discoveryPending.length} color="gray" items={discoveryPending} delay="0" />
          <PipelineColumn title="Hot Leads (Sales)" count={hotLeads.length} color="orange" items={hotLeads} delay="100" />
          <PipelineColumn title="Demo Scheduled" count={scheduled.length} color="green" items={scheduled} delay="200" />
          <PipelineColumn title="Service Booked" count={serviceBooked.length} color="blue" items={serviceBooked} delay="300" />
        </div>
      </div>
    </div>
  );
}

function PipelineColumn({ title, count, color, items, delay }: { title: string, count: number, color: string, items: any[], delay: string }) {
  const colorMap: any = {
    gray: "from-gray-500/20 to-transparent border-t-gray-500",
    orange: "from-orange-500/20 to-transparent border-t-orange-500",
    green: "from-green-500/20 to-transparent border-t-green-500",
    blue: "from-blue-500/20 to-transparent border-t-blue-500",
  };

  return (
    <div 
      className={`flex-1 flex flex-col bg-white dark:bg-[#050505] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden border-t-[6px] ${colorMap[color].split(" ")[2]} animate-fade-up hover:shadow-2xl transition-all duration-500 group/col relative`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${colorMap[color].split(" ")[0]} opacity-10 pointer-events-none`} />
      
      <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center relative z-10 backdrop-blur-md">
        <h3 className="font-extrabold text-sm uppercase tracking-widest text-gray-800 dark:text-gray-100">{title}</h3>
        <span className="bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-black shadow-sm group-hover/col:scale-110 transition-transform duration-300">{count}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {items.map((item, i) => (
          <PipelineCard key={i} item={item} i={i} />
        ))}
        {items.length === 0 && (
          <div className="text-center p-8 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl animate-pulse">
            Empty Stage
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineCard({ item, i }: { item: any, i: number }) {
  return (
    <div 
      className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-mahindra-red/50 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group cursor-grab active:cursor-grabbing animate-fade-up relative overflow-hidden"
      style={{ animationDelay: `${(i * 50)}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="font-extrabold text-gray-900 dark:text-white capitalize text-sm">{item["Customer Name"] || "Unknown"}</div>
        <span className="text-[9px] font-bold text-gray-400 bg-white dark:bg-black/50 px-2 py-0.5 rounded-full">{item["Call Date"]?.split(" ")[0] || ""}</span>
      </div>
      <div className="text-xs font-mono text-gray-500 mb-4 bg-white dark:bg-black/50 inline-block px-2 py-1 rounded-md shadow-sm relative z-10">
        {item["Phone Number"]}
      </div>
      
      {(item["Vehicle Model"] && item["Vehicle Model"] !== "-") && (
        <div className="mb-4 relative z-10">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">Vehicle Focus</span>
          <span className="text-[10px] font-extrabold text-mahindra-red bg-mahindra-red/10 px-2.5 py-1 rounded-md uppercase tracking-wider">{item["Vehicle Model"]}</span>
        </div>
      )}

      {item["Visit Day"] && item["Visit Day"] !== "-" && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-bold relative z-10 group-hover:text-green-500 transition-colors">
          <Calendar className="w-4 h-4 animate-bounce" />
          {item["Visit Day"]} {item["Visit Time"] && `at ${item["Visit Time"]}`}
        </div>
      )}
    </div>
  );
}
