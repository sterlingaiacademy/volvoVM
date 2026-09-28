const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/outbound/page.tsx', 'utf8');

// Header UI updates
content = content.replace(
  /<header className="mb-10">/g, 
  '<header className="mb-10 flex flex-col items-start relative z-10 animate-fade-up">'
);
content = content.replace(
  /<h1 className="text-3xl font-bold uppercase tracking-tight mb-2 text-gray-900 dark:text-white">Outbound Campaign<\/h1>/g,
  '<h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Outbound Campaign</h1>'
);
content = content.replace(/integrated SIP Trunk/g, 'Voice AI Engine');

// Overall UI styling upgrades
content = content.replace(/max-w-6xl/g, 'max-w-[1400px] bg-[#F8F9FA] dark:bg-[#0a0a0a]');
content = content.replace(/rounded-sm/g, 'rounded-3xl hover:shadow-xl transition-all duration-500');
content = content.replace(/p-6/g, 'p-8');

// Native Integration block text changes (removes tech stack)
content = content.replace(/Native API Integration/g, 'Native Integration');
content = content.replace(/using the LiveKit SDK\. It will create rooms/g, 'Engine. It will create secure connections');
content = content.replace(/AI agents/g, 'Voice Agents');

fs.writeFileSync('src/app/dashboard/outbound/page.tsx', content);

// Also do LogsTableClient.tsx
let logs = fs.readFileSync('src/components/LogsTableClient.tsx', 'utf8');
logs = logs.replace(/max-w-6xl/g, 'max-w-[1400px] bg-[#F8F9FA] dark:bg-[#0a0a0a]');
logs = logs.replace(/rounded-sm/g, 'rounded-3xl hover:shadow-xl transition-all duration-500');
logs = logs.replace(/<header className="mb-10 flex justify-between items-end">/g, '<header className="mb-12 flex justify-between items-end animate-fade-up">');
logs = logs.replace(/text-3xl font-bold uppercase tracking-tight mb-2 text-gray-900 dark:text-white/g, 'text-4xl font-extrabold uppercase tracking-tighter mb-2 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400');
logs = logs.replace(/<tr key={index} className="hover:bg-gray-50 dark:hover:bg-white\/5 transition-colors group">/g, '<tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-300 group hover:-translate-y-1 hover:shadow-lg relative z-0 hover:z-10 bg-white dark:bg-[#111]">');
fs.writeFileSync('src/components/LogsTableClient.tsx', logs);

// Also do TranscriptsListClient.tsx
let tx = fs.readFileSync('src/components/TranscriptsListClient.tsx', 'utf8');
tx = tx.replace(/directly from ElevenLabs/g, 'directly from the Voice AI Engine');
tx = tx.replace(/rounded-sm/g, 'rounded-3xl transition-all duration-500');
tx = tx.replace(/max-w-7xl/g, 'max-w-[1400px] bg-[#F8F9FA] dark:bg-[#0a0a0a] animate-fade-up');
fs.writeFileSync('src/components/TranscriptsListClient.tsx', tx);

console.log("Done.");
