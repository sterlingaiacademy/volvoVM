const fs = require('fs');
let logs = fs.readFileSync('src/components/LogsTableClient.tsx', 'utf8');
logs = logs.replace(/text-3xl font-bold uppercase tracking-tight mb-2/g, 'text-4xl font-extrabold uppercase tracking-tighter mb-2 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400');
logs = logs.replace(/<div className="bg-white dark:bg-mahindra-black rounded-sm border border-gray-200 dark:border-white\/10 shadow-sm overflow-hidden/g, '<div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden animate-fade-up style={{ animationDelay: \'200ms\' }}');
logs = logs.replace(/rounded-sm/g, 'rounded-2xl transition-all duration-300');
fs.writeFileSync('src/components/LogsTableClient.tsx', logs);
console.log("Done Logs");
