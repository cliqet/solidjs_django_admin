export const useTable = () => {
  const printTable = (tableId: string, tableName: string, removeFirstCol: boolean = true): void => {
    // Create a new window
    const printWindow = window.open('', '_blank');
  
    if (printWindow) {
      // Get the table element
      const table = document.getElementById(tableId) as HTMLTableElement;
  
      if (table) {
        // Clone the table
        const clonedTable = table.cloneNode(true) as HTMLTableElement;
  
        // Remove the first column if removeFirstCol is true
        if (removeFirstCol) {
          const rows = clonedTable.rows;
          for (let i = 0; i < rows.length; i++) {
            rows[i].deleteCell(0); // Remove the first cell (checkbox)
          }
        }
  
        // Create a new document for printing
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Table</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                  word-wrap: break-word; /* Ensures text wraps */
                }
                th {
                  background-color: #f2f2f2;
                }
                @media print {
                  @page {
                    size: landscape; /* Optional: change to landscape if needed */
                  }
                }
              </style>
            </head>
            <body>
              <h2>${tableName}</h2>
              ${clonedTable.outerHTML} <!-- Insert the modified table HTML -->
            </body>
          </html>
        `);
  
        // Close the document to ensure everything is loaded
        printWindow.document.close();
  
        // Wait for the content to load, then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close(); // Close the print window after printing
        };
      } else {
        console.error('Table not found');
      }
    } else {
      console.error('Failed to open print window');
    }
  };
  
  const exportTableToCSV = (tableId: string, tableName: string, removeFirstCol: boolean = true): void => {
    // Get the table element
    const table = document.getElementById(tableId) as HTMLTableElement;
  
    if (table) {
      let csvContent = "";
  
      // Helper function to escape and format cell values
      const formatCellValue = (value: string) => {
        if (value.includes('"')) {
          value = value.replace(/"/g, '""'); // Escape double quotes
        }
        return `"${value}"`; // Enclose in double quotes
      };
  
      // Get the header row
      const headers = Array.from(table.querySelectorAll("thead th"));
      const headerRow = headers
        .map((header, index) => (removeFirstCol && index === 0) ? "" : formatCellValue(header.textContent?.trim() || ""))
        .filter(header => header) // Filter out any empty headers
        .join(",") + "\n";
      csvContent += headerRow;
  
      // Get the data rows
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td"));
        const rowData = cells
          .map((cell, index) => {
            // Check for boolean class names
            const isTrue = cell.querySelector('.boolean-true');
            const isFalse = cell.querySelector('.boolean-false');
  
            if (isTrue) {
              return formatCellValue("True");
            } else if (isFalse) {
              return formatCellValue("False");
            }
  
            // Fallback to text content
            const cellText = cell.innerText || cell.textContent || "";
            return (removeFirstCol && index === 0) ? "" : formatCellValue(cellText.trim());
          })
          .filter(cell => cell) // Filter out any empty cells
          .join(",");
        csvContent += rowData + "\n";
      });
  
      // Create a blob and a link to download the CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `${tableName}.csv`);
  
      // Append link to body
      document.body.appendChild(link);
      link.click(); // Trigger the download
      document.body.removeChild(link); // Remove the link after downloading
    } else {
      console.error('Table not found');
    }
  };

  return {
    printTable,
    exportTableToCSV,
  }
}

