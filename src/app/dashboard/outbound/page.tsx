"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  PhoneOutgoing, Loader2, CheckCircle2, AlertCircle, FileUp,
  Play, Download, X, RefreshCw, PhoneOff, Clock, RotateCcw
} from "lucide-react";
import Papa from "papaparse";

type ContactStatus = {
  phone: string;
  name: string;
  vehicle: string;
  status: "queued" | "calling" | "done" | "failed" | "skipped";
  error?: string;
};

type CampaignStatus = {
  status: "idle" | "running" | "done";
  startedAt?: string;
  finishedAt?: string;
  total: number;
  current: number;
  contacts: ContactStatus[];
};

const STATUS_BADGE: Record<ContactStatus["status"], { label: string; className: string; icon: React.ReactNode }> = {
  queued:  { label: "Queued",  className: "bg-gray-100 dark:bg-white/5 text-gray-500", icon: <Clock className="w-3 h-3" /> },
  calling: { label: "Calling…", className: "bg-blue-500/10 text-blue-500 animate-pulse", icon: <PhoneOutgoing className="w-3 h-3" /> },
  done:    { label: "Done",    className: "bg-green-500/10 text-green-500", icon: <CheckCircle2 className="w-3 h-3" /> },
  failed:  { label: "Failed",  className: "bg-red-500/10 text-mahindra-red", icon: <PhoneOff className="w-3 h-3" /> },
  skipped: { label: "Skipped", className: "bg-yellow-500/10 text-yellow-500", icon: <AlertCircle className="w-3 h-3" /> },
};

