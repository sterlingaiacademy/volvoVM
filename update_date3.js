const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/UpcomingEventsBoard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /if \(callDateStr && callDateStr !== "-"\) \{[\s\S]*?\} else \{/;

const newCode = `if (callDateStr && callDateStr !== "-") {
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
              const cleanVisitDay = visitDay.replace(/^[A-Za-z]+,\\s*/, "").trim();
              
              let vDate = new Date(cleanVisitDay);
              if (!isNaN(vDate.getTime())) {
                if (vDate.getFullYear() === 2001 || vDate.getFullYear() < 2020) {
                  vDate = new Date(\`\${cleanVisitDay} \${callDate.getFullYear()}\`);
                }
                if (!isNaN(vDate.getTime())) {
                  dateString = vDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                }
              } else {
                let vDateWithYear = new Date(\`\${cleanVisitDay} \${callDate.getFullYear()}\`);
                if (!isNaN(vDateWithYear.getTime())) {
                   dateString = vDateWithYear.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                }
              }
            }
          }
        } catch (e) {}
      } else {`;

if(regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync(filePath, content);
    console.log("Successfully replaced with normalized date parsing!");
} else {
    console.log("Regex did not match!");
}
