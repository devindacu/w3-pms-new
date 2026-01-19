import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  MagnifyingGlass,
  ShoppingCart,
  Receipt,
  ForkKnife,
  Coffee,
  Hamburger,
  Pizza,
  Wine,
  CheckCircle,
  Clock,
  XCircle,
  CookingPot,
  Truck,
  House,
  User,
  CurrencyDollar,
  Minus,
  Trash,
  X,
  Check
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { MenuItem, Order, OrderItem, Guest, Room } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { OrderDialog } from './OrderDialog'
import { MenuItemDialogEnhanced } from './MenuItemDialogEnhanced'
import { MenuCategoryDialog } from './MenuCategoryDialog'

interface FnBPOSProps {
  menuItems: MenuItem[]
  setMenuItems: (items: MenuItem[] | ((prev: MenuItem[]) => MenuItem[])) => void
  menuCategories: import('@/lib/types').MenuItemCategory[]
  setMenuCategories: (categories: import('@/lib/types').MenuItemCategory[] | ((prev: import('@/lib/types').MenuItemCategory[]) => import('@/lib/types').MenuItemCategory[])) => void
  orders: Order[]
  setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void
  guests: Guest[]
  rooms: Room[]
}

export function FnBPOS({ menuItems, setMenuItems, menuCategories, setMenuCategories, orders, setOrders, guests, rooms }: FnBPOSProps) {
  const [currentView, setCurrentView] = useState<'pos' | 'orders' | 'menu' | 'categories'>('pos')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [cart, setCart] = useState<OrderItem[]>([])
  const [orderType, setOrderType] = useState<'dine-in' | 'room-service' | 'takeaway'>('dine-in')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [tableNumber, setTableNumber] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | undefined>(undefined)
  const [editingCategory, setEditingCategory] = useState<import('@/lib/types').MenuItemCategory | undefined>(undefined)

  const categories = ['All', ...menuCategories.filter(c => c.isActive).map(c => c.name)]


  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory && item.available
  })

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menuItemId === menuItem.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const newItem: OrderItem = {
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price,
        status: 'pending'
      }
      setCart([...cart, newItem])
    }
    toast.success(`${menuItem.name} added to cart`)
  }

  const updateCartItemQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + delta
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
    toast.success('Item removed from cart')
  }

  const clearCart = () => {
    setCart([])
    setSelectedGuest(null)
    setSelectedRoom(null)
    setTableNumber('')
    setOrderNotes('')
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.1
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)
    return subtotal + tax
  }

  const placeOrder = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    if (orderType === 'room-service' && !selectedRoom) {
      toast.error('Please select a room for room service')
      return
    }

    if (orderType === 'dine-in' && !tableNumber) {
      toast.error('Please enter a table number')
      return
    }

    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)
    const total = calculateTotal()

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      type: orderType,
      guestId: selectedGuest?.id,
      roomId: selectedRoom?.id,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      items: cart,
      subtotal,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      notes: orderNotes,
      createdAt: Date.now(),
      createdBy: 'current-user'
    }

    setOrders((prev) => [newOrder, ...prev])
    toast.success(`Order ${newOrder.orderNumber} placed successfully`)
    clearCart()
  }

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status, completedAt: status === 'served' ? Date.now() : order.completedAt }
          : order
      )
    )
    toast.success(`Order status updated to ${status}`)
  }

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'ready': return 'bg-green-100 text-green-800 border-green-300'
      case 'served': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getOrderStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock size={16} />
      case 'preparing': return <CookingPot size={16} />
      case 'ready': return <CheckCircle size={16} />
      case 'served': return <Receipt size={16} />
      case 'cancelled': return <XCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase()
    if (lower.includes('beverage') || lower.includes('drink')) return <Coffee size={20} />
    if (lower.includes('main') || lower.includes('entree')) return <ForkKnife size={20} />
    if (lower.includes('appetizer') || lower.includes('starter')) return <Hamburger size={20} />
    if (lower.includes('dessert') || lower.includes('sweet')) return <Pizza size={20} />
    if (lower.includes('alcohol') || lower.includes('wine')) return <Wine size={20} />
    return <ForkKnife size={20} />
  }

  const activeOrders = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled')
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt)
    const today = new Date()
    return orderDate.toDateString() === today.toDateString()
  })
  const todayRevenue = todayOrders
    .filter(o => o.status === 'served')
    .reduce((sum, o) => sum + o.total, 0)

  const renderPOS = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => {
            setEditingMenuItem(undefined)
            setIsMenuItemDialogOpen(true)
          }}>
            <Plus size={18} className="mr-2" />
            Add Item
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category !== 'All' && <span className="mr-2">{getCategoryIcon(category)}</span>}
              {category}
            </Button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredMenuItems.map((item) => (
              <Card
                key={item.id}
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => addToCart(item)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                  <span className="text-lg font-bold text-primary">{formatCurrency(item.price)}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {item.preparationTime} min
                  </span>
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                </div>
              </Card>
            ))}
          </div>
          {filteredMenuItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ForkKnife size={48} className="mx-auto mb-2 opacity-50" />
              <p>No menu items found</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-hidden border-l pl-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ShoppingCart size={24} />
          Current Order
        </h3>

        <div className="flex gap-2">
          <Button
            variant={orderType === 'dine-in' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrderType('dine-in')}
            className="flex-1"
          >
            <House size={16} className="mr-1" />
            Dine-In
          </Button>
          <Button
            variant={orderType === 'room-service' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrderType('room-service')}
            className="flex-1"
          >
            <Truck size={16} className="mr-1" />
            Room Service
          </Button>
          <Button
            variant={orderType === 'takeaway' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrderType('takeaway')}
            className="flex-1"
          >
            <Coffee size={16} className="mr-1" />
            Takeaway
          </Button>
        </div>

        {orderType === 'dine-in' && (
          <Input
            placeholder="Table number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        )}

        {orderType === 'room-service' && (
          <div className="space-y-2">
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={selectedRoom?.id || ''}
              onChange={(e) => {
                const room = rooms.find(r => r.id === e.target.value)
                setSelectedRoom(room || null)
              }}
            >
              <option value="">Select Room</option>
              {rooms.filter(r => r.status.includes('occupied')).map(room => (
                <option key={room.id} value={room.id}>
                  Room {room.roomNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateCartItemQuantity(item.id, -1)}
                    className="h-7 w-7 p-0"
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateCartItemQuantity(item.id, 1)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                <span className="font-semibold w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFromCart(item.id)}
                  className="h-7 w-7 p-0 text-destructive"
                >
                  <Trash size={16} />
                </Button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium">{formatCurrency(calculateTax(calculateSubtotal()))}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={clearCart} className="flex-1">
                <X size={18} className="mr-2" />
                Clear
              </Button>
              <Button onClick={placeOrder} className="flex-1">
                <Check size={18} className="mr-2" />
                Place Order
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Orders</p>
              <p className="text-2xl font-bold">{activeOrders.length}</p>
            </div>
            <Clock size={32} className="text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Orders Today</p>
              <p className="text-2xl font-bold">{todayOrders.length}</p>
            </div>
            <Receipt size={32} className="text-blue-500" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue Today</p>
              <p className="text-2xl font-bold">{formatCurrency(todayRevenue)}</p>
            </div>
            <CurrencyDollar size={32} className="text-success" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Active Orders</h3>
        </div>
        <div className="p-4 space-y-3">
          {activeOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt size={48} className="mx-auto mb-2 opacity-50" />
              <p>No active orders</p>
            </div>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{order.orderNumber}</h4>
                      <Badge variant="outline" className="capitalize">
                        {order.type === 'room-service' ? (
                          <><Truck size={12} className="mr-1" /> Room Service</>
                        ) : order.type === 'dine-in' ? (
                          <><House size={12} className="mr-1" /> Dine-In</>
                        ) : (
                          <><Coffee size={12} className="mr-1" /> Takeaway</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.type === 'dine-in' && `Table ${order.tableNumber}`}
                      {order.type === 'room-service' && `Room ${rooms.find(r => r.id === order.roomId)?.roomNumber}`}
                      {order.type === 'takeaway' && 'Takeaway Order'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={`${getOrderStatusColor(order.status)} flex items-center gap-1`}>
                    {getOrderStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-1 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total: {formatCurrency(order.total)}</span>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                        <CookingPot size={16} className="mr-1" />
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'ready')}>
                        <CheckCircle size={16} className="mr-1" />
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'served')}>
                        <Receipt size={16} className="mr-1" />
                        Mark Served
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order)
                        setIsOrderDialogOpen(true)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.slice(0, 20).map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell className="capitalize">{order.type.replace('-', ' ')}</TableCell>
                <TableCell>{order.items.length} items</TableCell>
                <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <Badge className={`${getOrderStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                    {getOrderStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(order)
                      setIsOrderDialogOpen(true)
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )

  const renderMenu = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Menu Management</h2>
          <p className="text-muted-foreground">Manage your menu items and availability</p>
        </div>
        <Button onClick={() => {
          setEditingMenuItem(undefined)
          setIsMenuItemDialogOpen(true)
        }}>
          <Plus size={18} className="mr-2" />
          Add Menu Item
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Prep Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category}</Badge>
                </TableCell>
                <TableCell className="font-semibold">{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.preparationTime} min</TableCell>
                <TableCell>
                  {item.available ? (
                    <Badge className="bg-success text-success-foreground">Available</Badge>
                  ) : (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingMenuItem(item)
                        setIsMenuItemDialogOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMenuItems((prev) =>
                          prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i)
                        )
                        toast.success(`${item.name} is now ${item.available ? 'unavailable' : 'available'}`)
                      }}
                    >
                      {item.available ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold">F&B / POS</h1>
        <p className="text-muted-foreground mt-1">Point of Sale and order management</p>
      </div>

      <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)}>
        <TabsList>
          <TabsTrigger value="pos">
            <ShoppingCart size={18} className="mr-2" />
            Point of Sale
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Receipt size={18} className="mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="menu">
            <ForkKnife size={18} className="mr-2" />
            Menu Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="mt-6">
          {renderPOS()}
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          {renderOrders()}
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          {renderMenu()}
        </TabsContent>
      </Tabs>

      <OrderDialog
        order={selectedOrder}
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        guests={guests}
        rooms={rooms}
      />

      <MenuItemDialogEnhanced
        menuItem={editingMenuItem}
        categories={menuCategories}
        open={isMenuItemDialogOpen}
        onOpenChange={setIsMenuItemDialogOpen}
        onSave={(item) => {
          if (editingMenuItem) {
            setMenuItems((prev) => prev.map(i => i.id === item.id ? item : i))
            toast.success('Menu item updated successfully')
          } else {
            setMenuItems((prev) => [...prev, item])
            toast.success('Menu item added successfully')
          }
          setIsMenuItemDialogOpen(false)
          setEditingMenuItem(undefined)
        }}
      />

      <MenuCategoryDialog
        category={editingCategory}
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onSave={(category) => {
          if (editingCategory) {
            setMenuCategories((prev) => prev.map(c => c.id === category.id ? category : c))
            toast.success('Category updated successfully')
          } else {
            setMenuCategories((prev) => [...prev, category])
            toast.success('Category added successfully')
          }
          setIsCategoryDialogOpen(false)
          setEditingCategory(undefined)
        }}
      />
    </div>
  )
}
