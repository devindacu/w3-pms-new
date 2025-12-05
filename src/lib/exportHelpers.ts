import { formatCurrency, formatDate, formatDateTime } from './helpers'
import type { Invoice, Payment, Expense, JournalEntry, GLEntry, Budget } from './types'

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv')
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportInvoicesToCSV(invoices: Invoice[]) {
  const data = invoices.map(inv => ({
    'Invoice Number': inv.invoiceNumber,
    'Supplier': inv.supplierName || '',
    'Type': inv.type,
    'Status': inv.status,
    'Invoice Date': formatDate(inv.invoiceDate),
    'Due Date': formatDate(inv.dueDate),
    'Subtotal': inv.subtotal,
    'Tax': inv.tax,
    'Total': inv.total,
    'Amount Paid': inv.amountPaid,
    'Balance': inv.balance,
    'Payment Terms': inv.paymentTerms,
    'Created By': inv.createdBy,
    'Created At': formatDateTime(inv.createdAt)
  }))

  exportToCSV(data, `invoices-${Date.now()}.csv`)
}

export function exportPaymentsToCSV(payments: Payment[]) {
  const data = payments.map(payment => ({
    'Payment Number': payment.paymentNumber,
    'Amount': payment.amount,
    'Method': payment.method,
    'Status': payment.status,
    'Reference': payment.reference || '',
    'Processed At': formatDateTime(payment.processedAt),
    'Processed By': payment.processedBy,
    'Reconciled': payment.reconciled ? 'Yes' : 'No',
    'Notes': payment.notes || ''
  }))

  exportToCSV(data, `payments-${Date.now()}.csv`)
}

export function exportExpensesToCSV(expenses: Expense[]) {
  const data = expenses.map(expense => ({
    'Expense Number': expense.expenseNumber,
    'Category': expense.category,
    'Department': expense.department,
    'Amount': expense.amount,
    'Description': expense.description,
    'Expense Date': formatDate(expense.expenseDate),
    'Status': expense.status,
    'Approved By': expense.approvedBy || '',
    'Approved At': expense.approvedAt ? formatDateTime(expense.approvedAt) : '',
    'Created By': expense.createdBy,
    'Created At': formatDateTime(expense.createdAt)
  }))

  exportToCSV(data, `expenses-${Date.now()}.csv`)
}

export function exportJournalEntriesToCSV(entries: JournalEntry[]) {
  const data = entries.map(entry => ({
    'Journal Number': entry.journalNumber,
    'Type': entry.journalType,
    'Status': entry.status,
    'Transaction Date': formatDate(entry.transactionDate),
    'Description': entry.description,
    'Reference': entry.reference || '',
    'Total Debit': entry.totalDebit,
    'Total Credit': entry.totalCredit,
    'Balanced': entry.isBalanced ? 'Yes' : 'No',
    'Created By': entry.createdBy,
    'Created At': formatDateTime(entry.createdAt),
    'Posted At': entry.postedAt ? formatDateTime(entry.postedAt) : '',
    'Posted By': entry.postedBy || ''
  }))

  exportToCSV(data, `journal-entries-${Date.now()}.csv`)
}

export function exportBudgetsToCSV(budgets: Budget[]) {
  const data = budgets.map(budget => ({
    'Budget Name': budget.budgetName,
    'Department': budget.department,
    'Period': budget.period,
    'Start Date': formatDate(budget.startDate),
    'End Date': formatDate(budget.endDate),
    'Total Budget': budget.totalBudget,
    'Total Actual': budget.totalActual,
    'Variance': budget.variance,
    'Variance %': budget.totalBudget > 0 ? ((budget.variance / budget.totalBudget) * 100).toFixed(2) + '%' : '0%',
    'Status': budget.status,
    'Created By': budget.createdBy,
    'Created At': formatDateTime(budget.createdAt)
  }))

  exportToCSV(data, `budgets-${Date.now()}.csv`)
}

