import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sparkle,
  Plus,
  ArrowRight,
  Package,
  CheckCircle,
  Warning,
  TrendUp,
  TrendDown,
} from '@phosphor-icons/react';
import { useKV } from '@/hooks/use-kv';
import { toast } from 'sonner';

interface LinenItem {
  id: number;
  type: 'bed-sheet' | 'pillow-case' | 'towel' | 'bath-mat' | 'duvet-cover' | 'blanket' | 'other';
  size?: string;
  color?: string;
  totalQuantity: number;
  cleanQuantity: number;
  dirtyQuantity: number;
  inLaundryQuantity: number;
  damagedQuantity: number;
  minimumQuantity: number;
  location: string;
  cost: number;
  supplier?: string;
  purchaseDate?: string;
  lastInventoryDate?: string;
}

interface LinenTransaction {
  id: number;
  date: string;
  type: 'issue' | 'return' | 'laundry-out' | 'laundry-in' | 'damage' | 'purchase' | 'disposal';
  itemId: number;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  issuedBy: string;
  roomNumber?: string;
  notes?: string;
}

export function LinenTrackingSystem() {
  const [items, setItems] = useKV<LinenItem[]>('linenItems', []);
  const [transactions, setTransactions] = useKV<LinenTransaction[]>('linenTransactions', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LinenItem | null>(null);

  const [formData, setFormData] = useState<Partial<LinenItem>>({
    type: 'bed-sheet',
    size: '',
    color: '',
    totalQuantity: 0,
    cleanQuantity: 0,
    dirtyQuantity: 0,
    inLaundryQuantity: 0,
    damagedQuantity: 0,
    minimumQuantity: 10,
    location: 'Linen Room',
    cost: 0,
  });

  const [transactionData, setTransactionData] = useState<Partial<LinenTransaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'issue',
    quantity: 1,
    fromLocation: 'Linen Room',
    toLocation: '',
    issuedBy: '',
    roomNumber: '',
  });

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: LinenItem = {
      id: Date.now(),
      ...formData,
    } as LinenItem;

    setItems([...items, newItem]);
    toast.success('Linen item added');
    setFormData({
      type: 'bed-sheet',
      size: '',
      color: '',
      totalQuantity: 0,
      cleanQuantity: 0,
      dirtyQuantity: 0,
      inLaundryQuantity: 0,
      damagedQuantity: 0,
      minimumQuantity: 10,
      location: 'Linen Room',
      cost: 0,
    });
    setIsDialogOpen(false);
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem || !transactionData.quantity || !transactionData.issuedBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTransaction: LinenTransaction = {
      id: Date.now(),
      itemId: selectedItem.id,
      ...transactionData,
    } as LinenTransaction;

    // Update item quantities based on transaction type
    const updatedItems = items.map((item) => {
      if (item.id === selectedItem.id) {
        const qty = transactionData.quantity || 0;
        let updated = { ...item };

        switch (transactionData.type) {
          case 'issue':
            updated.cleanQuantity = Math.max(0, item.cleanQuantity - qty);
            break;
          case 'return':
            updated.dirtyQuantity += qty;
            break;
          case 'laundry-out':
            updated.dirtyQuantity = Math.max(0, item.dirtyQuantity - qty);
            updated.inLaundryQuantity += qty;
            break;
          case 'laundry-in':
            updated.inLaundryQuantity = Math.max(0, item.inLaundryQuantity - qty);
            updated.cleanQuantity += qty;
            break;
          case 'damage':
            updated.cleanQuantity = Math.max(0, item.cleanQuantity - qty);
            updated.damagedQuantity += qty;
            break;
          case 'purchase':
            updated.totalQuantity += qty;
            updated.cleanQuantity += qty;
            break;
          case 'disposal':
            updated.totalQuantity = Math.max(0, item.totalQuantity - qty);
            updated.damagedQuantity = Math.max(0, item.damagedQuantity - qty);
            break;
        }

        return updated;
      }
      return item;
    });

    setItems(updatedItems);
    setTransactions([...transactions, newTransaction]);
    toast.success('Transaction recorded');
    setTransactionData({
      date: new Date().toISOString().split('T')[0],
      type: 'issue',
      quantity: 1,
      fromLocation: 'Linen Room',
      toLocation: '',
      issuedBy: '',
      roomNumber: '',
    });
    setIsTransactionDialogOpen(false);
  };

  const stats = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.totalQuantity, 0);
    const clean = items.reduce((sum, item) => sum + item.cleanQuantity, 0);
    const dirty = items.reduce((sum, item) => sum + item.dirtyQuantity, 0);
    const inLaundry = items.reduce((sum, item) => sum + item.inLaundryQuantity, 0);
    const damaged = items.reduce((sum, item) => sum + item.damagedQuantity, 0);
    const lowStock = items.filter(
      (item) => item.cleanQuantity < item.minimumQuantity
    ).length;

    return { total, clean, dirty, inLaundry, damaged, lowStock };
  }, [items]);

  const getStatusColor = (item: LinenItem) => {
    if (item.cleanQuantity < item.minimumQuantity) {
      return 'text-destructive';
    }
    if (item.cleanQuantity < item.minimumQuantity * 1.5) {
      return 'text-accent';
    }
    return 'text-success';
  };

  const formatLinenType = (type: string) => {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Linen Tracking</h2>
          <p className="text-muted-foreground">
            Monitor and manage hotel linen inventory
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={20} weight="bold" className="mr-2" />
              Add Linen Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Linen Type</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bed-sheet">Bed Sheet</SelectItem>
                      <SelectItem value="pillow-case">Pillow Case</SelectItem>
                      <SelectItem value="towel">Towel</SelectItem>
                      <SelectItem value="bath-mat">Bath Mat</SelectItem>
                      <SelectItem value="duvet-cover">Duvet Cover</SelectItem>
                      <SelectItem value="blanket">Blanket</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g., King, Queen, Twin"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g., White"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalQuantity">Total Quantity *</Label>
                  <Input
                    id="totalQuantity"
                    type="number"
                    value={formData.totalQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, totalQuantity: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cleanQuantity">Clean Quantity *</Label>
                  <Input
                    id="cleanQuantity"
                    type="number"
                    value={formData.cleanQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, cleanQuantity: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumQuantity">Minimum Quantity *</Label>
                  <Input
                    id="minimumQuantity"
                    type="number"
                    value={formData.minimumQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, minimumQuantity: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost per Item</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Linen Type</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clean</CardTitle>
            <Sparkle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.clean}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dirty</CardTitle>
            <TrendDown className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.dirty}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Laundry</CardTitle>
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inLaundry}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Damaged</CardTitle>
            <Warning className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.damaged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Warning className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.lowStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Linen Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Linen Inventory</CardTitle>
          <CardDescription>Current stock levels for all linen types</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Size/Color</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Clean</TableHead>
                <TableHead className="text-right">Dirty</TableHead>
                <TableHead className="text-right">In Laundry</TableHead>
                <TableHead className="text-right">Damaged</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{formatLinenType(item.type)}</TableCell>
                  <TableCell>
                    {item.size && item.color
                      ? `${item.size} / ${item.color}`
                      : item.size || item.color || '-'}
                  </TableCell>
                  <TableCell className="text-right">{item.totalQuantity}</TableCell>
                  <TableCell className={`text-right font-bold ${getStatusColor(item)}`}>
                    {item.cleanQuantity}
                  </TableCell>
                  <TableCell className="text-right">{item.dirtyQuantity}</TableCell>
                  <TableCell className="text-right">{item.inLaundryQuantity}</TableCell>
                  <TableCell className="text-right">{item.damagedQuantity}</TableCell>
                  <TableCell>
                    {item.cleanQuantity < item.minimumQuantity ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : item.cleanQuantity < item.minimumQuantity * 1.5 ? (
                      <Badge variant="outline" className="border-accent text-accent">
                        Warning
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-success text-success">
                        Good
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsTransactionDialogOpen(true);
                      }}
                    >
                      Record Transaction
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {items.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No linen items found. Add your first linen type to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Record Linen Transaction
              {selectedItem && ` - ${formatLinenType(selectedItem.type)}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTransaction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Select
                value={transactionData.type}
                onValueChange={(value) => setTransactionData({ ...transactionData, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issue">Issue (to room)</SelectItem>
                  <SelectItem value="return">Return (from room)</SelectItem>
                  <SelectItem value="laundry-out">Send to Laundry</SelectItem>
                  <SelectItem value="laundry-in">Return from Laundry</SelectItem>
                  <SelectItem value="damage">Mark as Damaged</SelectItem>
                  <SelectItem value="purchase">New Purchase</SelectItem>
                  <SelectItem value="disposal">Dispose</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={transactionData.quantity}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, quantity: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={transactionData.roomNumber}
                  onChange={(e) => setTransactionData({ ...transactionData, roomNumber: e.target.value })}
                  placeholder="e.g., 101"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuedBy">Issued/Handled By *</Label>
              <Input
                id="issuedBy"
                value={transactionData.issuedBy}
                onChange={(e) => setTransactionData({ ...transactionData, issuedBy: e.target.value })}
                placeholder="Staff name"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTransactionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Record Transaction</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
