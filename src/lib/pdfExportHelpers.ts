import { formatCurrency, formatDate, formatDateTime } from './helpers'
import type { 
  Invoice, 
  Payment, 
  Expense, 
  JournalEntry, 
  Budget,
  GLEntry 
} from './types'

interface PDFConfig {
  title: string
  subtitle?: string
  pageSize?: 'A4' | 'Letter'
  orientation?: 'portrait' | 'landscape'
}

function generatePDFHeader(config: PDFConfig): string {
  const now = new Date()
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${config.title}</title>
      <style>
        @page {
          size: ${config.pageSize || 'A4'} ${config.orientation || 'portrait'};
          margin: 20mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #1a1a1a;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 3px solid #2c5f2d;
        }
        
        .header h1 {
          font-size: 24pt;
          color: #2c5f2d;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .header .subtitle {
          font-size: 11pt;
          color: #555;
          margin-bottom: 6px;
        }
        
        .header .meta {
          font-size: 9pt;
          color: #777;
          margin-top: 8px;
        }
        
        .summary-section {
          margin: 25px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
          border-left: 4px solid #2c5f2d;
        }
        
        .summary-section h2 {
          font-size: 14pt;
          color: #2c5f2d;
          margin-bottom: 12px;
          font-weight: 600;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .summary-item {
          display: flex;
          flex-direction: column;
        }
        
        .summary-item .label {
          font-size: 9pt;
          color: #666;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .summary-item .value {
          font-size: 16pt;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 9pt;
        }
        
        thead {
          background: #2c5f2d;
          color: white;
        }
        
        thead th {
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 9pt;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        tbody tr {
          border-bottom: 1px solid #e0e0e0;
        }
        
        tbody tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        tbody tr:hover {
          background: #f0f0f0;
        }
        
        tbody td {
          padding: 8px;
          vertical-align: top;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 8pt;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
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
        
        .badge-secondary {
          background: #e2e3e5;
          color: #383d41;
        }
        
        .total-row {
          font-weight: 600;
          background: #f0f0f0 !important;
          border-top: 2px solid #2c5f2d;
        }
        
        .subtotal-row {
          font-weight: 600;
          background: #f8f9fa !important;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 2px solid #e0e0e0;
          text-align: center;
          font-size: 8pt;
          color: #777;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        .no-data {
          text-align: center;
          padding: 40px;
          color: #999;
          font-style: italic;
        }
        
        .section-title {
          font-size: 14pt;
          color: #2c5f2d;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #2c5f2d;
          font-weight: 600;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${config.title}</h1>
        ${config.subtitle ? `<div class="subtitle">${config.subtitle}</div>` : ''}
        <div class="meta">
          Generated on ${formatDateTime(now.getTime())}
        </div>
      </div>
  `
}

function generatePDFFooter(): string {
  return `
      <div class="footer">
        <p>W3 Hotel PMS - Finance & Accounting Module</p>
        <p>© ${new Date().getFullYear()} W3 Media PVT LTD</p>
      </div>
    </body>
    </html>
  `
}

function openPDFInNewWindow(htmlContent: string, filename: string) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Unable to open print window. Please allow popups for this site.')
  }
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  printWindow.onload = () => {
    printWindow.document.title = filename
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

export function exportInvoicesToPDF(invoices: Invoice[], dateRange?: string) {
  const subtitle = dateRange ? `Report Period: ${dateRange}` : `Total Records: ${invoices.length}`
  
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0)
  const totalBalance = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0)
  
  const tableRows = invoices.map(inv => `
    <tr>
      <td>${inv.invoiceNumber}</td>
      <td>${inv.supplierName || '-'}</td>
      <td>${formatDate(inv.invoiceDate)}</td>
      <td>${formatDate(inv.dueDate)}</td>
      <td class="text-right">${formatCurrency(inv.total)}</td>
      <td class="text-right">${formatCurrency(inv.amountPaid || 0)}</td>
      <td class="text-right">${formatCurrency(inv.balance || 0)}</td>
      <td class="text-center">${getStatusBadge(inv.status)}</td>
    </tr>
  `).join('')
  
  const htmlContent = generatePDFHeader({
    title: 'Invoices Report',
    subtitle,
    orientation: 'landscape'
  }) + `
    <div class="summary-section">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Total Invoices</span>
          <span class="value">${invoices.length}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Amount</span>
          <span class="value">${formatCurrency(totalAmount)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Paid</span>
          <span class="value">${formatCurrency(totalPaid)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Balance</span>
          <span class="value">${formatCurrency(totalBalance)}</span>
        </div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Invoice #</th>
          <th>Supplier</th>
          <th>Invoice Date</th>
          <th>Due Date</th>
          <th class="text-right">Total</th>
          <th class="text-right">Paid</th>
          <th class="text-right">Balance</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="4"><strong>TOTAL</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalAmount)}</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalPaid)}</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalBalance)}</strong></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  ` + generatePDFFooter()
  
  openPDFInNewWindow(htmlContent, `Invoices_Report_${Date.now()}.pdf`)
}

export function exportPaymentsToPDF(payments: Payment[], dateRange?: string) {
  const subtitle = dateRange ? `Report Period: ${dateRange}` : `Total Records: ${payments.length}`
  
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const byMethod = payments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + p.amount
    return acc
  }, {} as Record<string, number>)
  
  const tableRows = payments.map(payment => `
    <tr>
      <td>${payment.paymentNumber}</td>
      <td>${formatDateTime(payment.processedAt)}</td>
      <td class="text-right">${formatCurrency(payment.amount)}</td>
      <td>${payment.method}</td>
      <td>${payment.reference || '-'}</td>
      <td class="text-center">${getPaymentStatusBadge(payment.status)}</td>
      <td class="text-center">${payment.reconciled ? '✓' : '-'}</td>
    </tr>
  `).join('')
  
  const htmlContent = generatePDFHeader({
    title: 'Payments Report',
    subtitle,
    orientation: 'landscape'
  }) + `
    <div class="summary-section">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Total Payments</span>
          <span class="value">${payments.length}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Amount</span>
          <span class="value">${formatCurrency(totalAmount)}</span>
        </div>
        ${Object.entries(byMethod).map(([method, amount]) => `
          <div class="summary-item">
            <span class="label">${method}</span>
            <span class="value">${formatCurrency(amount)}</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Payment #</th>
          <th>Date</th>
          <th class="text-right">Amount</th>
          <th>Method</th>
          <th>Reference</th>
          <th class="text-center">Status</th>
          <th class="text-center">Reconciled</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="2"><strong>TOTAL</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalAmount)}</strong></td>
          <td colspan="4"></td>
        </tr>
      </tbody>
    </table>
  ` + generatePDFFooter()
  
  openPDFInNewWindow(htmlContent, `Payments_Report_${Date.now()}.pdf`)
}

export function exportExpensesToPDF(expenses: Expense[], dateRange?: string) {
  const subtitle = dateRange ? `Report Period: ${dateRange}` : `Total Records: ${expenses.length}`
  
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)
  const byDepartment = expenses.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)
  
  const tableRows = expenses.map(expense => `
    <tr>
      <td>${expense.expenseNumber}</td>
      <td>${formatDate(expense.expenseDate)}</td>
      <td>${expense.category}</td>
      <td>${expense.department}</td>
      <td>${expense.description}</td>
      <td class="text-right">${formatCurrency(expense.amount)}</td>
      <td class="text-center">${getExpenseStatusBadge(expense.status)}</td>
    </tr>
  `).join('')
  
  const htmlContent = generatePDFHeader({
    title: 'Expenses Report',
    subtitle,
    orientation: 'landscape'
  }) + `
    <div class="summary-section">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Total Expenses</span>
          <span class="value">${expenses.length}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Amount</span>
          <span class="value">${formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
    
    <h3 class="section-title">By Category</h3>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Amount</th>
          <th class="text-right">% of Total</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(byCategory).map(([category, amount]) => `
          <tr>
            <td>${category}</td>
            <td class="text-right">${formatCurrency(amount)}</td>
            <td class="text-right">${((amount / totalAmount) * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h3 class="section-title">By Department</h3>
    <table>
      <thead>
        <tr>
          <th>Department</th>
          <th class="text-right">Amount</th>
          <th class="text-right">% of Total</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(byDepartment).map(([department, amount]) => `
          <tr>
            <td>${department}</td>
            <td class="text-right">${formatCurrency(amount)}</td>
            <td class="text-right">${((amount / totalAmount) * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h3 class="section-title">Detailed Expenses</h3>
    <table>
      <thead>
        <tr>
          <th>Expense #</th>
          <th>Date</th>
          <th>Category</th>
          <th>Department</th>
          <th>Description</th>
          <th class="text-right">Amount</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="5"><strong>TOTAL</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalAmount)}</strong></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  ` + generatePDFFooter()
  
  openPDFInNewWindow(htmlContent, `Expenses_Report_${Date.now()}.pdf`)
}

export function exportJournalEntriesToPDF(entries: JournalEntry[], dateRange?: string) {
  const subtitle = dateRange ? `Report Period: ${dateRange}` : `Total Records: ${entries.length}`
  
  const totalDebits = entries.reduce((sum, e) => 
    sum + e.lines.reduce((s, l) => s + l.debit, 0), 0
  )
  const totalCredits = entries.reduce((sum, e) => 
    sum + e.lines.reduce((s, l) => s + l.credit, 0), 0
  )
  
  const tableRows = entries.map(entry => {
    const entryDebits = entry.lines.reduce((s, l) => s + l.debit, 0)
    const entryCredits = entry.lines.reduce((s, l) => s + l.credit, 0)
    
    return `
      <tr>
        <td><strong>${entry.journalNumber}</strong></td>
        <td>${formatDate(entry.transactionDate)}</td>
        <td>${entry.journalType}</td>
        <td>${entry.description}</td>
        <td class="text-right">${formatCurrency(entryDebits)}</td>
        <td class="text-right">${formatCurrency(entryCredits)}</td>
        <td class="text-center">${getJournalStatusBadge(entry.status)}</td>
      </tr>
      ${entry.lines.map(line => `
        <tr style="font-size: 8pt; color: #666;">
          <td style="padding-left: 20px;">→ ${line.accountCode}</td>
          <td colspan="2">${line.accountName}</td>
          <td>${line.description || '-'}</td>
          <td class="text-right">${line.debit > 0 ? formatCurrency(line.debit) : '-'}</td>
          <td class="text-right">${line.credit > 0 ? formatCurrency(line.credit) : '-'}</td>
          <td></td>
        </tr>
      `).join('')}
    `
  }).join('')
  
  const htmlContent = generatePDFHeader({
    title: 'Journal Entries Report',
    subtitle,
    orientation: 'landscape'
  }) + `
    <div class="summary-section">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Total Entries</span>
          <span class="value">${entries.length}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Debits</span>
          <span class="value">${formatCurrency(totalDebits)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Credits</span>
          <span class="value">${formatCurrency(totalCredits)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Balance Check</span>
          <span class="value">${Math.abs(totalDebits - totalCredits) < 0.01 ? '✓ Balanced' : '✗ Unbalanced'}</span>
        </div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Journal #</th>
          <th>Date</th>
          <th>Type</th>
          <th>Description</th>
          <th class="text-right">Debit</th>
          <th class="text-right">Credit</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="4"><strong>TOTAL</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalDebits)}</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalCredits)}</strong></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  ` + generatePDFFooter()
  
  openPDFInNewWindow(htmlContent, `Journal_Entries_Report_${Date.now()}.pdf`)
}

export function exportBudgetsToPDF(budgets: Budget[]) {
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.totalBudget, 0)
  const totalActual = budgets.reduce((sum, b) => sum + b.totalActual, 0)
  const totalVariance = totalActual - totalBudgeted
  
  const tableRows = budgets.map(budget => {
    const variance = budget.variance
    const variancePercent = budget.totalBudget > 0 
      ? ((variance / budget.totalBudget) * 100).toFixed(1)
      : '0.0'
    
    return `
      <tr>
        <td>${budget.budgetName}</td>
        <td>${budget.department}</td>
        <td>${budget.period}</td>
        <td>${new Date(budget.startDate).toLocaleDateString()}</td>
        <td>${new Date(budget.endDate).toLocaleDateString()}</td>
        <td class="text-right">${formatCurrency(budget.totalBudget)}</td>
        <td class="text-right">${formatCurrency(budget.totalActual)}</td>
        <td class="text-right" style="color: ${variance >= 0 ? '#721c24' : '#155724'}">
          ${variance >= 0 ? '+' : ''}${formatCurrency(variance)}
        </td>
        <td class="text-right" style="color: ${variance >= 0 ? '#721c24' : '#155724'}">
          ${variance >= 0 ? '+' : ''}${variancePercent}%
        </td>
      </tr>
    `
  }).join('')
  
  const htmlContent = generatePDFHeader({
    title: 'Budget Analysis Report',
    subtitle: `Total Budgets: ${budgets.length}`,
    orientation: 'landscape'
  }) + `
    <div class="summary-section">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Total Budgeted</span>
          <span class="value">${formatCurrency(totalBudgeted)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Actual</span>
          <span class="value">${formatCurrency(totalActual)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Variance</span>
          <span class="value" style="color: ${totalVariance >= 0 ? '#721c24' : '#155724'}">
            ${totalVariance >= 0 ? '+' : ''}${formatCurrency(totalVariance)}
          </span>
        </div>
        <div class="summary-item">
          <span class="label">Variance %</span>
          <span class="value" style="color: ${totalVariance >= 0 ? '#721c24' : '#155724'}">
            ${totalVariance >= 0 ? '+' : ''}${totalBudgeted > 0 ? ((totalVariance / totalBudgeted) * 100).toFixed(1) : '0.0'}%
          </span>
        </div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Budget Name</th>
          <th>Department</th>
          <th>Period</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th class="text-right">Budgeted</th>
          <th class="text-right">Actual</th>
          <th class="text-right">Variance</th>
          <th class="text-right">Variance %</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="5"><strong>TOTAL</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalBudgeted)}</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalActual)}</strong></td>
          <td class="text-right" style="color: ${totalVariance >= 0 ? '#721c24' : '#155724'}">
            <strong>${totalVariance >= 0 ? '+' : ''}${formatCurrency(totalVariance)}</strong>
          </td>
          <td class="text-right" style="color: ${totalVariance >= 0 ? '#721c24' : '#155724'}">
            <strong>${totalVariance >= 0 ? '+' : ''}${totalBudgeted > 0 ? ((totalVariance / totalBudgeted) * 100).toFixed(1) : '0.0'}%</strong>
          </td>
        </tr>
      </tbody>
    </table>
  ` + generatePDFFooter()
  
  openPDFInNewWindow(htmlContent, `Budget_Analysis_Report_${Date.now()}.pdf`)
}

export function exportTrialBalanceToPDF(data: any[], dateRange?: string) {
  const subtitle = dateRange ? `Report Period: ${dateRange}` : ''
  
  const totalDebits = data.reduce((sum, item) => sum + (item.Debit || 0), 0)
  const totalCredits = data.reduce((sum, item) => sum + (item.Credit || 0), 0)
  
  const tableRows = data.map(item => `
    <tr>
      <td>${item['Account Code']}</td>
      <td>${item['Account Name']}</td>
      <td class="text-right">${item.Debit > 0 ? formatCurrency(item.Debit) : '-'}</td>
      <td class="text-right">${item.Credit > 0 ? formatCurrency(item.Credit) : '-'}</td>
    </tr>
  `).join('')
  
  const htmlContent = generatePDFHeader({
    title: 'Trial Balance',
    subtitle,
    orientation: 'portrait'
  }) + `
    <table>
      <thead>
        <tr>
          <th>Account Code</th>
          <th>Account Name</th>
          <th class="text-right">Debit</th>
          <th class="text-right">Credit</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="2"><strong>TOTAL</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalDebits)}</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalCredits)}</strong></td>
        </tr>
      </tbody>
    </table>
    
    <div class="summary-section" style="margin-top: 30px;">
      <h2>Balance Verification</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Total Debits</span>
          <span class="value">${formatCurrency(totalDebits)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Credits</span>
          <span class="value">${formatCurrency(totalCredits)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Difference</span>
          <span class="value">${formatCurrency(Math.abs(totalDebits - totalCredits))}</span>
        </div>
        <div class="summary-item">
          <span class="label">Status</span>
          <span class="value">${Math.abs(totalDebits - totalCredits) < 0.01 ? '✓ Balanced' : '✗ Out of Balance'}</span>
        </div>
      </div>
    </div>
  ` + generatePDFFooter()
  
  openPDFInNewWindow(htmlContent, `Trial_Balance_${Date.now()}.pdf`)
}

export function exportProfitLossToPDF(data: any[], dateRange?: string) {
  const subtitle = dateRange ? `Report Period: ${dateRange}` : ''
  
  const revenue = data.find(item => item.Category === 'Revenue')?.Amount || 0
  const expenses = data.find(item => item.Category === 'Expenses')?.Amount || 0
  const netIncome = data.find(item => item.Category === 'Net Income')?.Amount || 0
  
  const htmlContent = generatePDFHeader({
    title: 'Profit & Loss Statement',
    subtitle,
    orientation: 'portrait'
  }) + `
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Revenue</strong></td>
          <td class="text-right"><strong>${formatCurrency(revenue)}</strong></td>
        </tr>
        <tr>
          <td><strong>Expenses</strong></td>
          <td class="text-right"><strong>${formatCurrency(expenses)}</strong></td>
        </tr>
        <tr class="total-row">
          <td><strong>Net Income</strong></td>
          <td class="text-right" style="color: ${netIncome >= 0 ? '#155724' : '#721c24'}">
            <strong>${formatCurrency(netIncome)}</strong>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="summary-section" style="margin-top: 30px;">
      <h2>Financial Metrics</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Gross Profit Margin</span>
          <span class="value">${revenue > 0 ? ((netIncome / revenue) * 100).toFixed(1) : '0.0'}%</span>
        </div>
        <div class="summary-item">
          <span class="label">Expense Ratio</span>
          <span class="value">${revenue > 0 ? ((expenses / revenue) * 100).toFixed(1) : '0.0'}%</span>
        </div>
      </div>
    </div>
  ` + generatePDFFooter()
  
  openPDFInNewWindow(htmlContent, `Profit_Loss_Statement_${Date.now()}.pdf`)
}

export function exportBalanceSheetToPDF(data: any[]) {
  const assets = data.filter(item => item.Category === 'Assets')
  const liabilities = data.filter(item => item.Category === 'Liabilities')
  const equity = data.filter(item => item.Category === 'Equity')
  
  const totalAssets = assets.reduce((sum, item) => sum + item.Amount, 0)
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.Amount, 0)
  const totalEquity = equity.reduce((sum, item) => sum + item.Amount, 0)
  
  const htmlContent = generatePDFHeader({
    title: 'Balance Sheet',
    subtitle: `As of ${formatDate(Date.now())}`,
    orientation: 'portrait'
  }) + `
    <h3 class="section-title">Assets</h3>
    <table>
      <thead>
        <tr>
          <th>Account</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${assets.map(item => `
          <tr>
            <td>${item['Sub-Category']}</td>
            <td class="text-right">${formatCurrency(item.Amount)}</td>
          </tr>
        `).join('')}
        <tr class="subtotal-row">
          <td><strong>Total Assets</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalAssets)}</strong></td>
        </tr>
      </tbody>
    </table>
    
    <h3 class="section-title">Liabilities</h3>
    <table>
      <thead>
        <tr>
          <th>Account</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${liabilities.map(item => `
          <tr>
            <td>${item['Sub-Category']}</td>
            <td class="text-right">${formatCurrency(item.Amount)}</td>
          </tr>
        `).join('')}
        <tr class="subtotal-row">
          <td><strong>Total Liabilities</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalLiabilities)}</strong></td>
        </tr>
      </tbody>
    </table>
    
    <h3 class="section-title">Equity</h3>
    <table>
      <thead>
        <tr>
          <th>Account</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${equity.map(item => `
          <tr>
            <td>${item['Sub-Category']}</td>
            <td class="text-right">${formatCurrency(item.Amount)}</td>
          </tr>
        `).join('')}
        <tr class="subtotal-row">
          <td><strong>Total Equity</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalEquity)}</strong></td>
        </tr>
      </tbody>
    </table>
    
    <table style="margin-top: 30px;">
      <tbody>
        <tr class="total-row">
          <td><strong>Total Liabilities & Equity</strong></td>
          <td class="text-right"><strong>${formatCurrency(totalLiabilities + totalEquity)}</strong></td>
        </tr>
      </tbody>
    </table>
    
    <div class="summary-section" style="margin-top: 30px;">
      <h2>Balance Verification</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Total Assets</span>
          <span class="value">${formatCurrency(totalAssets)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Liabilities & Equity</span>
          <span class="value">${formatCurrency(totalLiabilities + totalEquity)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Difference</span>
          <span class="value">${formatCurrency(Math.abs(totalAssets - (totalLiabilities + totalEquity)))}</span>
        </div>
        <div class="summary-item">
          <span class="label">Status</span>
          <span class="value">${Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? '✓ Balanced' : '✗ Out of Balance'}</span>
        </div>
      </div>
    </div>
  ` + generatePDFFooter()
  
  openPDFInNewWindow(htmlContent, `Balance_Sheet_${Date.now()}.pdf`)
}

function getStatusBadge(status: string): string {
  const badgeClasses: Record<string, string> = {
    'pending-validation': 'badge badge-secondary',
    'validated': 'badge badge-info',
    'matched': 'badge badge-success',
    'mismatch': 'badge badge-danger',
    'approved': 'badge badge-success',
    'posted': 'badge badge-success',
    'rejected': 'badge badge-danger'
  }
  
  return `<span class="${badgeClasses[status] || 'badge badge-secondary'}">${status.replace(/-/g, ' ')}</span>`
}

function getPaymentStatusBadge(status: string): string {
  const badgeClasses: Record<string, string> = {
    'pending': 'badge badge-warning',
    'paid': 'badge badge-success',
    'partially-paid': 'badge badge-info',
    'refunded': 'badge badge-secondary'
  }
  
  return `<span class="${badgeClasses[status] || 'badge badge-secondary'}">${status.replace(/-/g, ' ')}</span>`
}

function getExpenseStatusBadge(status: string): string {
  const badgeClasses: Record<string, string> = {
    'draft': 'badge badge-secondary',
    'pending': 'badge badge-warning',
    'approved': 'badge badge-success',
    'rejected': 'badge badge-danger',
    'paid': 'badge badge-success'
  }
  
  return `<span class="${badgeClasses[status] || 'badge badge-secondary'}">${status}</span>`
}

function getJournalStatusBadge(status: string): string {
  const badgeClasses: Record<string, string> = {
    'draft': 'badge badge-secondary',
    'pending': 'badge badge-warning',
    'posted': 'badge badge-success',
    'reversed': 'badge badge-danger'
  }
  
  return `<span class="${badgeClasses[status] || 'badge badge-secondary'}">${status}</span>`
}
