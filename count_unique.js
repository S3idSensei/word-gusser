const fs = require('fs');
const s = fs.readFileSync('app.js','utf8');
const m = s.match(/const\s+ARABIC_WORDS\s*=\s*\[([\s\S]*?)\];/);
if (!m) {
  console.log(JSON.stringify({ error: 'ARABIC_WORDS not found' }));
  process.exit(0);
}
const arr = m[1].match(/"[^"\n]*"/g) || [];
const words = arr.map(x => x.slice(1, -1));
const unique = Array.from(new Set(words));
console.log(JSON.stringify({ total: words.length, unique: unique.length }));


