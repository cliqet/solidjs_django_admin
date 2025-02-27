export const printTable = (tableId: string, tableName: string, removeFirstCol: boolean = true): void => {
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
