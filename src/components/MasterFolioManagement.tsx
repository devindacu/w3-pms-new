import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  type MasterFolio, 
  type Folio, 
  type Reservation, 
  type Guest,
  type SystemUser,
  type FolioCharge,
  type FolioPayment
} from '@/lib/types'
import { 
  Plus, 
  MagnifyingGlass, 
  Buildings, 
  DotsThree,
  Eye,
  Pencil,
  Trash,
  Receipt,
  CurrencyDollar,
  Users,
  ArrowsLeftRight,
  X,
  CheckCircle,
  Clock
} from '@phosphor-icons/react'
import { formatCurrency, formatDate, generateId } from '@/lib/helpers'
import { MasterFolioDialog } from './MasterFolioDialog'
import { MasterFolioViewDialog } from './MasterFolioViewDialog'
import { toast } from 'sonner'

interface MasterFolioManagementProps {
  masterFolios: MasterFolio[]
  setMasterFolios: (folios: MasterFolio[] | ((prev: MasterFolio[]) => MasterFolio[])) => void
  folios: Folio[]
  setFolios: (folios: Folio[] | ((prev: Folio[]) => Folio[])) => void
  reservations: Reservation[]
  guests: Guest[]
  currentUser: SystemUser
}

export function MasterFolioManagement({
  masterFolios,
  setMasterFolios,
  folios,
  setFolios,
  reservations,
  guests,
  currentUser
}: MasterFolioManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMasterFolio, setSelectedMasterFolio] = useState<MasterFolio | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active')

  const handleCreate = () => {
    setSelectedMasterFolio(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (masterFolio: MasterFolio) => {
    setSelectedMasterFolio(masterFolio)
    setIsDialogOpen(true)
  }

  const handleView = (masterFolio: MasterFolio) => {
    setSelectedMasterFolio(masterFolio)
    setIsViewDialogOpen(true)
  }

  const handleSave = (masterFolio: MasterFolio) => {
    setMasterFolios((prev) => {
      const existing = prev.find(mf => mf.id === masterFolio.id)
      if (existing) {
        return prev.map(mf => mf.id === masterFolio.id ? masterFolio : mf)
      }
      return [...prev, masterFolio]
    })

    setFolios((prev) =>
      prev.map(folio => {
        if (masterFolio.childFolioIds.includes(folio.id)) {
          return { ...folio, masterFolioId: masterFolio.id }
        } else if (folio.masterFolioId === masterFolio.id) {
          return { ...folio, masterFolioId: undefined }
        }
        return folio
      })
    )

    setIsDialogOpen(false)
  }

  const handleClose = (masterFolioId: string) => {
    setMasterFolios((prev) =>
      prev.map(mf => 
        mf.id === masterFolioId 
          ? { ...mf, status: 'closed' as const, closedAt: Date.now(), closedBy: currentUser.id }
          : mf
      )
    )
    toast.success('Master folio closed successfully')
  }

  const handleReopen = (masterFolioId: string) => {
    setMasterFolios((prev) =>
      prev.map(mf => 
        mf.id === masterFolioId 
          ? { ...mf, status: 'active' as const, closedAt: undefined, closedBy: undefined }
          : mf
      )
    )
    toast.success('Master folio reopened successfully')
  }

  const handleDelete = (masterFolioId: string) => {
    if (!confirm('Are you sure you want to delete this master folio? This will unlink all child folios.')) {
      return
    }

    setFolios((prev) =>
      prev.map(folio => 
        folio.masterFolioId === masterFolioId 
          ? { ...folio, masterFolioId: undefined }
          : folio
      )
    )

    setMasterFolios((prev) => prev.filter(mf => mf.id !== masterFolioId))
    toast.success('Master folio deleted successfully')
  }

  const filteredMasterFolios = masterFolios
    .filter(mf => activeTab === 'active' ? mf.status === 'active' : mf.status === 'closed')
    .filter(mf => {
      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      return (
        mf.name.toLowerCase().includes(search) ||
        mf.masterFolioNumber.toLowerCase().includes(search) ||
        mf.primaryContact.name.toLowerCase().includes(search) ||
        mf.primaryContact.company?.toLowerCase().includes(search)
      )
    })

  const getStatusBadge = (status: MasterFolio['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: MasterFolio['type']) => {
    const colors = {
      group: 'bg-blue-100 text-blue-800',
      corporate: 'bg-purple-100 text-purple-800',
      event: 'bg-orange-100 text-orange-800',
      'travel-agency': 'bg-cyan-100 text-cyan-800'
    }
    return (
      <Badge className={colors[type]}>
        {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Buildings size={28} className="text-primary" />
            Master Folio Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage group billing and master folios for corporate accounts and events
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus size={20} className="mr-2" />
          Create Master Folio
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlass 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, number, contact, or company..."
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'closed')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <CheckCircle size={16} />
              Active ({masterFolios.filter(mf => mf.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="closed" className="flex items-center gap-2">
              <X size={16} />
              Closed ({masterFolios.filter(mf => mf.status === 'closed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredMasterFolios.length === 0 ? (
              <div className="text-center py-12">
                <Buildings size={64} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No master folios found' : 'No master folios yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search criteria' 
                    : 'Create a master folio to manage group billing'}
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreate}>
                    <Plus size={20} className="mr-2" />
                    Create Your First Master Folio
                  </Button>
                )}
              </div>
            ) : (
              <div className="responsive-table-wrapper">
                <Table className="responsive-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Master Folio</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Primary Contact</TableHead>
                      <TableHead>Child Folios</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMasterFolios.map((masterFolio) => (
                      <TableRow key={masterFolio.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell onClick={() => handleView(masterFolio)}>
                          <div>
                            <p className="font-medium">{masterFolio.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {masterFolio.masterFolioNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(masterFolio.type)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{masterFolio.primaryContact.name}</p>
                            {masterFolio.primaryContact.company && (
                              <p className="text-sm text-muted-foreground">
                                {masterFolio.primaryContact.company}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Users size={14} />
                            {masterFolio.childFolioIds.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{formatCurrency(masterFolio.totalBalance)}</p>
                            {masterFolio.creditLimit && (
                              <p className="text-xs text-muted-foreground">
                                Limit: {formatCurrency(masterFolio.creditLimit)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(masterFolio.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <DotsThree size={20} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(masterFolio)}>
                                <Eye size={16} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {masterFolio.status === 'active' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(masterFolio)}>
                                    <Pencil size={16} className="mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleClose(masterFolio.id)}>
                                    <X size={16} className="mr-2" />
                                    Close Master Folio
                                  </DropdownMenuItem>
                                </>
                              )}
                              {masterFolio.status === 'closed' && (
                                <DropdownMenuItem onClick={() => handleReopen(masterFolio.id)}>
                                  <CheckCircle size={16} className="mr-2" />
                                  Reopen
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(masterFolio.id)}
                                className="text-destructive"
                              >
                                <Trash size={16} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Master Folios</h3>
            <Buildings size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{masterFolios.length}</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
            <CheckCircle size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">
            {masterFolios.filter(mf => mf.status === 'active').length}
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Child Folios</h3>
            <Receipt size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">
            {masterFolios.reduce((sum, mf) => sum + mf.childFolioIds.length, 0)}
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Outstanding</h3>
            <CurrencyDollar size={20} className="text-secondary" />
          </div>
          <p className="text-3xl font-semibold">
            {formatCurrency(
              masterFolios
                .filter(mf => mf.status === 'active')
                .reduce((sum, mf) => sum + mf.totalBalance, 0)
            )}
          </p>
        </Card>
      </div>

      <MasterFolioDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        masterFolio={selectedMasterFolio}
        folios={folios}
        reservations={reservations}
        guests={guests}
        onSave={handleSave}
        currentUser={currentUser}
      />

      {selectedMasterFolio && (
        <MasterFolioViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          masterFolio={selectedMasterFolio}
          folios={folios}
          reservations={reservations}
          guests={guests}
          onEdit={() => {
            setIsViewDialogOpen(false)
            setIsDialogOpen(true)
          }}
        />
      )}
    </div>
  )
}