export function exportTrialBalanceToCSV(data: any[]) {
  exportToCSV(data, `trial-balance-${Date.now()}.csv`)
}

export function exportProfitLossToCSV(data: any[]) {
  exportToCSV(data, `profit-loss-${Date.now()}.csv`)
}

export function exportBalanceSheetToCSV(data: any[]) {
  exportToCSV(data, `balance-sheet-${Date.now()}.csv`)
}

export function generateInvoicePDF(invoice: Invoice, branding?: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 10px 0; color: #2c3e50; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box h3 { margin: 0 0 10px 0; font-size: 14px; color: #2c3e50; }
        .info-box p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: 600; }
        .text-right { text-align: right; }
        .totals { margin-left: auto; width: 300px; }
        .totals table { margin-bottom: 10px; }
        .totals td { border: none; padding: 5px; }
        .totals .total-row { font-weight: bold; font-size: 14px; border-top: 2px solid #333; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #666; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
        .badge-${invoice.status} { background-color: #e3f2fd; color: #1976d2; }
      </style>
    </head>
    <body>
      <div class="header">
        ${branding?.logo ? `<img src="${branding.logo}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;">` : ''}
        <h1>${branding?.hotelName || 'Hotel Name'}</h1>
        <p>${branding?.address || ''}</p>
        <p>${branding?.phone || ''} | ${branding?.email || ''}</p>
      </div>

      <h2 style="text-align: center; margin-bottom: 20px;">
        INVOICE
        <span class="badge badge-${invoice.status}">${invoice.status.toUpperCase()}</span>
      </h2>

      <div class="info-grid">
        <div class="info-box">
          <h3>Bill To:</h3>
          <p><strong>${invoice.supplierName || 'N/A'}</strong></p>
          <p>Supplier ID: ${invoice.supplierId}</p>
        </div>
        <div class="info-box" style="text-align: right;">
          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Invoice Date:</strong> ${formatDate(invoice.invoiceDate)}</p>
          <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
          <p><strong>Payment Terms:</strong> ${invoice.paymentTerms}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Tax</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${item.unit}</td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right">${formatCurrency(item.taxAmount)}</td>
              <td class="text-right">${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">${formatCurrency(invoice.subtotal)}</td>
          </tr>
          ${invoice.discountAmount ? `
          <tr>
            <td>Discount ${invoice.discountPercentage ? `(${invoice.discountPercentage}%)` : ''}:</td>
            <td class="text-right">-${formatCurrency(invoice.discountAmount)}</td>
          </tr>
          ` : ''}
          <tr>
            <td>Tax (${invoice.taxRate}%):</td>
            <td class="text-right">${formatCurrency(invoice.taxAmount)}</td>
          </tr>
          <tr class="total-row">
            <td>Total Amount:</td>
            <td class="text-right">${formatCurrency(invoice.total)}</td>
          </tr>
          ${invoice.amountPaid > 0 ? `
          <tr>
            <td>Amount Paid:</td>
            <td class="text-right">${formatCurrency(invoice.amountPaid)}</td>
          </tr>
          <tr class="total-row">
            <td>Balance Due:</td>
            <td class="text-right">${formatCurrency(invoice.balance)}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      ${invoice.notes ? `
      <div style="margin-top: 30px;">
        <h3>Notes:</h3>
        <p>${invoice.notes}</p>
      </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${formatDateTime(Date.now())}</p>
      </div>
    </body>
    </html>
  `
}

export function printInvoicePDF(invoice: Invoice, branding?: any) {
  const htmlContent = generateInvoicePDF(invoice, branding)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}

export function downloadInvoicePDF(invoice: Invoice, branding?: any) {
  const htmlContent = generateInvoicePDF(invoice, branding)
  downloadFile(htmlContent, `invoice-${invoice.invoiceNumber}.html`, 'text/html')
}
