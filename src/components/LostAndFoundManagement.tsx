import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Package,
  MagnifyingGlass,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Calendar,
  MapPin,
} from '@phosphor-icons/react';
import { useKV } from '@/hooks/use-kv';
import { toast } from 'sonner';

interface LostAndFoundItem {
  id: number;
  itemName: string;
  description: string;
  category: 'electronics' | 'clothing' | 'jewelry' | 'documents' | 'accessories' | 'other';
  location: string;
  roomNumber?: string;
  foundDate: string;
  foundBy: string;
  status: 'stored' | 'claimed' | 'disposed';
  claimedBy?: string;
  claimedDate?: string;
  contactInfo?: string;
  storageLocation: string;
  images?: string[];
  notes?: string;
  disposalDate?: string;
}

export function LostAndFoundManagement() {
  const [items, setItems] = useKV<LostAndFoundItem[]>('lostAndFoundItems', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LostAndFoundItem | null>(null);

  const [formData, setFormData] = useState<Partial<LostAndFoundItem>>({
    itemName: '',
    description: '',
    category: 'other',
    location: '',
    roomNumber: '',
    foundDate: new Date().toISOString().split('T')[0],
    foundBy: '',
    status: 'stored',
    storageLocation: '',
    notes: '',
  });

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemName || !formData.foundDate || !formData.foundBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingItem) {
      // Update existing item
      setItems(
        items.map((item) =>
          item.id === editingItem.id ? { ...editingItem, ...formData } : item
        )
      );
      toast.success('Lost & Found item updated');
    } else {
      // Create new item
      const newItem: LostAndFoundItem = {
        id: Date.now(),
        ...formData,
      } as LostAndFoundItem;

      setItems([...items, newItem]);
      toast.success('Lost & Found item added');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleMarkAsClaimed = (item: LostAndFoundItem) => {
    setItems(
      items.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: 'claimed',
              claimedDate: new Date().toISOString().split('T')[0],
            }
          : i
      )
    );
    toast.success('Item marked as claimed');
  };

  const handleMarkAsDisposed = (item: LostAndFoundItem) => {
    setItems(
      items.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: 'disposed',
              disposalDate: new Date().toISOString().split('T')[0],
            }
          : i
      )
    );
    toast.success('Item marked as disposed');
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      description: '',
      category: 'other',
      location: '',
      roomNumber: '',
      foundDate: new Date().toISOString().split('T')[0],
      foundBy: '',
      status: 'stored',
      storageLocation: '',
      notes: '',
    });
    setEditingItem(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stored':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Stored</Badge>;
      case 'claimed':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Claimed</Badge>;
      case 'disposed':
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/20">Disposed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    return <Package size={16} weight="fill" />;
  };

  const stats = {
    total: items.length,
    stored: items.filter((i) => i.status === 'stored').length,
    claimed: items.filter((i) => i.status === 'claimed').length,
    disposed: items.filter((i) => i.status === 'disposed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lost & Found</h2>
          <p className="text-muted-foreground">
            Track and manage lost items found in the hotel
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus size={20} weight="bold" className="mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Lost & Found Item' : 'Add New Lost & Found Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    placeholder="e.g., Black Wallet"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="jewelry">Jewelry</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the item"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location Found</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Lobby, Restaurant"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number (if applicable)</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g., 101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foundDate">Date Found *</Label>
                  <Input
                    id="foundDate"
                    type="date"
                    value={formData.foundDate}
                    onChange={(e) => setFormData({ ...formData, foundDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundBy">Found By *</Label>
                  <Input
                    id="foundBy"
                    value={formData.foundBy}
                    onChange={(e) => setFormData({ ...formData, foundBy: e.target.value })}
                    placeholder="Staff name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageLocation">Storage Location</Label>
                <Input
                  id="storageLocation"
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  placeholder="e.g., Lost & Found Room, Shelf A3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information (if claimed)</Label>
                <Input
                  id="contactInfo"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  placeholder="Phone or email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">In Storage</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.stored}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claimed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.claimed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disposed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.disposed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Lost & Found Items</CardTitle>
          <CardDescription>
            All items found in the hotel premises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlass
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="stored">Stored</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Found Date</TableHead>
                <TableHead>Found By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.itemName}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin size={14} />
                      {item.location}
                      {item.roomNumber && ` - Room ${item.roomNumber}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar size={14} />
                      {new Date(item.foundDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{item.foundBy}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {item.status === 'stored' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsClaimed(item)}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Claim
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsDisposed(item)}
                          >
                            <XCircle size={16} className="mr-1" />
                            Dispose
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingItem(item);
                          setFormData(item);
                          setIsDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No lost and found items found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
