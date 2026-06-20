export const exportService = {
  exportToCSV(filename: string, columns: string[], data: Record<string, any>[]) {
    const csvContent = [
      columns.join(','),
      ...data.map((row) =>
        columns
          .map((col) => {
            const val = row[col] === null || row[col] === undefined ? '' : row[col];
            // Escape double quotes and wrap in quotes if contains commas/quotes
            const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
            if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
              return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToExcel(filename: string, columns: string[], data: Record<string, any>[]) {
    // Generate simple HTML table which Excel can open directly
    const tableHeader = `<tr>${columns.map((col) => `<th style="background:#0F766E;color:#fff;padding:8px;border:1px solid #ddd;">${col}</th>`).join('')}</tr>`;
    const tableRows = data
      .map(
        (row) =>
          `<tr>${columns
            .map((col) => {
              const val = row[col] === null || row[col] === undefined ? '' : row[col];
              return `<td style="padding:8px;border:1px solid #ddd;">${typeof val === 'object' ? JSON.stringify(val) : val}</td>`;
            })
            .join('')}</tr>`
      )
      .join('');

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorkbook></xml><![endif]--></head>
      <body><table>${tableHeader}${tableRows}</table></body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToPDF(filename: string, columns: string[], data: Record<string, any>[]) {
    // Elegant client-side PDF export using standard window.print() or formatted text output
    // For general inline download, we can generate a structured text report with grid layout,
    // or direct print styles. Let's output a clean ASCII text layout that looks like a database report.
    let report = `AI QUERY RESULTS REPORT\n`;
    report += `Report Name: ${filename}\n`;
    report += `Exported At: ${new Date().toLocaleString()}\n`;
    report += `Total Rows: ${data.length}\n`;
    report += `========================================================================\n\n`;

    // Add headers
    const colWidth = 20;
    const headerRow = columns
      .map((col) => col.substring(0, colWidth).padEnd(colWidth))
      .join(' | ');
    report += `${headerRow}\n`;
    report += `${'-'.repeat(headerRow.length)}\n`;

    // Add rows
    data.forEach((row) => {
      const rowString = columns
        .map((col) => {
          const val = row[col] === null || row[col] === undefined ? '' : String(row[col]);
          return val.substring(0, colWidth).padEnd(colWidth);
        })
        .join(' | ');
      report += `${rowString}\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
