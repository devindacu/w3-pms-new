import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Bank, 
  Check, 
  X, 
  Upload, 
  Download, 
  MagnifyingGlass,
  CheckCircle,
  Warning,
  Link as LinkIcon,
  FileArrowDown,
  Sparkle
} from '@phosphor-icons/react'
import type { 
  BankReconciliation, 
  BankTransaction, 
  GLEntry,
  ReconciledTransaction,
  ChartOfAccount,
  JournalEntry,
  SystemUser
} from '@/lib/types'
import { formatCurrency, formatDate, generateNumber } from '@/lib/helpers'
import { BankStatementImport } from './BankStatementImport'

interface BankReconciliationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reconciliation?: BankReconciliation
  bankAccounts: ChartOfAccount[]
  journalEntries: JournalEntry[]
  glEntries: GLEntry[]
  onSave: (reconciliation: BankReconciliation) => void
  currentUser: SystemUser
}

export function BankReconciliationDialog({
  open,
  onOpenChange,
  reconciliation,
  bankAccounts,
  journalEntries,
  glEntries,
  onSave,
  currentUser
}: BankReconciliationDialogProps) {
  const [selectedAccount, setSelectedAccount] = useState('')
  const [statementDate, setStatementDate] = useState<number>(Date.now())
  const [statementBalance, setStatementBalance] = useState('')
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([])
  const [selectedBankTxns, setSelectedBankTxns] = useState<Set<string>>(new Set())
  const [selectedGLEntries, setSelectedGLEntries] = useState<Set<string>>(new Set())
  const [matchedPairs, setMatchedPairs] = useState<ReconciledTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [matchMode, setMatchMode] = useState<'auto' | 'manual'>('auto')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [showMatchSuggestions, setShowMatchSuggestions] = useState(false)
  const [selectedMatchPair, setSelectedMatchPair] = useState<{bankId: string, glId: string} | null>(null)

  useEffect(() => {
    if (reconciliation) {
      setSelectedAccount(reconciliation.bankAccountId)
      setStatementDate(reconciliation.statementDate)
      setStatementBalance(reconciliation.statementBalance.toString())
      setBankTransactions(reconciliation.unmatchedBankTransactions || [])
      setMatchedPairs(reconciliation.matchedTransactions || [])
    } else {
      resetForm()
    }
  }, [reconciliation, open])

  const resetForm = () => {
    setSelectedAccount('')
    setStatementDate(Date.now())
    setStatementBalance('')
    setBankTransactions([])
    setSelectedBankTxns(new Set())
    setSelectedGLEntries(new Set())
    setMatchedPairs([])
    setSearchTerm('')
  }

  const handleImportComplete = (data: {
    bankTransactions: BankTransaction[]
    matchedTransactions: ReconciledTransaction[]
    unmatchedBankTransactions: BankTransaction[]
    unmatchedGLEntries: GLEntry[]
    selectedAccountId: string
    statementDate: number
    statementBalance: number
  }) => {
    setSelectedAccount(data.selectedAccountId)
    setStatementDate(data.statementDate)
    setStatementBalance(data.statementBalance.toString())
    setBankTransactions(data.bankTransactions)
    setMatchedPairs(data.matchedTransactions)
    toast.success(`Import complete: ${data.matchedTransactions.length} transactions matched`)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const transactions = parseCSV(text)
        setBankTransactions(transactions)
        toast.success(`Imported ${transactions.length} bank transactions`)
      } catch (error) {
        toast.error('Failed to parse bank statement file')
      }
    }
    reader.readAsText(file)
  }

  const parseCSV = (csvText: string): BankTransaction[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].toLowerCase().split(',')
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',')
      const dateCol = headers.findIndex(h => h.includes('date'))
      const descCol = headers.findIndex(h => h.includes('description') || h.includes('details'))
      const debitCol = headers.findIndex(h => h.includes('debit') || h.includes('withdrawal'))
      const creditCol = headers.findIndex(h => h.includes('credit') || h.includes('deposit'))
      const balanceCol = headers.findIndex(h => h.includes('balance'))
      const refCol = headers.findIndex(h => h.includes('reference') || h.includes('ref'))

      const debit = debitCol >= 0 ? parseFloat(values[debitCol]?.replace(/[^0-9.-]/g, '') || '0') : 0
      const credit = creditCol >= 0 ? parseFloat(values[creditCol]?.replace(/[^0-9.-]/g, '') || '0') : 0

      return {
        id: `bank-txn-${Date.now()}-${index}`,
        transactionDate: dateCol >= 0 ? new Date(values[dateCol]).getTime() : Date.now(),
        valueDate: dateCol >= 0 ? new Date(values[dateCol]).getTime() : Date.now(),
        description: descCol >= 0 ? values[descCol].trim() : 'Unknown',
        reference: refCol >= 0 ? values[refCol]?.trim() : undefined,
        debit,
        credit,
        balance: balanceCol >= 0 ? parseFloat(values[balanceCol]?.replace(/[^0-9.-]/g, '') || '0') : 0,
        matched: false
      }
    })
  }

  const getAvailableGLEntries = (): GLEntry[] => {
    if (!selectedAccount) return []
    
    const matchedGLIds = new Set(matchedPairs.map(m => m.glEntryId))
    
    return glEntries.filter(entry => 
      entry.accountId === selectedAccount &&
      !matchedGLIds.has(entry.id) &&
      (searchTerm === '' || 
       entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       entry.sourceDocumentNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  const getUnmatchedBankTransactions = (): BankTransaction[] => {
    const matchedBankIds = new Set(matchedPairs.map(m => m.bankTransactionId))
    return bankTransactions.filter(txn => !matchedBankIds.has(txn.id))
  }

  const calculateMatchScore = (bankTxn: BankTransaction, glEntry: GLEntry): number => {
    let score = 0
    const bankAmount = bankTxn.credit > 0 ? bankTxn.credit : -bankTxn.debit
    const glAmount = glEntry.credit > 0 ? glEntry.credit : -glEntry.debit
    
    if (Math.abs(bankAmount - glAmount) < 0.01) {
      score += 50
    } else if (Math.abs(bankAmount - glAmount) < 1) {
      score += 30
    } else if (Math.abs(bankAmount - glAmount) < 10) {
      score += 10
    }
    
    const dateDiff = Math.abs(bankTxn.transactionDate - glEntry.transactionDate)
    const daysDiff = dateDiff / (24 * 60 * 60 * 1000)
    
    if (daysDiff === 0) {
      score += 30
    } else if (daysDiff <= 1) {
      score += 20
    } else if (daysDiff <= 3) {
      score += 10
    } else if (daysDiff <= 7) {
      score += 5
    }
    
    const bankDesc = bankTxn.description.toLowerCase()
    const glDesc = glEntry.description.toLowerCase()
    const bankRef = bankTxn.reference?.toLowerCase() || ''
    const glRef = glEntry.sourceDocumentNumber?.toLowerCase() || ''
    
    if (bankDesc.includes(glDesc) || glDesc.includes(bankDesc)) {
      score += 15
    }
    
    if (bankRef && glRef && (bankRef.includes(glRef) || glRef.includes(bankRef))) {
      score += 5
    }
    
    return Math.min(score, 100)
  }

  const getSuggestedMatches = (bankTxn: BankTransaction): Array<{glEntry: GLEntry, score: number}> => {
    const availableGL = getAvailableGLEntries()
    const suggestions = availableGL
      .map(gl => ({
        glEntry: gl,
        score: calculateMatchScore(bankTxn, gl)
      }))
      .filter(s => s.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
    
    return suggestions
  }

  const performAutoMatching = () => {
    const unmatchedBank = getUnmatchedBankTransactions()
    const availableGL = getAvailableGLEntries()
    const newMatches: ReconciledTransaction[] = []
    const usedGLIds = new Set<string>()

    unmatchedBank.forEach(bankTxn => {
      const suggestions = availableGL
        .filter(gl => !usedGLIds.has(gl.id))
        .map(gl => ({
          gl,
          score: calculateMatchScore(bankTxn, gl)
        }))
        .filter(s => s.score >= 85)
        .sort((a, b) => b.score - a.score)
      
      if (suggestions.length > 0) {
        const bestMatch = suggestions[0]
        newMatches.push({
          bankTransactionId: bankTxn.id,
          glEntryId: bestMatch.gl.id,
          matchType: bestMatch.score === 100 ? 'exact' : 'fuzzy',
          matchScore: bestMatch.score,
          reconciledAt: Date.now(),
          reconciledBy: currentUser.id
        })
        usedGLIds.add(bestMatch.gl.id)
      }
    })

    if (newMatches.length > 0) {
      setMatchedPairs([...matchedPairs, ...newMatches])
      toast.success(`Auto-matched ${newMatches.length} transactions (${newMatches.filter(m => m.matchType === 'exact').length} exact, ${newMatches.filter(m => m.matchType === 'fuzzy').length} fuzzy)`)
    } else {
      toast.info('No automatic matches found')
      setShowMatchSuggestions(true)
    }
  }

  const handleManualMatch = () => {
    if (selectedBankTxns.size === 0 || selectedGLEntries.size === 0) {
      toast.error('Please select at least one bank transaction and one GL entry')
      return
    }

    if (selectedBankTxns.size === 1 && selectedGLEntries.size > 1) {
      const bankId = Array.from(selectedBankTxns)[0]
      const glIds = Array.from(selectedGLEntries)
      
      const newMatch: ReconciledTransaction = {
        bankTransactionId: bankId,
        glEntryId: glIds[0],
        matchType: 'manual-one-to-many',
        relatedGLEntryIds: glIds.slice(1),
        reconciledAt: Date.now(),
        reconciledBy: currentUser.id
      }
      
      setMatchedPairs([...matchedPairs, newMatch])
      setSelectedBankTxns(new Set())
      setSelectedGLEntries(new Set())
      toast.success(`Matched 1 bank transaction to ${glIds.length} GL entries`)
      return
    }

    if (selectedBankTxns.size > 1 && selectedGLEntries.size === 1) {
      const bankIds = Array.from(selectedBankTxns)
      const glId = Array.from(selectedGLEntries)[0]
      
      const newMatch: ReconciledTransaction = {
        bankTransactionId: bankIds[0],
        glEntryId: glId,
        matchType: 'manual-many-to-one',
        relatedBankTransactionIds: bankIds.slice(1),
        reconciledAt: Date.now(),
        reconciledBy: currentUser.id
      }
      
      setMatchedPairs([...matchedPairs, newMatch])
      setSelectedBankTxns(new Set())
      setSelectedGLEntries(new Set())
      toast.success(`Matched ${bankIds.length} bank transactions to 1 GL entry`)
      return
    }

    if (selectedBankTxns.size !== selectedGLEntries.size) {
      toast.error('For multiple matches, select equal numbers or use one-to-many/many-to-one matching')
      return
    }

    const bankTxnArray = Array.from(selectedBankTxns)
    const glEntryArray = Array.from(selectedGLEntries)

    const newMatches: ReconciledTransaction[] = bankTxnArray.map((bankId, index) => ({
      bankTransactionId: bankId,
      glEntryId: glEntryArray[index],
      matchType: 'manual',
      reconciledAt: Date.now(),
      reconciledBy: currentUser.id
    }))

    setMatchedPairs([...matchedPairs, ...newMatches])
    setSelectedBankTxns(new Set())
    setSelectedGLEntries(new Set())
    toast.success(`Manually matched ${newMatches.length} transactions`)
  }

  const handleSuggestedMatch = (bankId: string, glId: string) => {
    const newMatch: ReconciledTransaction = {
      bankTransactionId: bankId,
      glEntryId: glId,
      matchType: 'suggested',
      reconciledAt: Date.now(),
      reconciledBy: currentUser.id
    }
    
    setMatchedPairs([...matchedPairs, newMatch])
    toast.success('Suggested match accepted')
  }

  const handleUnmatch = (matchId: string) => {
    setMatchedPairs(matchedPairs.filter(m => 
      m.bankTransactionId !== matchId && m.glEntryId !== matchId
    ))
    toast.success('Transaction unmatched')
  }

  const calculateBookBalance = (): number => {
    if (!selectedAccount) return 0
    
    const account = bankAccounts.find(a => a.id === selectedAccount)
    return account?.currentBalance || 0
  }

  const calculateDifference = (): number => {
    const stmt = parseFloat(statementBalance) || 0
    const book = calculateBookBalance()
    
    const unmatchedBankTotal = getUnmatchedBankTransactions().reduce((sum, txn) => 
      sum + (txn.credit - txn.debit), 0
    )
    
    const unmatchedGLTotal = getAvailableGLEntries().reduce((sum, entry) => 
      sum + (entry.credit - entry.debit), 0
    )
    
    return stmt - book + unmatchedBankTotal - unmatchedGLTotal
  }

  const handleSave = () => {
    if (!selectedAccount) {
      toast.error('Please select a bank account')
      return
    }

    const difference = calculateDifference()
    const status: 'in-progress' | 'completed' | 'discrepancy' = 
      Math.abs(difference) < 0.01 ? 'completed' :
      matchedPairs.length > 0 ? 'in-progress' : 'discrepancy'

    const newReconciliation: BankReconciliation = {
      id: reconciliation?.id || `recon-${generateNumber('RECON')}`,
      reconciliationNumber: reconciliation?.reconciliationNumber || generateNumber('REC'),
      bankAccountId: selectedAccount,
      bankAccountName: bankAccounts.find(a => a.id === selectedAccount)?.accountName || '',
      statementDate,
      statementBalance: parseFloat(statementBalance) || 0,
      bookBalance: calculateBookBalance(),
      difference,
      status,
      matchedTransactions: matchedPairs,
      unmatchedBankTransactions: getUnmatchedBankTransactions(),
      unmatchedBookTransactions: getAvailableGLEntries(),
      reconciledBy: currentUser.id,
      reconciledAt: Date.now(),
      createdAt: reconciliation?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    onSave(newReconciliation)
    
    if (status === 'completed') {
      toast.success('Bank reconciliation completed successfully')
    } else if (status === 'in-progress') {
      toast.info('Bank reconciliation saved (in progress)')
    } else {
      toast.warning('Bank reconciliation saved with discrepancies')
    }
    
    onOpenChange(false)
  }

  const unmatchedBankList = getUnmatchedBankTransactions()
  const unmatchedGLList = getAvailableGLEntries()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bank size={24} />
            {reconciliation ? 'Edit' : 'New'} Bank Reconciliation
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div className="space-y-2">
            <Label>Bank Account</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.filter(a => a.isBankAccount).map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.accountCode} - {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Statement Date</Label>
            <Input
              type="date"
              value={new Date(statementDate).toISOString().split('T')[0]}
              onChange={(e) => setStatementDate(new Date(e.target.value).getTime())}
            />
          </div>

          <div className="space-y-2">
            <Label>Statement Balance (LKR)</Label>
            <Input
              type="number"
              step="0.01"
              value={statementBalance}
              onChange={(e) => setStatementBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <Card className="p-4 bg-muted/50">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Book Balance</div>
              <div className="text-lg font-semibold">{formatCurrency(calculateBookBalance())}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Statement Balance</div>
              <div className="text-lg font-semibold">{formatCurrency(parseFloat(statementBalance) || 0)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Difference</div>
              <div className={`text-lg font-semibold ${Math.abs(calculateDifference()) < 0.01 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(calculateDifference())}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Sparkle size={18} className="mr-2" />
            Smart Import CSV
          </Button>
          <Button variant="outline" onClick={performAutoMatching}>
            <CheckCircle size={18} className="mr-2" />
            Auto Match
          </Button>
          <Button variant="outline" onClick={handleManualMatch} disabled={selectedBankTxns.size === 0 || selectedGLEntries.size === 0}>
            <LinkIcon size={18} className="mr-2" />
            Match Selected
          </Button>
        </div>

        <Tabs defaultValue="unmatched" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unmatched">
              Unmatched ({unmatchedBankList.length} Bank / {unmatchedGLList.length} Book)
            </TabsTrigger>
            <TabsTrigger value="matched">
              Matched ({matchedPairs.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unmatched" className="flex-1 overflow-hidden">
            <div className="grid grid-cols-2 gap-4 h-full">
              <Card className="p-4 flex flex-col">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Bank size={18} />
                  Bank Transactions
                </h3>
                <ScrollArea className="flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unmatchedBankList.map(txn => (
                        <TableRow key={txn.id} className={selectedBankTxns.has(txn.id) ? 'bg-primary/10' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={selectedBankTxns.has(txn.id)}
                              onCheckedChange={(checked) => {
                                const newSet = new Set(selectedBankTxns)
                                if (checked) {
                                  newSet.add(txn.id)
                                } else {
                                  newSet.delete(txn.id)
                                }
                                setSelectedBankTxns(newSet)
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-sm">{formatDate(txn.transactionDate)}</TableCell>
                          <TableCell className="text-sm">{txn.description}</TableCell>
                          <TableCell className="text-right text-sm">{txn.debit > 0 ? formatCurrency(txn.debit) : '-'}</TableCell>
                          <TableCell className="text-right text-sm text-success">{txn.credit > 0 ? formatCurrency(txn.credit) : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>

              <Card className="p-4 flex flex-col">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileArrowDown size={18} />
                  Book Transactions (GL)
                </h3>
                <ScrollArea className="flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unmatchedGLList.map(entry => (
                        <TableRow key={entry.id} className={selectedGLEntries.has(entry.id) ? 'bg-primary/10' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={selectedGLEntries.has(entry.id)}
                              onCheckedChange={(checked) => {
                                const newSet = new Set(selectedGLEntries)
                                if (checked) {
                                  newSet.add(entry.id)
                                } else {
                                  newSet.delete(entry.id)
                                }
                                setSelectedGLEntries(newSet)
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-sm">{formatDate(entry.transactionDate)}</TableCell>
                          <TableCell className="text-sm">{entry.description}</TableCell>
                          <TableCell className="text-right text-sm">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                          <TableCell className="text-right text-sm text-success">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matched" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank Date</TableHead>
                    <TableHead>Bank Description</TableHead>
                    <TableHead>GL Date</TableHead>
                    <TableHead>GL Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Match Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchedPairs.map(match => {
                    const bankTxn = bankTransactions.find(t => t.id === match.bankTransactionId)
                    const glEntry = glEntries.find(e => e.id === match.glEntryId)
                    if (!bankTxn || !glEntry) return null

                    const amount = bankTxn.credit > 0 ? bankTxn.credit : bankTxn.debit

                    return (
                      <TableRow key={`${match.bankTransactionId}-${match.glEntryId}`}>
                        <TableCell className="text-sm">{formatDate(bankTxn.transactionDate)}</TableCell>
                        <TableCell className="text-sm">
                          <div>{bankTxn.description}</div>
                          {bankTxn.reference && (
                            <div className="text-xs text-muted-foreground">Ref: {bankTxn.reference}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(glEntry.transactionDate)}</TableCell>
                        <TableCell className="text-sm">
                          <div>{glEntry.description}</div>
                          {glEntry.sourceDocumentNumber && (
                            <div className="text-xs text-muted-foreground">Doc: {glEntry.sourceDocumentNumber}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(amount)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            match.matchType === 'exact' ? 'default' : 
                            match.matchType === 'fuzzy' ? 'secondary' :
                            match.matchType === 'suggested' ? 'outline' :
                            'secondary'
                          }>
                            {match.matchType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {match.matchScore && (
                            <Badge variant={match.matchScore >= 90 ? 'default' : match.matchScore >= 70 ? 'secondary' : 'outline'}>
                              {match.matchScore}%
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUnmatch(match.bankTransactionId)}
                          >
                            <X size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="suggestions" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                {unmatchedBankList.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    All bank transactions have been matched
                  </div>
                ) : (
                  unmatchedBankList.slice(0, 10).map(bankTxn => {
                    const suggestions = getSuggestedMatches(bankTxn)
                    
                    if (suggestions.length === 0) return null

                    return (
                      <Card key={bankTxn.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-medium">{bankTxn.description}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatDate(bankTxn.transactionDate)} • {formatCurrency(bankTxn.credit > 0 ? bankTxn.credit : bankTxn.debit)}
                            </div>
                            {bankTxn.reference && (
                              <div className="text-xs text-muted-foreground mt-1">Ref: {bankTxn.reference}</div>
                            )}
                          </div>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">Suggested Matches:</div>
                          {suggestions.map(({glEntry, score}) => (
                            <div key={glEntry.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm">{glEntry.description}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(glEntry.transactionDate)} • {formatCurrency(glEntry.credit > 0 ? glEntry.credit : glEntry.debit)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant={score >= 90 ? 'default' : score >= 70 ? 'secondary' : 'outline'}>
                                  {score}%
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSuggestedMatch(bankTxn.id, glEntry.id)}
                                >
                                  <Check size={14} className="mr-1" />
                                  Match
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator className="my-2" />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {Math.abs(calculateDifference()) < 0.01 ? (
              <>
                <CheckCircle size={18} className="mr-2" />
                Complete Reconciliation
              </>
            ) : (
              <>
                Save Reconciliation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      <BankStatementImport
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        bankAccounts={bankAccounts}
        journalEntries={journalEntries}
        glEntries={glEntries}
        onComplete={handleImportComplete}
      />
    </Dialog>
  )
}
