const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/UpcomingEventsBoard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldCode = `      if (callDateStr && callDateStr !== "-") {
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
      } else {`;

const newCode = `      if (callDateStr && callDateStr !== "-") {
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
              // Try to parse natural date strings like "Wednesday, 7 October"
              let vDate = new Date(visitDay);
              if (!isNaN(vDate.getTime())) {
                if (vDate.getFullYear() === 2001 || vDate.getFullYear() < 2020) {
                  vDate = new Date(\`\${visitDay} \${callDate.getFullYear()}\`);
                }
                if (!isNaN(vDate.getTime())) {
                  dateString = vDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                }
              } else {
                // If direct parse fails, try appending the year explicitly
                let vDateWithYear = new Date(\`\${visitDay} \${callDate.getFullYear()}\`);
                if (!isNaN(vDateWithYear.getTime())) {
                   dateString = vDateWithYear.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                }
              }
            }
          }
        } catch (e) {}
      } else {`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(filePath, content);
console.log("Updated UpcomingEventsBoard.tsx");
