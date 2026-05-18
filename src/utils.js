export function computeProgress(goal) {
  const { uom, target, actual } = goal;
  if (actual == null) return 0;
  if (uom === 'Min')      return Math.min((Number(actual) / Number(target)) * 100, 150);
  if (uom === 'Max')      return Number(actual) === 0 ? 150 : Math.min((Number(target) / Number(actual)) * 100, 150);
  if (uom === 'Zero')     return Number(actual) === 0 ? 100 : 0;
  if (uom === 'Timeline') {
    const td = new Date(target), ad = new Date(actual);
    return ad <= td ? 100 : 70;
  }
  return 0;
}

export function progressColor(pct) {
  if (pct >= 90) return 'var(--green)';
  if (pct >= 60) return 'var(--amber)';
  return 'var(--red)';
}

export function nowStr() {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', hour12: false,
  }).replace(',', '').slice(0, 16);
}

export function exportToCSV(goals) {
  const header = ['Employee','Goal','Thrust','UoM','Target','Unit','Actual','Weightage','Status','Check-in'];
  const rows = goals.map(g => [
    g.emp, g.title, g.thrust, g.uom, g.target, g.unit,
    g.actual ?? '', g.weightage + '%', g.status, g.checkStatus,
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'SeTrack_Goals_Report.csv';
  a.click();
}
