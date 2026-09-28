const fs = require("fs");
let code = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");

const targetRegex = /<div className="flex-1 md:flex-none justify-center flex items-center gap-3 bg-white dark:bg-white\/5 px-4 py-3 md:py-2.5 rounded-full border border-gray-200 dark:border-white\/10 shadow-sm backdrop-blur-md">[\s\S]*?Live Sync<\/span>\s*<\/div>/g;

code = code.replace(targetRegex, "<RefreshButton />");
code = code.replace("import Link from \"next/link\";", "import Link from \"next/link\";\nimport { RefreshButton } from \"@/components/RefreshButton\";");

fs.writeFileSync("src/app/dashboard/page.tsx", code, "utf8");
