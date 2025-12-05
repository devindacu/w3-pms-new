export interface ExportData {
  title: string
  subtitle?: string
  date: string
  headers: string[]
  rows: (string | number)[][]
  summary?: { label: string; value: string | number }[]
  chartData?: {
    type: 'bar' | 'line' | 'pie' | 'area'
    data: any[]
    config?: {
      xAxis?: string
      yAxis?: string[]
      colors?: string[]
    }
  }[]
}

export function exportToCSV(data: ExportData): void {
  let csv = `"${data.title}"\n`
  
  if (data.subtitle) {
    csv += `"${data.subtitle}"\n`
  }
  
  csv += `"Generated: ${data.date}"\n\n`

  if (data.summary && data.summary.length > 0) {
    csv += '"Summary"\n'
    data.summary.forEach(item => {
      csv += `"${item.label}","${item.value}"\n`
    })
    csv += '\n'
  }

  csv += data.headers.map(h => `"${h}"`).join(',') + '\n'
  
  data.rows.forEach(row => {
    csv += row.map(cell => {
      const cellStr = String(cell)
      return `"${cellStr.replace(/"/g, '""')}"`
    }).join(',') + '\n'
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${data.title.replace(/\s+/g, '_')}_${Date.now()}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportToPDF(data: ExportData, includeCharts: boolean = false): Promise<void> {
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    throw new Error('Unable to open print window. Please allow popups.')
  }

  const chartHTML = includeCharts && data.chartData 
    ? generateChartHTML(data.chartData)
    : ''

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${data.title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            padding: 40px;
            color: #1a1a1a;
            background: white;
          }
          
          .header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2a5934;
          }
          
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #2a5934;
            margin-bottom: 8px;
          }
          
          .subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 8px;
          }
          
          .date {
            font-size: 12px;
            color: #999;
          }
          
          .summary {
            margin: 20px 0;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 8px;
          }
          
          .summary-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2a5934;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .summary-item {
            padding: 10px;
            background: white;
            border-radius: 4px;
            border-left: 4px solid #2a5934;
          }
          
          .summary-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .summary-value {
            font-size: 18px;
            font-weight: bold;
            color: #1a1a1a;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
          }
          
          thead {
            background: #2a5934;
            color: white;
          }
          
          th {
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #ddd;
          }
          
          td {
            padding: 10px 8px;
            border: 1px solid #ddd;
          }
          
          tbody tr:nth-child(even) {
            background: #f9f9f9;
          }
          
          tbody tr:hover {
            background: #f0f0f0;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          }
          
          .badge-success {
            background: #d4edda;
            color: #155724;
          }
          
          .badge-warning {
            background: #fff3cd;
            color: #856404;
          }
          
          .badge-danger {
            background: #f8d7da;
            color: #721c24;
          }
          
          .badge-info {
            background: #d1ecf1;
            color: #0c5460;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e5e5;
            text-align: center;
            font-size: 11px;
            color: #999;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            
            .no-print {
              display: none;
            }
            
            table {
              page-break-inside: auto;
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            thead {
              display: table-header-group;
            }
            
            tfoot {
              display: table-footer-group;
            }
          }
          
          .chart-container {
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          
          .chart-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2a5934;
          }
          
          .chart-placeholder {
            background: white;
            border: 2px dashed #ddd;
            border-radius: 4px;
            padding: 40px;
            text-align: center;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${data.title}</div>
          ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
          <div class="date">Generated: ${data.date}</div>
        </div>
        
        ${data.summary && data.summary.length > 0 ? `
          <div class="summary">
            <div class="summary-title">Summary</div>
            <div class="summary-grid">
              ${data.summary.map(item => `
                <div class="summary-item">
                  <div class="summary-label">${item.label}</div>
                  <div class="summary-value">${item.value}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${chartHTML}
        
        <table>
          <thead>
            <tr>
              ${data.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>W3 Hotel PMS - Analytics Report</p>
          <p>© ${new Date().getFullYear()} Design & Developed by W3 Media PVT LTD</p>
        </div>
        
        <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
          <button onclick="window.print()" style="
            padding: 12px 24px;
            background: #2a5934;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            Print / Save as PDF
          </button>
          <button onclick="window.close()" style="
            padding: 12px 24px;
            background: #666;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            margin-left: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            Close
          </button>
        </div>
      </body>
    </html>
  `
  
  printWindow.document.write(html)
  printWindow.document.close()
}

function generateChartHTML(charts: ExportData['chartData']): string {
  if (!charts) return ''
  
  return charts.map((chart, index) => `
    <div class="chart-container">
      <div class="chart-title">Chart ${index + 1}: ${chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart</div>
      <div class="chart-placeholder">
        Chart visualization (${chart.data.length} data points)
        <br><small>Charts are best viewed in the application interface</small>
      </div>
    </div>
  `).join('')
}

export function exportToExcel(data: ExportData): void {
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
  html += '<head><meta charset="utf-8"><style>table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #2a5934; color: white; font-weight: bold; }</style></head>'
  html += '<body>'
  
  html += `<h1>${data.title}</h1>`
  if (data.subtitle) {
    html += `<h3>${data.subtitle}</h3>`
  }
  html += `<p>Generated: ${data.date}</p><br>`

  if (data.summary && data.summary.length > 0) {
    html += '<h3>Summary</h3>'
    html += '<table><tbody>'
    data.summary.forEach(item => {
      html += `<tr><td><strong>${item.label}</strong></td><td>${item.value}</td></tr>`
    })
    html += '</tbody></table><br>'
  }

  html += '<table>'
  html += '<thead><tr>'
  data.headers.forEach(header => {
    html += `<th>${header}</th>`
  })
  html += '</tr></thead><tbody>'
  
  data.rows.forEach(row => {
    html += '<tr>'
    row.forEach(cell => {
      html += `<td>${cell}</td>`
    })
    html += '</tr>'
  })
  
  html += '</tbody></table></body></html>'

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${data.title.replace(/\s+/g, '_')}_${Date.now()}.xls`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function formatValueForExport(value: any): string | number {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  if (typeof value === 'number') {
    return value
  }
  
  if (value instanceof Date) {
    return value.toLocaleDateString()
  }
  
  return String(value)
}

export function prepareTableDataForExport(
  headers: string[],
  rows: any[][],
  title: string,
  subtitle?: string,
  summary?: { label: string; value: string | number }[]
): ExportData {
  return {
    title,
    subtitle,
    date: new Date().toLocaleString(),
    headers,
    rows: rows.map(row => row.map(formatValueForExport)),
    summary
  }
}

export function exportInvoicesToCSV(invoices: any[]): void {
  const data = prepareTableDataForExport(
    ['Invoice #', 'Date', 'Supplier', 'Amount', 'Status'],
    invoices.map(inv => [
      inv.invoiceNumber || inv.id,
      formatValueForExport(inv.date || inv.invoiceDate),
      inv.supplier || inv.supplierName || 'N/A',
      inv.amount || inv.totalAmount || 0,
      inv.status || 'Pending'
    ]),
    'Invoices Report'
  )
  exportToCSV(data)
}

export function exportPaymentsToCSV(payments: any[]): void {
  const data = prepareTableDataForExport(
    ['Payment #', 'Date', 'Amount', 'Method', 'Reference'],
    payments.map(pmt => [
      pmt.paymentNumber || pmt.id,
      formatValueForExport(pmt.date || pmt.paymentDate),
      pmt.amount,
      pmt.method || pmt.paymentMethod || 'N/A',
      pmt.reference || 'N/A'
    ]),
    'Payments Report'
  )
  exportToCSV(data)
}

export function exportExpensesToCSV(expenses: any[]): void {
  const data = prepareTableDataForExport(
    ['Expense #', 'Date', 'Category', 'Amount', 'Description'],
    expenses.map(exp => [
      exp.expenseNumber || exp.id,
      formatValueForExport(exp.date || exp.expenseDate),
      exp.category,
      exp.amount,
      exp.description || 'N/A'
    ]),
    'Expenses Report'
  )
  exportToCSV(data)
}

export function exportJournalEntriesToCSV(entries: any[]): void {
  const data = prepareTableDataForExport(
    ['Entry #', 'Date', 'Account', 'Debit', 'Credit', 'Description'],
    entries.map(entry => [
      entry.entryNumber || entry.id,
      formatValueForExport(entry.date || entry.entryDate),
      entry.account || entry.accountName || 'N/A',
      entry.debit || 0,
      entry.credit || 0,
      entry.description || 'N/A'
    ]),
    'Journal Entries Report'
  )
  exportToCSV(data)
}

export function exportBudgetsToCSV(budgets: any[]): void {
  const data = prepareTableDataForExport(
    ['Budget', 'Period', 'Allocated', 'Spent', 'Remaining'],
    budgets.map(budget => [
      budget.name || budget.category,
      budget.period || 'N/A',
      budget.allocated || budget.budgetAllocated || 0,
      budget.spent || budget.actualSpent || 0,
      budget.remaining || 0
    ]),
    'Budgets Report'
  )
  exportToCSV(data)
}

export function exportTrialBalanceToCSV(data: any[]): void {
  const exportData = prepareTableDataForExport(
    ['Account', 'Debit', 'Credit'],
    data.map(item => [
      item.account || item.accountName,
      item.debit || 0,
      item.credit || 0
    ]),
    'Trial Balance Report'
  )
  exportToCSV(exportData)
}

export function exportProfitLossToCSV(data: any): void {
  const rows: any[][] = []
  
  if (data.revenue) {
    rows.push(['Revenue', '', data.revenue])
  }
  if (data.expenses) {
    rows.push(['Expenses', '', data.expenses])
  }
  if (data.netProfit !== undefined) {
    rows.push(['Net Profit/Loss', '', data.netProfit])
  }
  
  const exportData = prepareTableDataForExport(
    ['Category', 'Details', 'Amount'],
    rows,
    'Profit & Loss Statement'
  )
  exportToCSV(exportData)
}

export function exportBalanceSheetToCSV(data: any): void {
  const rows: any[][] = []
  
  if (data.assets) {
    rows.push(['Assets', '', data.assets])
  }
  if (data.liabilities) {
    rows.push(['Liabilities', '', data.liabilities])
  }
  if (data.equity) {
    rows.push(['Equity', '', data.equity])
  }
  
  const exportData = prepareTableDataForExport(
    ['Category', 'Details', 'Amount'],
    rows,
    'Balance Sheet'
  )
  exportToCSV(exportData)
}
