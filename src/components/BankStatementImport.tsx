import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Upload, 
  FileArrowDown,
  Check,
  X,
  MagnifyingGlass,
  LinkSimple,
  Warning,
  CheckCircle,
  FileCsv,
  Sparkle,
  ArrowRight
} from '@phosphor-icons/react'
import type { 
  BankTransaction,
  JournalEntry,
  GLEntry,
  ChartOfAccount,
  ReconciledTransaction
} from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'

interface BankStatementImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bankAccounts: ChartOfAccount[]
  journalEntries: JournalEntry[]
  glEntries: GLEntry[]
  onComplete: (data: {
    bankTransactions: BankTransaction[]
    matchedTransactions: ReconciledTransaction[]
    unmatchedBankTransactions: BankTransaction[]
    unmatchedGLEntries: GLEntry[]
    selectedAccountId: string
    statementDate: number
    statementBalance: number
  }) => void
}

type CSVColumn = 'date' | 'description' | 'debit' | 'credit' | 'balance' | 'reference' | 'skip'

interface ColumnMapping {
  column: number
  field: CSVColumn
  sample: string
}

interface ParsedTransaction {
  date: string
  description: string
  debit: string
  credit: string
  balance: string
  reference: string
}

export function BankStatementImport({
  open,
  onOpenChange,
  bankAccounts,
  journalEntries,
  glEntries,
  onComplete
}: BankStatementImportProps) {
  const [step, setStep] = useState<'upload' | 'map' | 'review' | 'match' | 'complete'>('upload')
  const [csvData, setCsvData] = useState<string[][]>([])
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [hasHeaders, setHasHeaders] = useState(true)
  const [parsedTransactions, setParsedTransactions] = useState<BankTransaction[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [statementDate, setStatementDate] = useState<number>(Date.now())
  const [statementBalance, setStatementBalance] = useState('')
  const [matchedTransactions, setMatchedTransactions] = useState<ReconciledTransaction[]>([])
  const [matchProgress, setMatchProgress] = useState(0)
  const [isMatching, setIsMatching] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const rows = parseCSV(text)
        
        if (rows.length === 0) {
          toast.error('CSV file is empty')
          return
        }

        setCsvData(rows)
        
        const firstRow = rows[0]
        const mappings: ColumnMapping[] = firstRow.map((header, index) => ({
          column: index,
          field: detectColumnType(header, rows[1] || []),
          sample: rows[hasHeaders ? 1 : 0]?.[index] || ''
        }))
        
        setColumnMappings(mappings)
        setStep('map')
        toast.success(`Loaded ${rows.length} rows from CSV`)
      } catch (error) {
        console.error('Error parsing CSV:', error)
        toast.error('Failed to parse CSV file')
      }
    }
    reader.readAsText(file)
  }

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentCell = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim())
        currentCell = ''
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++
        }
        if (currentCell || currentRow.length > 0) {
          currentRow.push(currentCell.trim())
          if (currentRow.some(cell => cell !== '')) {
            rows.push(currentRow)
          }
          currentRow = []
          currentCell = ''
        }
      } else {
        currentCell += char
      }
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim())
      if (currentRow.some(cell => cell !== '')) {
        rows.push(currentRow)
      }
    }

    return rows
  }

  const detectColumnType = (header: string, sample: string[]): CSVColumn => {
    const headerLower = header.toLowerCase()
    
    if (headerLower.includes('date') || headerLower.includes('posted')) return 'date'
    if (headerLower.includes('description') || headerLower.includes('narrative') || headerLower.includes('details')) return 'description'
    if (headerLower.includes('debit') || headerLower.includes('withdrawal') || headerLower.includes('payment')) return 'debit'
    if (headerLower.includes('credit') || headerLower.includes('deposit') || headerLower.includes('receipt')) return 'credit'
    if (headerLower.includes('balance')) return 'balance'
    if (headerLower.includes('reference') || headerLower.includes('ref') || headerLower.includes('cheque')) return 'reference'
    
    return 'skip'
  }

  const handleColumnMappingChange = (columnIndex: number, field: CSVColumn) => {
    setColumnMappings(prev => prev.map((mapping, idx) =>
      idx === columnIndex ? { ...mapping, field } : mapping
    ))
  }

  const parseTransactions = () => {
    const startRow = hasHeaders ? 1 : 0
    const dataRows = csvData.slice(startRow)
    
    const dateCol = columnMappings.find(m => m.field === 'date')?.column
    const descCol = columnMappings.find(m => m.field === 'description')?.column
    const debitCol = columnMappings.find(m => m.field === 'debit')?.column
    const creditCol = columnMappings.find(m => m.field === 'credit')?.column
    const balanceCol = columnMappings.find(m => m.field === 'balance')?.column
    const refCol = columnMappings.find(m => m.field === 'reference')?.column

    if (dateCol === undefined || descCol === undefined) {
      toast.error('Date and Description columns are required')
      return
    }

    const transactions: BankTransaction[] = []
    let runningBalance = 0

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      
      const dateStr = row[dateCol] || ''
      const description = row[descCol] || ''
      const debitStr = debitCol !== undefined ? row[debitCol] || '0' : '0'
      const creditStr = creditCol !== undefined ? row[creditCol] || '0' : '0'
      const balanceStr = balanceCol !== undefined ? row[balanceCol] || '' : ''
      const reference = refCol !== undefined ? row[refCol] || '' : ''

      if (!dateStr || !description) continue

      const transactionDate = parseDate(dateStr)
      const debit = parseAmount(debitStr)
      const credit = parseAmount(creditStr)
      const balance = balanceStr ? parseAmount(balanceStr) : (runningBalance + credit - debit)

      runningBalance = balance

      transactions.push({
        id: `import-${Date.now()}-${i}`,
        transactionDate,
        valueDate: transactionDate,
        description: description.trim(),
        reference: reference.trim(),
        debit,
        credit,
        balance,
        matched: false
      })
    }

    setParsedTransactions(transactions)
    setStep('review')
    toast.success(`Parsed ${transactions.length} transactions`)
  }

  const parseDate = (dateStr: string): number => {
    const formats = [
      /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/,
      /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/,
      /(\d{1,2})[-/](\d{1,2})[-/](\d{2})/
    ]

    for (const format of formats) {
      const match = dateStr.match(format)
      if (match) {
        if (match[3].length === 4) {
          const day = parseInt(match[1])
          const month = parseInt(match[2])
          const year = parseInt(match[3])
          return new Date(year, month - 1, day).getTime()
        } else {
          const year = parseInt(match[1])
          const month = parseInt(match[2])
          const day = parseInt(match[3])
          return new Date(year, month - 1, day).getTime()
        }
      }
    }

    return new Date(dateStr).getTime() || Date.now()
  }

  const parseAmount = (amountStr: string): number => {
    const cleaned = amountStr.replace(/[^0-9.-]/g, '')
    return parseFloat(cleaned) || 0
  }

  const autoMatch = async () => {
    if (!selectedAccountId) {
      toast.error('Please select a bank account')
      return
    }

    setIsMatching(true)
    setMatchProgress(0)
    setStep('match')

    const accountGLEntries = glEntries.filter(entry => entry.accountId === selectedAccountId)
    const matched: ReconciledTransaction[] = []
    const totalTransactions = parsedTransactions.length

    for (let i = 0; i < parsedTransactions.length; i++) {
      const bankTxn = parsedTransactions[i]
      const amount = bankTxn.debit > 0 ? bankTxn.debit : bankTxn.credit
      const isDebit = bankTxn.debit > 0

      const match = accountGLEntries.find(glEntry => {
        const glAmount = isDebit ? glEntry.debit : glEntry.credit
        const amountMatch = Math.abs(glAmount - amount) < 0.01
        const dateMatch = Math.abs(glEntry.transactionDate - bankTxn.transactionDate) < 7 * 24 * 60 * 60 * 1000
        const descMatch = bankTxn.description.toLowerCase().includes(glEntry.description.toLowerCase().slice(0, 10)) ||
                          glEntry.description.toLowerCase().includes(bankTxn.description.toLowerCase().slice(0, 10))
        
        return amountMatch && (dateMatch || descMatch)
      })

      if (match) {
        matched.push({
          bankTransactionId: bankTxn.id,
          glEntryId: match.id,
          matchType: 'exact',
          matchScore: 100,
          reconciledAt: Date.now(),
          reconciledBy: 'auto-match'
        })
        
        bankTxn.matched = true
        bankTxn.matchedGLEntryId = match.id
      }

      setMatchProgress(Math.round(((i + 1) / totalTransactions) * 100))
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    setMatchedTransactions(matched)
    setIsMatching(false)
    setStep('complete')
    
    toast.success(`Auto-matched ${matched.length} of ${parsedTransactions.length} transactions`)
  }

  const handleComplete = () => {
    const unmatchedBankTxns = parsedTransactions.filter(txn => !txn.matched)
    const matchedGLIds = new Set(matchedTransactions.map(m => m.glEntryId))
    const unmatchedGLEntries = glEntries.filter(
      entry => entry.accountId === selectedAccountId && !matchedGLIds.has(entry.id)
    )

    onComplete({
      bankTransactions: parsedTransactions,
      matchedTransactions,
      unmatchedBankTransactions: unmatchedBankTxns,
      unmatchedGLEntries,
      selectedAccountId,
      statementDate,
      statementBalance: parseFloat(statementBalance) || 0
    })

    resetState()
    onOpenChange(false)
  }

  const resetState = () => {
    setStep('upload')
    setCsvData([])
    setColumnMappings([])
    setHasHeaders(true)
    setParsedTransactions([])
    setSelectedAccountId('')
    setStatementDate(Date.now())
    setStatementBalance('')
    setMatchedTransactions([])
    setMatchProgress(0)
    setIsMatching(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <FileCsv size={32} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Import Bank Statement</h3>
        <p className="text-sm text-muted-foreground">
          Upload your bank statement CSV file to automatically match transactions
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Bank Account</Label>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Select bank account" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.filter(acc => acc.isBankAccount).map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.accountCode} - {account.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Statement Date</Label>
          <Input
            type="date"
            value={new Date(statementDate).toISOString().split('T')[0]}
            onChange={(e) => setStatementDate(new Date(e.target.value).getTime())}
          />
        </div>

        <div>
          <Label>Statement Ending Balance</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={statementBalance}
            onChange={(e) => setStatementBalance(e.target.value)}
          />
        </div>

        <Separator />

        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}>
          <Upload size={40} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Click to upload CSV file</p>
          <p className="text-sm text-muted-foreground">
            Supports standard bank statement formats
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  )

  const renderMappingStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Map CSV Columns</h3>
        <p className="text-sm text-muted-foreground">
          Match CSV columns to transaction fields
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="has-headers"
          checked={hasHeaders}
          onCheckedChange={(checked) => setHasHeaders(checked as boolean)}
        />
        <Label htmlFor="has-headers">First row contains headers</Label>
      </div>

      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column</TableHead>
              <TableHead>Sample Data</TableHead>
              <TableHead>Field Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {columnMappings.map((mapping, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {hasHeaders ? csvData[0][mapping.column] : `Column ${mapping.column + 1}`}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {mapping.sample}
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.field}
                    onValueChange={(value) => handleColumnMappingChange(index, value as CSVColumn)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="description">Description</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="balance">Balance</SelectItem>
                      <SelectItem value="reference">Reference</SelectItem>
                      <SelectItem value="skip">Skip</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setStep('upload')}>
          Back
        </Button>
        <Button onClick={parseTransactions}>
          Continue
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Review Transactions</h3>
          <p className="text-sm text-muted-foreground">
            {parsedTransactions.length} transactions loaded
          </p>
        </div>
        <Badge variant="outline">
          Total: {formatCurrency(parsedTransactions[parsedTransactions.length - 1]?.balance || 0)}
        </Badge>
      </div>

      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parsedTransactions.map((txn, index) => (
              <TableRow key={index}>
                <TableCell className="text-sm">{formatDate(txn.transactionDate)}</TableCell>
                <TableCell className="max-w-[250px] truncate">{txn.description}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{txn.reference}</TableCell>
                <TableCell className="text-right">
                  {txn.debit > 0 && <span className="text-destructive">{formatCurrency(txn.debit)}</span>}
                </TableCell>
                <TableCell className="text-right">
                  {txn.credit > 0 && <span className="text-success">{formatCurrency(txn.credit)}</span>}
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(txn.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setStep('map')}>
          Back
        </Button>
        <Button onClick={autoMatch}>
          <Sparkle size={16} className="mr-2" />
          Auto-Match Transactions
        </Button>
      </div>
    </div>
  )

  const renderMatchingStep = () => (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Sparkle size={32} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Matching Transactions...</h3>
        <p className="text-sm text-muted-foreground">
          Using AI to match bank transactions with journal entries
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{matchProgress}%</span>
        </div>
        <Progress value={matchProgress} />
      </div>
    </div>
  )

  const renderCompleteStep = () => {
    const unmatchedCount = parsedTransactions.filter(txn => !txn.matched).length
    const matchRate = ((matchedTransactions.length / parsedTransactions.length) * 100).toFixed(1)

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle size={32} className="text-success" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Matching Complete</h3>
          <p className="text-sm text-muted-foreground">
            {matchedTransactions.length} of {parsedTransactions.length} transactions matched ({matchRate}%)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Check size={24} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{matchedTransactions.length}</p>
                <p className="text-sm text-muted-foreground">Matched</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Warning size={24} className="text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unmatchedCount}</p>
                <p className="text-sm text-muted-foreground">Unmatched</p>
              </div>
            </div>
          </Card>
        </div>

        {unmatchedCount > 0 && (
          <Card className="p-4 border-warning">
            <div className="flex gap-3">
              <Warning size={20} className="text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Manual Review Required</p>
                <p className="text-muted-foreground">
                  {unmatchedCount} transaction{unmatchedCount !== 1 ? 's' : ''} could not be automatically matched and will need manual reconciliation.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setStep('review')}>
            Back
          </Button>
          <Button onClick={handleComplete}>
            Complete Import
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bank Statement Import & Auto-Match</DialogTitle>
          <DialogDescription>
            Import bank statement CSV and automatically match with journal entries
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'upload' && renderUploadStep()}
          {step === 'map' && renderMappingStep()}
          {step === 'review' && renderReviewStep()}
          {step === 'match' && renderMatchingStep()}
          {step === 'complete' && renderCompleteStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
