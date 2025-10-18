const sanitizeCsvValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/"/g, '""');
};

const buildRowValue = (row, header) => {
  if (typeof header.getValue === "function") {
    return header.getValue(row);
  }
  if (header.key) {
    return row[header.key];
  }
  return "";
};

const buildCsvLine = (values) => values.map((value) => `"${sanitizeCsvValue(value)}"`).join(",");

export const exportToCSV = (rows, headers, filename = "reporte.csv", options = {}) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const now = new Date().toLocaleString("es-GT", {
    hour12: false,
  });

  const headerCount = headers.length;

  const metadataEntries = [
    ...(options.metadata ?? []),
    { label: "Generado el", value: now },
  ];

  const metadataLines = metadataEntries
    .filter((item) => item && (item.label || item.value))
    .map((item) => {
      const row = Array(headerCount).fill("");
      row[0] = item.label ?? "";
      row[1] = item.value ?? "";
      return buildCsvLine(row);
    });

  const headerLine = buildCsvLine(headers.map((header) => header.label));

  const dataLines = rows.map((row) =>
    buildCsvLine(
      headers.map((header) => {
        const rawValue = buildRowValue(row, header);
        return rawValue;
      }),
    ),
  );

  const blankLine = buildCsvLine(Array(headerCount).fill(""));

  const csvLines = [
    ...metadataLines,
    ...(metadataLines.length ? [blankLine] : []),
    headerLine,
    ...dataLines,
  ];

  const csvContent = `\ufeff${csvLines.join("\r\n")}`;
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

export const exportToPrintablePdf = (title, headers, rows, options = {}) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const printable = window.open("", "_blank");
  if (!printable) {
    alert("No se pudo abrir la ventana de impresion. Permite las ventanas emergentes.");
    return;
  }

  const now = new Date().toLocaleString("es-GT", {
    hour12: false,
  });

  const {
    subtitle = "",
    metadata = [],
    filters = {},
    summary = [],
    orientation = "portrait",
    footerNote = "Reporte generado por Humana",
  } = options;

  const filtersHtml = Object.entries(filters)
    .filter(([, value]) => value && value !== "Todos" && value !== "all")
    .map(
      ([label, value]) => `
        <span class="chip">
          <strong>${label}:</strong> ${value}
        </span>`,
    )
    .join("");

  const summaryHtml = summary
    .map(
      (item) => `
        <div class="summary-item">
          <p class="summary-label">${item.label}</p>
          <p class="summary-value">${item.value}</p>
        </div>`,
    )
    .join("");

  const metadataHtml = [...metadata, { label: "Generado el", value: now }]
    .map(
      (item) => `
        <div class="meta-item">
          <span class="meta-label">${item.label}</span>
          <span class="meta-value">${item.value}</span>
        </div>`,
    )
    .join("");

  const tableHead = headers
    .map(
      (header) =>
        `<th>${header.label}</th>`,
    )
    .join("");

  const tableBody = rows
    .map((row, rowIndex) => {
      const cells = headers
        .map((header) => {
          const rawValue = buildRowValue(row, header);
          const value = rawValue === null || rawValue === undefined ? "" : String(rawValue);
          return `<td>${value}</td>`;
        })
        .join("");
      return `<tr class="${rowIndex % 2 === 0 ? "even" : "odd"}">${cells}</tr>`;
    })
    .join("");

  printable.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          :root {
            color-scheme: light dark;
          }
          body {
            font-family: "Inter", "Segoe UI", Arial, sans-serif;
            padding: 32px;
            color: #0f172a;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          }
          @media print {
            body {
              padding: 24px;
              background: #ffffff;
            }
            .page {
              box-shadow: none;
            }
          }
          .page {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          header {
            padding: 32px;
            background: linear-gradient(135deg, #0f172a 0%, #134e4a 100%);
            color: #f8fafc;
          }
          header h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 0.04em;
          }
          header p {
            margin: 8px 0 0;
            font-size: 14px;
            color: rgba(248, 250, 252, 0.85);
          }
          .content {
            padding: 32px;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          }
          .meta-item {
            padding: 12px 14px;
            border-radius: 16px;
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
          }
          .meta-label {
            display: block;
            font-size: 11px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #475569;
          }
          .meta-value {
            margin-top: 4px;
            font-weight: 600;
          }
          .chip-group {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 24px;
          }
          .chip {
            padding: 6px 14px;
            border-radius: 999px;
            background: rgba(14, 165, 233, 0.1);
            border: 1px solid rgba(14, 165, 233, 0.2);
            font-size: 12px;
            color: #0369a1;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          }
          .summary-item {
            padding: 18px;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            background: linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(14, 165, 233, 0.12));
          }
          .summary-label {
            margin: 0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #0f172a;
          }
          .summary-value {
            margin: 4px 0 0;
            font-size: 22px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border-radius: 18px;
            border: 1px solid #e2e8f0;
          }
          th {
            background: linear-gradient(135deg, #0f172a, #134e4a);
            color: #f8fafc;
            padding: 14px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          td {
            padding: 12px 14px;
            font-size: 13px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr.even td {
            background-color: #f8fafc;
          }
          footer {
            margin-top: 32px;
            padding-bottom: 24px;
            font-size: 11px;
            text-align: center;
            color: #64748b;
          }
        </style>
      </head>
      <body class="${orientation === "landscape" ? "landscape" : ""}">
        <div class="page">
          <header>
            <h1>${title}</h1>
            ${subtitle ? `<p>${subtitle}</p>` : ""}
          </header>
          <div class="content">
            <div class="meta">
              ${metadataHtml}
            </div>
            ${filtersHtml ? `<div class="chip-group">${filtersHtml}</div>` : ""}
            ${summaryHtml ? `<div class="summary">${summaryHtml}</div>` : ""}
            <table>
              <thead>
                <tr>${tableHead}</tr>
              </thead>
              <tbody>
                ${tableBody}
              </tbody>
            </table>
          </div>
          <footer>${footerNote}</footer>
        </div>
      </body>
    </html>
  `);

  printable.document.close();
  printable.focus();
  printable.print();
};
