import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useGuests() {
  return useQuery({
    queryKey: ['guests'],
    queryFn: api.guests.getAll,
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.guests.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guests'] }),
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.guests.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guests'] }),
  });
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: api.rooms.getAll,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.rooms.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.rooms.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: api.reservations.getAll,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.reservations.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.reservations.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });
}

export function useFolios() {
  return useQuery({
    queryKey: ['folios'],
    queryFn: api.folios.getAll,
  });
}

export function useFolioCharges() {
  return useQuery({
    queryKey: ['folioCharges'],
    queryFn: api.folioCharges.getAll,
  });
}

export function useFolioPayments() {
  return useQuery({
    queryKey: ['folioPayments'],
    queryFn: api.folioPayments.getAll,
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: api.inventory.getAll,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.inventory.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.inventory.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useHousekeepingTasks() {
  return useQuery({
    queryKey: ['housekeepingTasks'],
    queryFn: api.housekeepingTasks.getAll,
  });
}

export function useCreateHousekeepingTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.housekeepingTasks.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeepingTasks'] }),
  });
}

export function useUpdateHousekeepingTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.housekeepingTasks.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeepingTasks'] }),
  });
}

export function useMenuItems() {
  return useQuery({
    queryKey: ['menuItems'],
    queryFn: api.menuItems.getAll,
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.menuItems.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menuItems'] }),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: api.orders.getAll,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.orders.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: api.suppliers.getAll,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.suppliers.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.suppliers.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: api.employees.getAll,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.employees.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useMaintenanceRequests() {
  return useQuery({
    queryKey: ['maintenanceRequests'],
    queryFn: api.maintenanceRequests.getAll,
  });
}

export function useRequisitions() {
  return useQuery({
    queryKey: ['requisitions'],
    queryFn: api.requisitions.getAll,
  });
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.requisitions.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requisitions'] }),
  });
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: api.purchaseOrders.getAll,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.purchaseOrders.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  });
}

export function useGRNs() {
  return useQuery({
    queryKey: ['grns'],
    queryFn: api.grns.getAll,
  });
}

export function useSystemUsers() {
  return useQuery({
    queryKey: ['systemUsers'],
    queryFn: api.systemUsers.getAll,
  });
}

export function useActivityLogs() {
  return useQuery({
    queryKey: ['activityLogs'],
    queryFn: api.activityLogs.getAll,
  });
}

export function useExtraServiceCategories() {
  return useQuery({
    queryKey: ['extraServiceCategories'],
    queryFn: api.extraServiceCategories.getAll,
  });
}

export function useExtraServices() {
  return useQuery({
    queryKey: ['extraServices'],
    queryFn: api.extraServices.getAll,
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: api.accounts.getAll,
  });
}

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: api.payments.getAll,
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: api.expenses.getAll,
  });
}

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: api.budgets.getAll,
  });
}

export function useCostCenters() {
  return useQuery({
    queryKey: ['costCenters'],
    queryFn: api.costCenters.getAll,
  });
}

export function useProfitCenters() {
  return useQuery({
    queryKey: ['profitCenters'],
    queryFn: api.profitCenters.getAll,
  });
}

export function useAmenities() {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: api.amenities.getAll,
  });
}

export function useAttendances() {
  return useQuery({
    queryKey: ['attendances'],
    queryFn: api.attendances.getAll,
  });
}

export function useLeaveRequests() {
  return useQuery({
    queryKey: ['leaveRequests'],
    queryFn: api.leaveRequests.getAll,
  });
}

export function useShifts() {
  return useQuery({
    queryKey: ['shifts'],
    queryFn: api.shifts.getAll,
  });
}

export function useDutyRosters() {
  return useQuery({
    queryKey: ['dutyRosters'],
    queryFn: api.dutyRosters.getAll,
  });
}
