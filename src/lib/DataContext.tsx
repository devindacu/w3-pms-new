import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  sampleGuests,
  sampleRooms,
  sampleReservations,
  sampleFolios,
  sampleInventory,
  sampleMenuItems,
  sampleHousekeepingTasks,
  sampleOrders,
  sampleSuppliers,
  sampleEmployees,
  sampleMaintenanceRequests,
  sampleSystemUsers,
} from '@/lib/sampleData';

interface DataContextType {
  guests: any[];
  rooms: any[];
  reservations: any[];
  folios: any[];
  inventory: any[];
  menuItems: any[];
  housekeepingTasks: any[];
  orders: any[];
  suppliers: any[];
  employees: any[];
  maintenanceRequests: any[];
  systemUsers: any[];
  extraServiceCategories: any[];
  extraServices: any[];
  accounts: any[];
  budgets: any[];
  costCenters: any[];
  profitCenters: any[];
  amenities: any[];
  shifts: any[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  setGuests: (guests: any[]) => void;
  setRooms: (rooms: any[]) => void;
  setReservations: (reservations: any[]) => void;
  setFolios: (folios: any[]) => void;
  setInventory: (inventory: any[]) => void;
  setMenuItems: (menuItems: any[]) => void;
  setHousekeepingTasks: (tasks: any[]) => void;
  setOrders: (orders: any[]) => void;
  setSuppliers: (suppliers: any[]) => void;
  setEmployees: (employees: any[]) => void;
  setMaintenanceRequests: (requests: any[]) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function transformDbToApp(data: any[], transformFn?: (item: any) => any): any[] {
  if (!data) return [];
  return data.map((item) => {
    const transformed = {
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now(),
      checkInDate: item.checkInDate ? new Date(item.checkInDate).getTime() : undefined,
      checkOutDate: item.checkOutDate ? new Date(item.checkOutDate).getTime() : undefined,
      timestamp: item.timestamp ? new Date(item.timestamp).getTime() : Date.now(),
      lastUpdated: item.lastUpdated ? new Date(item.lastUpdated).getTime() : Date.now(),
      expiryDate: item.expiryDate ? new Date(item.expiryDate).getTime() : undefined,
      startDate: item.startDate ? new Date(item.startDate).getTime() : undefined,
      endDate: item.endDate ? new Date(item.endDate).getTime() : undefined,
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth).getTime() : undefined,
      dateOfJoining: item.dateOfJoining ? new Date(item.dateOfJoining).getTime() : undefined,
      baseRate: item.baseRate ? parseFloat(item.baseRate) : item.baseRate,
      totalSpent: item.totalSpent ? parseFloat(item.totalSpent) : item.totalSpent,
      ratePerNight: item.ratePerNight ? parseFloat(item.ratePerNight) : item.ratePerNight,
      totalAmount: item.totalAmount ? parseFloat(item.totalAmount) : item.totalAmount,
      advancePaid: item.advancePaid ? parseFloat(item.advancePaid) : item.advancePaid,
      balance: item.balance ? parseFloat(item.balance) : item.balance,
      amount: item.amount ? parseFloat(item.amount) : item.amount,
      price: item.price ? parseFloat(item.price) : item.price,
      currentStock: item.currentStock ? parseFloat(item.currentStock) : item.currentStock,
      reorderLevel: item.reorderLevel ? parseFloat(item.reorderLevel) : item.reorderLevel,
      reorderQuantity: item.reorderQuantity ? parseFloat(item.reorderQuantity) : item.reorderQuantity,
      unitCost: item.unitCost ? parseFloat(item.unitCost) : item.unitCost,
      basePrice: item.basePrice ? parseFloat(item.basePrice) : item.basePrice,
      taxRate: item.taxRate ? parseFloat(item.taxRate) : item.taxRate,
      allocatedAmount: item.allocatedAmount ? parseFloat(item.allocatedAmount) : item.allocatedAmount,
      spentAmount: item.spentAmount ? parseFloat(item.spentAmount) : item.spentAmount,
      budget: item.budget ? parseFloat(item.budget) : item.budget,
      spent: item.spent ? parseFloat(item.spent) : item.spent,
      targetRevenue: item.targetRevenue ? parseFloat(item.targetRevenue) : item.targetRevenue,
      actualRevenue: item.actualRevenue ? parseFloat(item.actualRevenue) : item.actualRevenue,
      targetCost: item.targetCost ? parseFloat(item.targetCost) : item.targetCost,
      actualCost: item.actualCost ? parseFloat(item.actualCost) : item.actualCost,
      costPerUnit: item.costPerUnit ? parseFloat(item.costPerUnit) : item.costPerUnit,
      rating: item.rating ? parseFloat(item.rating) : item.rating,
      creditLimit: item.creditLimit ? parseFloat(item.creditLimit) : item.creditLimit,
    };
    return transformFn ? transformFn(transformed) : transformed;
  });
}

function DataProviderInner({ children }: { children: ReactNode }) {
  const [localGuests, setLocalGuests] = useState<any[]>([]);
  const [localRooms, setLocalRooms] = useState<any[]>([]);
  const [localReservations, setLocalReservations] = useState<any[]>([]);
  const [localFolios, setLocalFolios] = useState<any[]>([]);
  const [localInventory, setLocalInventory] = useState<any[]>([]);
  const [localMenuItems, setLocalMenuItems] = useState<any[]>([]);
  const [localHousekeepingTasks, setLocalHousekeepingTasks] = useState<any[]>([]);
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [localSuppliers, setLocalSuppliers] = useState<any[]>([]);
  const [localEmployees, setLocalEmployees] = useState<any[]>([]);
  const [localMaintenanceRequests, setLocalMaintenanceRequests] = useState<any[]>([]);

  const guestsQuery = useQuery({ queryKey: ['guests'], queryFn: api.guests.getAll });
  const roomsQuery = useQuery({ queryKey: ['rooms'], queryFn: api.rooms.getAll });
  const reservationsQuery = useQuery({ queryKey: ['reservations'], queryFn: api.reservations.getAll });
  const foliosQuery = useQuery({ queryKey: ['folios'], queryFn: api.folios.getAll });
  const inventoryQuery = useQuery({ queryKey: ['inventory'], queryFn: api.inventory.getAll });
  const menuItemsQuery = useQuery({ queryKey: ['menuItems'], queryFn: api.menuItems.getAll });
  const housekeepingTasksQuery = useQuery({ queryKey: ['housekeepingTasks'], queryFn: api.housekeepingTasks.getAll });
  const ordersQuery = useQuery({ queryKey: ['orders'], queryFn: api.orders.getAll });
  const suppliersQuery = useQuery({ queryKey: ['suppliers'], queryFn: api.suppliers.getAll });
  const employeesQuery = useQuery({ queryKey: ['employees'], queryFn: api.employees.getAll });
  const maintenanceQuery = useQuery({ queryKey: ['maintenanceRequests'], queryFn: api.maintenanceRequests.getAll });
  const systemUsersQuery = useQuery({ queryKey: ['systemUsers'], queryFn: api.systemUsers.getAll });
  const extraCategoriesQuery = useQuery({ queryKey: ['extraServiceCategories'], queryFn: api.extraServiceCategories.getAll });
  const extraServicesQuery = useQuery({ queryKey: ['extraServices'], queryFn: api.extraServices.getAll });
  const accountsQuery = useQuery({ queryKey: ['accounts'], queryFn: api.accounts.getAll });
  const budgetsQuery = useQuery({ queryKey: ['budgets'], queryFn: api.budgets.getAll });
  const costCentersQuery = useQuery({ queryKey: ['costCenters'], queryFn: api.costCenters.getAll });
  const profitCentersQuery = useQuery({ queryKey: ['profitCenters'], queryFn: api.profitCenters.getAll });
  const amenitiesQuery = useQuery({ queryKey: ['amenities'], queryFn: api.amenities.getAll });
  const shiftsQuery = useQuery({ queryKey: ['shifts'], queryFn: api.shifts.getAll });

  const isLoading = guestsQuery.isLoading || roomsQuery.isLoading || reservationsQuery.isLoading;
  const isError = guestsQuery.isError && roomsQuery.isError;

  useEffect(() => {
    if (guestsQuery.data) setLocalGuests(transformDbToApp(guestsQuery.data));
  }, [guestsQuery.data]);

  useEffect(() => {
    if (roomsQuery.data) setLocalRooms(transformDbToApp(roomsQuery.data));
  }, [roomsQuery.data]);

  useEffect(() => {
    if (reservationsQuery.data) setLocalReservations(transformDbToApp(reservationsQuery.data));
  }, [reservationsQuery.data]);

  useEffect(() => {
    if (foliosQuery.data) setLocalFolios(transformDbToApp(foliosQuery.data));
  }, [foliosQuery.data]);

  useEffect(() => {
    if (inventoryQuery.data) setLocalInventory(transformDbToApp(inventoryQuery.data));
  }, [inventoryQuery.data]);

  useEffect(() => {
    if (menuItemsQuery.data) setLocalMenuItems(transformDbToApp(menuItemsQuery.data));
  }, [menuItemsQuery.data]);

  useEffect(() => {
    if (housekeepingTasksQuery.data) setLocalHousekeepingTasks(transformDbToApp(housekeepingTasksQuery.data));
  }, [housekeepingTasksQuery.data]);

  useEffect(() => {
    if (ordersQuery.data) setLocalOrders(transformDbToApp(ordersQuery.data));
  }, [ordersQuery.data]);

  useEffect(() => {
    if (suppliersQuery.data) setLocalSuppliers(transformDbToApp(suppliersQuery.data));
  }, [suppliersQuery.data]);

  useEffect(() => {
    if (employeesQuery.data) setLocalEmployees(transformDbToApp(employeesQuery.data));
  }, [employeesQuery.data]);

  useEffect(() => {
    if (maintenanceQuery.data) setLocalMaintenanceRequests(transformDbToApp(maintenanceQuery.data));
  }, [maintenanceQuery.data]);

  const guests = localGuests.length > 0 ? localGuests : sampleGuests;
  const rooms = localRooms.length > 0 ? localRooms : sampleRooms;
  const reservations = localReservations.length > 0 ? localReservations : sampleReservations;
  const folios = localFolios.length > 0 ? localFolios : sampleFolios;
  const inventory = localInventory.length > 0 ? localInventory : sampleInventory;
  const menuItems = localMenuItems.length > 0 ? localMenuItems : sampleMenuItems;
  const housekeepingTasks = localHousekeepingTasks.length > 0 ? localHousekeepingTasks : sampleHousekeepingTasks;
  const orders = localOrders.length > 0 ? localOrders : sampleOrders;
  const suppliers = localSuppliers.length > 0 ? localSuppliers : sampleSuppliers;
  const employees = localEmployees.length > 0 ? localEmployees : sampleEmployees;
  const maintenanceRequests = localMaintenanceRequests.length > 0 ? localMaintenanceRequests : sampleMaintenanceRequests;
  const systemUsers = transformDbToApp(systemUsersQuery.data || []).length > 0 ? transformDbToApp(systemUsersQuery.data || []) : sampleSystemUsers;

  const refetch = () => {
    guestsQuery.refetch();
    roomsQuery.refetch();
    reservationsQuery.refetch();
    foliosQuery.refetch();
    inventoryQuery.refetch();
    menuItemsQuery.refetch();
    housekeepingTasksQuery.refetch();
    ordersQuery.refetch();
    suppliersQuery.refetch();
    employeesQuery.refetch();
    maintenanceQuery.refetch();
    systemUsersQuery.refetch();
    extraCategoriesQuery.refetch();
    extraServicesQuery.refetch();
    accountsQuery.refetch();
    budgetsQuery.refetch();
    costCentersQuery.refetch();
    profitCentersQuery.refetch();
    amenitiesQuery.refetch();
    shiftsQuery.refetch();
  };

  return (
    <DataContext.Provider
      value={{
        guests,
        rooms,
        reservations,
        folios,
        inventory,
        menuItems,
        housekeepingTasks,
        orders,
        suppliers,
        employees,
        maintenanceRequests,
        systemUsers,
        extraServiceCategories: transformDbToApp(extraCategoriesQuery.data || []),
        extraServices: transformDbToApp(extraServicesQuery.data || []),
        accounts: transformDbToApp(accountsQuery.data || []),
        budgets: transformDbToApp(budgetsQuery.data || []),
        costCenters: transformDbToApp(costCentersQuery.data || []),
        profitCenters: transformDbToApp(profitCentersQuery.data || []),
        amenities: transformDbToApp(amenitiesQuery.data || []),
        shifts: transformDbToApp(shiftsQuery.data || []),
        isLoading,
        isError,
        refetch,
        setGuests: setLocalGuests,
        setRooms: setLocalRooms,
        setReservations: setLocalReservations,
        setFolios: setLocalFolios,
        setInventory: setLocalInventory,
        setMenuItems: setLocalMenuItems,
        setHousekeepingTasks: setLocalHousekeepingTasks,
        setOrders: setLocalOrders,
        setSuppliers: setLocalSuppliers,
        setEmployees: setLocalEmployees,
        setMaintenanceRequests: setLocalMaintenanceRequests,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function DataProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProviderInner>{children}</DataProviderInner>
    </QueryClientProvider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
