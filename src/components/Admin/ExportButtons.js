import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Generic export toolbar for an admin data table.
// columns: [{ key, label }]  - key looks up row[key], label is the header text
// rows:    plain array of objects (already filtered/sorted as shown on screen)
// filename: base filename, no extension (e.g. "currently-online")
//
// Requires two packages this project doesn't have yet:
//   npm install xlsx jspdf jspdf-autotable
export default function ExportButtons({ columns, rows, filename }) {
  const [copied, setCopied] = useState(false);

  const asPlainRows = () =>
    rows.map((row) =>
      Object.fromEntries(columns.map((c) => [c.label, row[c.key] ?? ""]))
    );

  const handleCopy = async () => {
    const header = columns.map((c) => c.label).join("\t");
    const lines = rows.map((row) => columns.map((c) => row[c.key] ?? "").join("\t"));
    const text = [header, ...lines].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail (older browser, no HTTPS) - fail quietly,
      // Excel/PDF export still work as a fallback.
    }
  };

  const handleExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(asPlainRows());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handlePdf = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [columns.map((c) => c.label)],
      body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [31, 41, 55] }, // matches --navbar-bg
    });
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="d-flex gap-2 mb-3">
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCopy}>
        <i className="fas fa-copy me-1" />{copied ? "Copied!" : "Copy"}
      </button>
      <button type="button" className="btn btn-sm btn-outline-success" onClick={handleExcel}>
        <i className="fas fa-file-excel me-1" />Excel
      </button>
      <button type="button" className="btn btn-sm btn-outline-danger" onClick={handlePdf}>
        <i className="fas fa-file-pdf me-1" />PDF
      </button>
    </div>
  );
}