export default function OutboundTriggerPage() {
  // ── Single call state ──
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [context, setContext] = useState("");
  const [singleStatus, setSingleStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [singleMessage, setSingleMessage] = useState("");

  // ── Bulk state ──
  const [bulkList, setBulkList] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<CampaignStatus | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Poll campaign status ──
  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/outbound/status");
      if (!res.ok) return;
      const data: CampaignStatus = await res.json();
      setCampaign(data);
      if (data.status === "done" || data.status === "idle") {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      }
    } catch (_) {}
  }, []);

  // On mount: check if a campaign is already running (e.g., page reload mid-campaign)
  useEffect(() => {
    pollStatus();
  }, [pollStatus]);

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(pollStatus, 3000);
  }, [pollStatus]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // ── Single call trigger ──
  const triggerCall = async (phoneNumber: string, contextData: any = {}) => {
    try {
      const res = await fetch("/api/outbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber.trim(), conversation_variables: contextData }),
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || "Failed to trigger call" };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const handleSingleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setSingleStatus("loading");
    setSingleMessage("");
    const result = await triggerCall(phone, { customer_name: customerName, vehicle: vehicleName, context, phone: phone.trim() });
    if (result.success) {
      setSingleStatus("success");
      setSingleMessage(`Outbound call triggered to ${phone}.`);
      setPhone(""); setCustomerName(""); setVehicleName(""); setContext("");
      setTimeout(() => setSingleStatus("idle"), 5000);
    } else {
      setSingleStatus("error");
      setSingleMessage(result.error || "Unknown error");
    }
  };

  // ── CSV upload ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => { setBulkList(results.data as any[]); },
    });
    // Reset file input so same file can be re-uploaded
    e.target.value = "";
  };

  // ── Start campaign ──
  const startCampaign = async (contacts: any[]) => {
    setIsStarting(true);
    try {
      const res = await fetch("/api/outbound/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to start campaign");
        setIsStarting(false);
        return;
      }
      setBulkList([]);
      await pollStatus();
      startPolling();
    } catch (e: any) {
      alert(e.message || "Network error");
    }
    setIsStarting(false);
  };

  // ── Retry failed contacts ──
  const retryFailed = () => {
    if (!campaign) return;
    const failedContacts = campaign.contacts
      .filter(c => c.status === "failed")
      .map(c => ({ phone: c.phone, customer_name: c.name, vehicle: c.vehicle }));
    if (failedContacts.length === 0) return;
    startCampaign(failedContacts);
  };

  // ── Download template ──
  const downloadTemplate = () => {
    const template = "phone,customer_name,vehicle,context\n+919876543210,Rahul Menon,XUV700,Service Reminder for 10 AM tomorrow\n+918765432109,Priya Nair,Scorpio,Follow up on test drive enquiry\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", ""); a.setAttribute("href", url); a.setAttribute("download", "campaign_template.csv");
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const failedCount  = campaign?.contacts.filter(c => c.status === "failed").length ?? 0;
  const doneCount    = campaign?.contacts.filter(c => c.status === "done").length ?? 0;
  const progressPct  = campaign && campaign.total > 0 ? Math.round(((doneCount + failedCount) / campaign.total) * 100) : 0;
  const showCampaign = campaign && (campaign.status === "running" || campaign.status === "done") && campaign.total > 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-10 flex flex-col items-start relative z-10">
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
          Outbound Campaign
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Trigger manual or bulk AI outbound calls via your Voice AI Engine.</p>
      </header>

      {/* ── Campaign Progress Panel ── */}
      {showCampaign && (
        <div className="mb-8 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                {campaign.status === "running" ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-mahindra-red" /> Campaign Running</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 text-green-500" /> Campaign Complete</>
                )}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {campaign.status === "running"
                  ? `Calling contact ${(campaign.current ?? 0) + 1} of ${campaign.total}. Waiting for each call to finish before dialing next.`
                  : `${doneCount} completed · ${failedCount} failed · ${campaign.contacts.filter(c => c.status === "skipped").length} skipped`
                }
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {campaign.status === "done" && failedCount > 0 && (
                <button
                  onClick={retryFailed}
                  disabled={isStarting}
                  className="flex items-center gap-2 px-4 py-2 bg-mahindra-red text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#cc0000] transition-colors disabled:opacity-50 shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry {failedCount} Failed
                </button>
              )}
              {campaign.status === "done" && (
                <button
                  onClick={() => { setCampaign(null); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  New Campaign
                </button>
              )}
              {campaign.status === "running" && (
                <button onClick={pollStatus} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-mahindra-red rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Contact list */}
          <div className="max-h-80 overflow-y-auto p-3">
            <ul className="space-y-2">
              {campaign.contacts.map((contact, i) => {
                const badge = STATUS_BADGE[contact.status];
                const isCurrent = campaign.status === "running" && i === campaign.current;
                return (
                  <li
                    key={`${contact.phone}-${i}`}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                      isCurrent
                        ? "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/5"
                        : "border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-black text-gray-300 dark:text-gray-600 w-5 text-right shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {contact.name !== "Unknown" ? contact.name : contact.phone}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{contact.phone}{contact.vehicle ? ` · ${contact.vehicle}` : ""}</p>
                        {contact.error && (
                          <p className="text-[10px] text-mahindra-red mt-0.5">{contact.error}</p>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.className}`}>
                      {badge.icon} {badge.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {campaign.finishedAt && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5 text-[10px] text-gray-400 text-right">
              Finished at {new Date(campaign.finishedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}
            </div>
          )}
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

        {/* Single Call Trigger */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-gray-100 dark:border-white/5 text-gray-900 dark:text-white">
            Single Call Trigger
          </h2>

          <form onSubmit={handleSingleTrigger} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Customer Phone Number</label>
              <input
                type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors font-mono dark:text-white text-gray-900"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Customer Name</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Rahul Menon"
                  className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors dark:text-white text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Vehicle Model</label>
                <input type="text" value={vehicleName} onChange={e => setVehicleName(e.target.value)} placeholder="e.g. XUV700"
                  className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors dark:text-white text-gray-900" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Call Context (Optional)</label>
              <textarea rows={4} value={context} onChange={e => setContext(e.target.value)}
                placeholder="E.g., Remind the customer about their scheduled XUV700 test drive tomorrow at 10 AM."
                className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-mahindra-red transition-colors resize-none dark:text-white text-gray-900"
              />
            </div>
            <button type="submit" disabled={singleStatus === "loading"}
              className="w-full py-4 bg-mahindra-red text-white font-bold uppercase tracking-wider text-sm hover:bg-mahindra-red-dark transition-colors skew-x-[-10deg] flex justify-center items-center gap-2 disabled:opacity-50">
              <span className="skew-x-[10deg] flex items-center gap-2">
                {singleStatus === "loading" ? <><Loader2 className="w-5 h-5 animate-spin" /> Initiating...</> : <><PhoneOutgoing className="w-5 h-5" /> Trigger AI Call</>}
              </span>
            </button>
            {singleStatus === "success" && (
              <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" /><p>{singleMessage}</p>
              </div>
            )}
            {singleStatus === "error" && (
              <div className="p-4 bg-red-50 dark:bg-mahindra-red/10 border border-red-200 dark:border-mahindra-red/20 text-red-700 dark:text-mahindra-red text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" /><p>{singleMessage}</p>
              </div>
            )}
          </form>
        </div>

        {/* Bulk Campaign Upload */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-gray-100 dark:border-white/5 text-gray-900 dark:text-white flex items-center justify-between">
              <span>Bulk Campaign</span>
              {bulkList.length > 0 && (
                <span className="text-xs bg-mahindra-red text-white px-2 py-1 rounded-full">{bulkList.length} Rows loaded</span>
              )}
            </h2>

            {bulkList.length === 0 ? (
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-white/10 p-8 text-center hover:border-mahindra-red dark:hover:border-mahindra-red/50 transition-colors cursor-pointer group rounded-3xl bg-gray-50 dark:bg-transparent">
                <div className="w-12 h-12 bg-gray-200 dark:bg-white/5 mx-auto mb-4 flex items-center justify-center rounded-full group-hover:bg-mahindra-red/10 transition-colors">
                  <FileUp className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-mahindra-red" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Click to upload CSV list</p>
                <p className="text-xs text-gray-500">Columns: phone, customer_name, vehicle, context</p>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50 dark:bg-[#050505] flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{bulkList.length} Contacts Ready</h3>
                  <button onClick={() => setBulkList([])} className="text-xs font-bold uppercase text-gray-500 hover:text-mahindra-red transition-colors">
                    Clear All
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto p-2">
                  <ul className="space-y-2">
                    {bulkList.map((row, index) => {
                      const p = row.phone || row.Phone || row.PHONE || row.phone_number || row.Phone_Number || "No phone";
                      const n = row.customer_name || row.name || row.Name || "Unknown";
                      return (
                        <li key={index} className="flex items-center justify-between p-3 bg-white dark:bg-black border border-gray-200 dark:border-white/5 rounded-2xl">
                          <div className="flex flex-col text-left overflow-hidden pr-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{n !== "Unknown" ? n : p}</span>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 font-mono">
                              <span>{p}</span>
                              {(row.vehicle || row.vehicle_name) && (
                                <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10 text-[10px]">🚗 {row.vehicle || row.vehicle_name}</span>
                              )}
                            </div>
                          </div>
                          <button onClick={() => setBulkList(prev => prev.filter((_, i) => i !== index))}
                            className="p-2 text-gray-400 hover:text-mahindra-red hover:bg-mahindra-red/10 rounded-2xl transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-white/10">
                  <button onClick={() => startCampaign(bulkList)} disabled={isStarting || campaign?.status === "running"}
                    className="w-full py-3 bg-mahindra-red text-white font-bold uppercase tracking-wider text-xs hover:bg-[#cc0000] transition-colors flex justify-center items-center gap-2 shadow-md rounded-3xl disabled:opacity-50">
                    {isStarting ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</> : <><Play className="w-4 h-4 fill-current" /> Start Sequential Campaign</>}
                  </button>
                  {campaign?.status === "running" && (
                    <p className="text-center text-xs text-gray-400 mt-2">A campaign is already running — wait for it to finish.</p>
                  )}
                </div>
              </div>
            )}

            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

            <button onClick={downloadTemplate}
              className="w-full py-3 mt-4 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-xs border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors rounded-3xl flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download Template
            </button>
          </div>

          <div className="bg-mahindra-red/5 border border-mahindra-red/20 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mahindra-red/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            <h3 className="text-xs font-black uppercase tracking-widest text-mahindra-red flex items-center gap-2 mb-3 relative z-10">
              <AlertCircle className="w-4 h-4" /> Sequential Dialing
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium relative z-10">
              Bulk campaigns now call <strong>one contact at a time</strong>. The system waits for each call to fully complete before dialing the next — respecting your 2-channel limit. Failed calls appear in red with a <strong>Retry Failed</strong> button at the end.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
