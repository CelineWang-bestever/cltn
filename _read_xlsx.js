const XLSX = require('xlsx');
const path = require('path');
const file = 'c:/Users/celine.wang/Documents/trae_projects/cltn/开单收银模块优化需求清单.xlsx';
const wb = XLSX.readFile(file);

console.log('Sheets:', wb.SheetNames);

wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  console.log(`\n=== Sheet: ${name} ===`);
  console.log(`Rows: ${data.length}, Cols: ${data[0] ? data[0].length : 0}`);
  console.log('Headers:', data[0]);
  console.log('---');
  data.slice(0, 60).forEach((row, i) => {
    if (row.some(c => c !== '')) {
      console.log(`[${i}]`, JSON.stringify(row));
    }
  });
});
