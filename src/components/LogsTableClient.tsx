"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Download, Filter, ExternalLink, PhoneIncoming, PhoneOutgoing, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogsTableClient({ initialLogs, error }: { initialLogs: any[], error: string | null }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 60 seconds, paused when tab is not visible
  useEffect(() => {
    const tick = () => {
      if (!document.hidden) router.refresh();
    };
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterType, setFilterType] = useState<"all" | "inbound" | "outbound">("all");

  const filteredLogs = useMemo(() => {
    let result = [...initialLogs];

    if (filterType !== "all") {
      result = result.filter(log => {
        const direction = (log["Direction"] || log["Type"] || log["Call Type"] || "Inbound").toLowerCase();
        return direction.includes(filterType);
      });
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(log => 
        (log["Customer Name"] || "").toLowerCase().includes(q) ||
        (log["Phone Number"] || "").toLowerCase().includes(q) ||
        (log["Vehicle Model"] || "").toLowerCase().includes(q) ||
        (log["Enquiry Type"] || "").toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a["Call Date"] || 0).getTime();
      const dateB = new Date(b["Call Date"] || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [initialLogs, searchQuery, sortOrder, filterType]);

  const handleExport = () => {
    if (filteredLogs.length === 0) return;
    
    // Get unique headers from the objects
    const allKeys = new Set<string>();
    filteredLogs.forEach(log => Object.keys(log).forEach(key => allKeys.add(key)));
    const headers = Array.from(allKeys);
    
    const csvRows = [];
    csvRows.push(headers.join(",")); // Header row
    
    for (const log of filteredLogs) {
      const values = headers.map(header => {
        const val = log[header] === undefined || log[header] === null ? '' : String(log[header]);
        // Escape quotes and wrap in quotes to handle commas
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }
    
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'mahindra_call_logs_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-2">Call Logs</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Live data synced from Google Sheets CRM.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <a 
            href="https://docs.google.com/spreadsheets/d/1EuYUHCElFWq6AgsA-FWFGfnRCxQTOdKG_73725C0fXg/edit" 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-3 md:py-2 bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/10 text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" /> Open Sheet
          </a>
          <button 
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-3 md:py-2 bg-mahindra-red text-white hover:bg-mahindra-red-dark disabled:opacity-50 transition-colors border border-transparent text-sm font-bold uppercase tracking-widest"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={handleManualRefresh}
            className="flex-1 sm:flex-none justify-center flex items-center gap-3 bg-white dark:bg-white/5 px-4 py-3 md:py-2 rounded-full border border-gray-200 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
              Live Sync
              <RefreshCw className={`w-3 h-3 text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors ${isRefreshing ? "animate-spin text-black dark:text-white" : ""}`} />
            </span>
          </button>
        </div>
      </header>

      {error ? (
        <div className="mb-8 p-4 border-l-4 border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
          <strong className="font-bold">Error Loading Data:</strong> {error}
        </div>
      ) : initialLogs.length === 0 ? (
        <div className="mb-8 p-4 border-l-4 border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm">
          <strong className="font-bold">Info:</strong> Connection successful, but the Google Sheet is currently empty. Waiting for AI calls...
        </div>
      ) : (
        <div className="mb-8 p-4 border-l-4 border-green-500 bg-green-500/10 text-green-700 dark:text-green-300 text-sm flex items-center justify-between">
          <span><strong className="font-bold">Live:</strong> Successfully syncing {initialLogs.length} records from Google Sheets.</span>
        </div>
      )}

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-sm overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex flex-col md:flex-row gap-4 bg-gray-50 dark:bg-white/5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by name, phone, vehicle, or enquiry..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-mahindra-red transition-colors rounded-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full sm:w-auto bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 py-3 md:py-2.5 px-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors rounded-sm"
            >
              <option value="all">All Types</option>
              <option value="inbound">Inbound Only</option>
              <option value="outbound">Outbound Only</option>
            </select>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full sm:w-auto bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 py-3 md:py-2.5 px-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors rounded-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Date</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Direction</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Customer Details</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Vehicle</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Enquiry</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Service/Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredLogs.map((log, index) => {
                  let displayDate = log["Call Date"] || "-";
                  if (displayDate !== "-") {
                    try {
                      const d = new Date(displayDate);
                      if (!isNaN(d.getTime())) {
                        displayDate = d.toLocaleString('en-IN', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        });
                      }
                    } catch (e) {}
                  }
              
                  let enquiry = log["Enquiry Type"] || "-";
                  if (enquiry !== "-") enquiry = enquiry.charAt(0).toUpperCase() + enquiry.slice(1).toLowerCase();

                  let direction = log["Direction"] || log["Type"] || log["Call Type"] || "Inbound";
                  const isOutbound = direction.toLowerCase().includes("outbound");

                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {displayDate}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${isOutbound ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                          {isOutbound ? <PhoneOutgoing className="w-3 h-3" /> : <PhoneIncoming className="w-3 h-3" />}
                          {direction}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="font-medium text-gray-900 dark:text-white capitalize">{log["Customer Name"] || "Unknown"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 bg-gray-100 dark:bg-white/5 inline-block px-2 py-0.5 rounded-sm border border-gray-200 dark:border-white/10">
                          📞 {log["Phone Number"] || "-"}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                        {log["Vehicle Model"] || "-"}
                      </td>
                      <td className="p-4 text-sm">
                        <span className="inline-block px-2 py-1 text-xs rounded-sm bg-mahindra-red/10 text-mahindra-red font-semibold">
                          {enquiry}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {log["Service Type"] && log["Service Type"].trim() !== "" ? (
                          <div className="capitalize font-medium text-gray-900 dark:text-white">{log["Service Type"]}</div>
                        ) : (
                          <div className="text-gray-400 dark:text-gray-500 text-xs italic">N/A</div>
                        )}
                        {(log["Visit Day"] || log["Visit Time"]) && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-80" />
                            <span className="capitalize">{log["Visit Day"]}</span> {log["Visit Time"] && `at ${log["Visit Time"]}`}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              {filteredLogs.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-white/10 text-xs text-gray-500 text-center uppercase tracking-widest bg-gray-50 dark:bg-white/5">
          {filteredLogs.length > 0 ? `Showing ${filteredLogs.length} of ${initialLogs.length} records` : 'End of Results'}
        </div>
      </div>
    </div>
  );
}
