const fs = require('fs');

let uiContent = fs.readFileSync('src/components/UpcomingEventsBoard.tsx', 'utf8');

const replacementLogic = `      let dateString = visitDay;
      const callDateStr = log["Call Date"];
      
      if (callDateStr && callDateStr !== "-") {
        try {
          const callDate = new Date(callDateStr);
          if (!isNaN(callDate.getTime())) {
            if (visitDay.toLowerCase() === "today") {
              dateString = callDate.toISOString().split("T")[0];
            } else if (visitDay.toLowerCase() === "tomorrow") {
              const tmrw = new Date(callDate);
              tmrw.setDate(tmrw.getDate() + 1);
              dateString = tmrw.toISOString().split("T")[0];
            }
          }
        } catch (e) {}
      } else {
        if (visitDay.toLowerCase() === "today") dateString = today;
        if (visitDay.toLowerCase() === "tomorrow") dateString = tomorrow;
      }`;

uiContent = uiContent.replace(
  /let dateString = visitDay;\s+if \(visitDay\.toLowerCase\(\) === "today"\) dateString = today;\s+if \(visitDay\.toLowerCase\(\) === "tomorrow"\) dateString = tomorrow;/g,
  replacementLogic
);

fs.writeFileSync('src/components/UpcomingEventsBoard.tsx', uiContent);

let plContent = fs.readFileSync('src/app/dashboard/pipeline/page.tsx', 'utf8');

const plReplacementLogic = `const visitDayRaw = log["Visit Day"]?.trim() || "";
    let visitDay = visitDayRaw;
    const callDateStr = log["Call Date"];
    if (callDateStr && callDateStr !== "-") {
      try {
        const callDate = new Date(callDateStr);
        if (!isNaN(callDate.getTime())) {
          if (visitDayRaw.toLowerCase() === "today") {
            visitDay = callDate.toISOString().split("T")[0];
            log["Visit Day"] = visitDay;
          } else if (visitDayRaw.toLowerCase() === "tomorrow") {
            const tmrw = new Date(callDate);
            tmrw.setDate(tmrw.getDate() + 1);
            visitDay = tmrw.toISOString().split("T")[0];
            log["Visit Day"] = visitDay;
          }
        }
      } catch(e) {}
    }`;

plContent = plContent.replace(
  /const visitDay = log\["Visit Day"\]\?\.trim\(\) \|\| "";/g,
  plReplacementLogic
);

fs.writeFileSync('src/app/dashboard/pipeline/page.tsx', plContent);
