const buildRowValue = (row, header) => {
  if (typeof header.getValue === "function") {
    return header.getValue(row);
  }
  if (header.key) {
    return row[header.key];
  }
  return "";
};

export const exportToCSV = (rows, headers, filename = "reporte.csv") => {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const headerString = headers.map((header) => `"${header.label}"`).join(",");
  const bodyString = rows
    .map((row) =>
      headers
        .map((header) => {
          const rawValue = buildRowValue(row, header);
          const value = rawValue === null || rawValue === undefined ? "" : String(rawValue);
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\n");

  const csvContent = `${headerString}\n${bodyString}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPrintablePdf = (title, headers, rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const printable = window.open("", "_blank");
  if (!printable) {
    alert("No se pudo abrir la ventana de impresion. Permite las ventanas emergentes.");
    return;
  }

  const tableHead = headers
    .map((header) => `<th style="padding:8px;border:1px solid #cbd5f5;background:#0f172a;color:#f8fafc;">${header.label}</th>`)
    .join("");

  const tableBody = rows
    .map((row) => {
      const cells = headers
        .map((header) => {
          const rawValue = buildRowValue(row, header);
          const value = rawValue === null || rawValue === undefined ? "" : String(rawValue);
          return `<td style="padding:8px;border:1px solid #cbd5f5;">${value}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  printable.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { text-align: center; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          tr:nth-child(even) { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>${tableHead}</tr>
          </thead>
          <tbody>
            ${tableBody}
          </tbody>
        </table>
      </body>
    </html>
  `);

  printable.document.close();
  printable.focus();
  printable.print();
};

