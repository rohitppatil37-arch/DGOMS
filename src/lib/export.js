function csvCell(v) {
  let s = v == null ? '' : String(v);
  // Neutralize formula-injection triggers (OWASP CSV Injection): a cell
  // starting with one of these is executed as a formula by Excel/LibreOffice.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// Excel opens CSV natively — avoids pulling in a parser library just to write files.
export function exportCSV(columns, rows, filename) {
  const lines = [columns.join(',')];
  for (const row of rows) lines.push(row.map(csvCell).join(','));
  downloadBlob(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), filename);
}

export async function exportPDF(title, columns, rows, filename) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(13);
  doc.text(title, 14, 12);
  autoTable(doc, { startY: 18, head: [columns], body: rows, styles: { fontSize: 8 }, headStyles: { fillColor: [11, 26, 53] } });
  doc.save(filename);
}
