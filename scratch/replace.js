const fs = require('fs');
let content = fs.readFileSync('src/data/roles.ts', 'utf-8');
content = content.replace(/style="color: #60A5FA; font-weight: bold;"/g, 'className="highlight-good"');
content = content.replace(/style="color: #F87171; font-weight: bold;"/g, 'className="highlight-evil"');
fs.writeFileSync('src/data/roles.ts', content, 'utf-8');
