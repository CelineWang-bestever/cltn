const XLSX = require('xlsx');
const wb = XLSX.readFile('c:/Users/celine.wang/Documents/trae_projects/cltn/开单收银模块优化需求清单.xlsx');
const ws = wb.Sheets['需求池管理'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
const items = [];

function excelSerialToDate(serial) {
  if (typeof serial !== 'number') return '';
  const d = new Date((serial - 25569) * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  const name = (row[0] || '').trim();
  if (!name) continue;
  items.push({
    name,
    desc: (row[1] || '').trim(),
    priority: (row[2] || '').trim(),
    cost: (row[3] || '').trim(),
    apps: (row[4] || '').trim(),
    status: (row[5] || '').trim(),
    upgrade: (row[6] || '').trim(),
    url: (row[7] || '').trim(),
    files: (row[8] || '').trim(),
    version: (row[9] || '').trim(),
    features: (row[10] || '').trim(),
    requester: (row[11] || '').trim(),
    created: excelSerialToDate(row[12]),
    target: excelSerialToDate(row[13]),
    remark: (row[14] || '').trim(),
  });
}

// Dedup
const seen = new Set();
const deduped = items.filter(it => {
  const key = it.name.slice(0, 40);
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// Group by priority
const p0 = deduped.filter(it => it.priority === 'P0');
const p1 = deduped.filter(it => it.priority === 'P1');
const p2 = deduped.filter(it => it.priority === 'P2');
const p3 = deduped.filter(it => it.priority === 'P3');
const other = deduped.filter(it => !['P0','P1','P2','P3'].includes(it.priority));

// Group by status
function countByStatus(arr) {
  const m = {};
  arr.forEach(it => { m[it.status] = (m[it.status]||0)+1; });
  return m;
}

console.log('=== SUMMARY ===');
console.log(`Total raw: ${items.length}, Deduped: ${deduped.length}`);
console.log(`P0: ${p0.length}, P1: ${p1.length}, P2: ${p2.length}, P3: ${p3.length}, Other: ${other.length}`);
console.log('\n=== P0 Status ===');
console.log(JSON.stringify(countByStatus(p0), null, 2));
console.log('\n=== P1 Status ===');
console.log(JSON.stringify(countByStatus(p1), null, 2));
console.log('\n=== P3 Status ===');
console.log(JSON.stringify(countByStatus(p3), null, 2));

// Detailed list
console.log('\n=== ALL ITEMS ===');
deduped.forEach((it, idx) => {
  console.log(`\n[${it.priority}] ${it.name}`);
  console.log(`  描述: ${it.desc.slice(0,120)}`);
  console.log(`  涉及: ${it.apps} | 状态: ${it.status} | 需求方: ${it.requester}`);
  if (it.upgrade) console.log(`  升级内容: ${it.upgrade.slice(0,200)}`);
});
