import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "./db";
import { 
  guests, rooms, reservations, folios, folioCharges, folioPayments,
  inventoryItems, housekeepingTasks, menuItems, orders, orderItems,
  suppliers, employees, maintenanceRequests, requisitions, purchaseOrders,
  goodsReceivedNotes, systemUsers, activityLogs, extraServiceCategories,
  extraServices, accounts, payments, expenses, budgets, costCenters,
  profitCenters, amenities, attendances, leaveRequests, shifts, dutyRosters
} from "../shared/schema";
import { eq } from "drizzle-orm";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/guests", async (_, res) => {
  try {
    const data = await db.select().from(guests);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch guests" });
  }
});

app.post("/api/guests", async (req, res) => {
  try {
    const [guest] = await db.insert(guests).values(req.body).returning();
    res.json(guest);
  } catch (error) {
    res.status(500).json({ error: "Failed to create guest" });
  }
});

app.put("/api/guests/:id", async (req, res) => {
  try {
    const [guest] = await db.update(guests).set(req.body).where(eq(guests.id, req.params.id)).returning();
    res.json(guest);
  } catch (error) {
    res.status(500).json({ error: "Failed to update guest" });
  }
});

app.delete("/api/guests/:id", async (req, res) => {
  try {
    await db.delete(guests).where(eq(guests.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete guest" });
  }
});

app.get("/api/rooms", async (_, res) => {
  try {
    const data = await db.select().from(rooms);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

app.post("/api/rooms", async (req, res) => {
  try {
    const [room] = await db.insert(rooms).values(req.body).returning();
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

app.put("/api/rooms/:id", async (req, res) => {
  try {
    const [room] = await db.update(rooms).set(req.body).where(eq(rooms.id, req.params.id)).returning();
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: "Failed to update room" });
  }
});

app.get("/api/reservations", async (_, res) => {
  try {
    const data = await db.select().from(reservations);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

app.post("/api/reservations", async (req, res) => {
  try {
    const [reservation] = await db.insert(reservations).values(req.body).returning();
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

app.put("/api/reservations/:id", async (req, res) => {
  try {
    const [reservation] = await db.update(reservations).set(req.body).where(eq(reservations.id, req.params.id)).returning();
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: "Failed to update reservation" });
  }
});

app.get("/api/folios", async (_, res) => {
  try {
    const data = await db.select().from(folios);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch folios" });
  }
});

app.post("/api/folios", async (req, res) => {
  try {
    const [folio] = await db.insert(folios).values(req.body).returning();
    res.json(folio);
  } catch (error) {
    res.status(500).json({ error: "Failed to create folio" });
  }
});

app.get("/api/folio-charges", async (_, res) => {
  try {
    const data = await db.select().from(folioCharges);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch folio charges" });
  }
});

app.post("/api/folio-charges", async (req, res) => {
  try {
    const [charge] = await db.insert(folioCharges).values(req.body).returning();
    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: "Failed to create folio charge" });
  }
});

app.get("/api/folio-payments", async (_, res) => {
  try {
    const data = await db.select().from(folioPayments);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch folio payments" });
  }
});

app.post("/api/folio-payments", async (req, res) => {
  try {
    const [payment] = await db.insert(folioPayments).values(req.body).returning();
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create folio payment" });
  }
});

app.get("/api/inventory", async (_, res) => {
  try {
    const data = await db.select().from(inventoryItems);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const [item] = await db.insert(inventoryItems).values(req.body).returning();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to create inventory item" });
  }
});

app.put("/api/inventory/:id", async (req, res) => {
  try {
    const [item] = await db.update(inventoryItems).set(req.body).where(eq(inventoryItems.id, req.params.id)).returning();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});

app.get("/api/housekeeping-tasks", async (_, res) => {
  try {
    const data = await db.select().from(housekeepingTasks);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch housekeeping tasks" });
  }
});

app.post("/api/housekeeping-tasks", async (req, res) => {
  try {
    const [task] = await db.insert(housekeepingTasks).values(req.body).returning();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create housekeeping task" });
  }
});

app.put("/api/housekeeping-tasks/:id", async (req, res) => {
  try {
    const [task] = await db.update(housekeepingTasks).set(req.body).where(eq(housekeepingTasks.id, req.params.id)).returning();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to update housekeeping task" });
  }
});

app.get("/api/menu-items", async (_, res) => {
  try {
    const data = await db.select().from(menuItems);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

app.post("/api/menu-items", async (req, res) => {
  try {
    const [item] = await db.insert(menuItems).values(req.body).returning();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to create menu item" });
  }
});

app.put("/api/menu-items/:id", async (req, res) => {
  try {
    const [item] = await db.update(menuItems).set(req.body).where(eq(menuItems.id, req.params.id)).returning();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

app.get("/api/orders", async (_, res) => {
  try {
    const data = await db.select().from(orders);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const [order] = await db.insert(orders).values(req.body).returning();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.put("/api/orders/:id", async (req, res) => {
  try {
    const [order] = await db.update(orders).set(req.body).where(eq(orders.id, req.params.id)).returning();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

app.get("/api/suppliers", async (_, res) => {
  try {
    const data = await db.select().from(suppliers);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

app.post("/api/suppliers", async (req, res) => {
  try {
    const [supplier] = await db.insert(suppliers).values(req.body).returning();
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Failed to create supplier" });
  }
});

app.put("/api/suppliers/:id", async (req, res) => {
  try {
    const [supplier] = await db.update(suppliers).set(req.body).where(eq(suppliers.id, req.params.id)).returning();
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Failed to update supplier" });
  }
});

app.get("/api/employees", async (_, res) => {
  try {
    const data = await db.select().from(employees);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const [employee] = await db.insert(employees).values(req.body).returning();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: "Failed to create employee" });
  }
});

app.put("/api/employees/:id", async (req, res) => {
  try {
    const [employee] = await db.update(employees).set(req.body).where(eq(employees.id, req.params.id)).returning();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: "Failed to update employee" });
  }
});

app.get("/api/maintenance-requests", async (_, res) => {
  try {
    const data = await db.select().from(maintenanceRequests);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch maintenance requests" });
  }
});

app.post("/api/maintenance-requests", async (req, res) => {
  try {
    const [request] = await db.insert(maintenanceRequests).values(req.body).returning();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to create maintenance request" });
  }
});

app.put("/api/maintenance-requests/:id", async (req, res) => {
  try {
    const [request] = await db.update(maintenanceRequests).set(req.body).where(eq(maintenanceRequests.id, req.params.id)).returning();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to update maintenance request" });
  }
});

app.get("/api/requisitions", async (_, res) => {
  try {
    const data = await db.select().from(requisitions);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch requisitions" });
  }
});

app.post("/api/requisitions", async (req, res) => {
  try {
    const [requisition] = await db.insert(requisitions).values(req.body).returning();
    res.json(requisition);
  } catch (error) {
    res.status(500).json({ error: "Failed to create requisition" });
  }
});

app.put("/api/requisitions/:id", async (req, res) => {
  try {
    const [requisition] = await db.update(requisitions).set(req.body).where(eq(requisitions.id, req.params.id)).returning();
    res.json(requisition);
  } catch (error) {
    res.status(500).json({ error: "Failed to update requisition" });
  }
});

app.get("/api/purchase-orders", async (_, res) => {
  try {
    const data = await db.select().from(purchaseOrders);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch purchase orders" });
  }
});

app.post("/api/purchase-orders", async (req, res) => {
  try {
    const [po] = await db.insert(purchaseOrders).values(req.body).returning();
    res.json(po);
  } catch (error) {
    res.status(500).json({ error: "Failed to create purchase order" });
  }
});

app.put("/api/purchase-orders/:id", async (req, res) => {
  try {
    const [po] = await db.update(purchaseOrders).set(req.body).where(eq(purchaseOrders.id, req.params.id)).returning();
    res.json(po);
  } catch (error) {
    res.status(500).json({ error: "Failed to update purchase order" });
  }
});

app.get("/api/grns", async (_, res) => {
  try {
    const data = await db.select().from(goodsReceivedNotes);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch GRNs" });
  }
});

app.post("/api/grns", async (req, res) => {
  try {
    const [grn] = await db.insert(goodsReceivedNotes).values(req.body).returning();
    res.json(grn);
  } catch (error) {
    res.status(500).json({ error: "Failed to create GRN" });
  }
});

app.get("/api/system-users", async (_, res) => {
  try {
    const data = await db.select().from(systemUsers);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch system users" });
  }
});

app.post("/api/system-users", async (req, res) => {
  try {
    const [user] = await db.insert(systemUsers).values(req.body).returning();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create system user" });
  }
});

app.get("/api/activity-logs", async (_, res) => {
  try {
    const data = await db.select().from(activityLogs);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

app.post("/api/activity-logs", async (req, res) => {
  try {
    const [log] = await db.insert(activityLogs).values(req.body).returning();
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: "Failed to create activity log" });
  }
});

app.get("/api/extra-service-categories", async (_, res) => {
  try {
    const data = await db.select().from(extraServiceCategories);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch extra service categories" });
  }
});

app.post("/api/extra-service-categories", async (req, res) => {
  try {
    const [category] = await db.insert(extraServiceCategories).values(req.body).returning();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create extra service category" });
  }
});

app.get("/api/extra-services", async (_, res) => {
  try {
    const data = await db.select().from(extraServices);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch extra services" });
  }
});

app.post("/api/extra-services", async (req, res) => {
  try {
    const [service] = await db.insert(extraServices).values(req.body).returning();
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to create extra service" });
  }
});

app.get("/api/accounts", async (_, res) => {
  try {
    const data = await db.select().from(accounts);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

app.post("/api/accounts", async (req, res) => {
  try {
    const [account] = await db.insert(accounts).values(req.body).returning();
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to create account" });
  }
});

app.get("/api/payments", async (_, res) => {
  try {
    const data = await db.select().from(payments);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

app.post("/api/payments", async (req, res) => {
  try {
    const [payment] = await db.insert(payments).values(req.body).returning();
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment" });
  }
});

app.get("/api/expenses", async (_, res) => {
  try {
    const data = await db.select().from(expenses);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    const [expense] = await db.insert(expenses).values(req.body).returning();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: "Failed to create expense" });
  }
});

app.get("/api/budgets", async (_, res) => {
  try {
    const data = await db.select().from(budgets);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

app.post("/api/budgets", async (req, res) => {
  try {
    const [budget] = await db.insert(budgets).values(req.body).returning();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: "Failed to create budget" });
  }
});

app.get("/api/cost-centers", async (_, res) => {
  try {
    const data = await db.select().from(costCenters);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cost centers" });
  }
});

app.post("/api/cost-centers", async (req, res) => {
  try {
    const [center] = await db.insert(costCenters).values(req.body).returning();
    res.json(center);
  } catch (error) {
    res.status(500).json({ error: "Failed to create cost center" });
  }
});

app.get("/api/profit-centers", async (_, res) => {
  try {
    const data = await db.select().from(profitCenters);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profit centers" });
  }
});

app.post("/api/profit-centers", async (req, res) => {
  try {
    const [center] = await db.insert(profitCenters).values(req.body).returning();
    res.json(center);
  } catch (error) {
    res.status(500).json({ error: "Failed to create profit center" });
  }
});

app.get("/api/amenities", async (_, res) => {
  try {
    const data = await db.select().from(amenities);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch amenities" });
  }
});

app.post("/api/amenities", async (req, res) => {
  try {
    const [amenity] = await db.insert(amenities).values(req.body).returning();
    res.json(amenity);
  } catch (error) {
    res.status(500).json({ error: "Failed to create amenity" });
  }
});

app.get("/api/attendances", async (_, res) => {
  try {
    const data = await db.select().from(attendances);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendances" });
  }
});

app.post("/api/attendances", async (req, res) => {
  try {
    const [attendance] = await db.insert(attendances).values(req.body).returning();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: "Failed to create attendance" });
  }
});

app.get("/api/leave-requests", async (_, res) => {
  try {
    const data = await db.select().from(leaveRequests);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

app.post("/api/leave-requests", async (req, res) => {
  try {
    const [leave] = await db.insert(leaveRequests).values(req.body).returning();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: "Failed to create leave request" });
  }
});

app.get("/api/shifts", async (_, res) => {
  try {
    const data = await db.select().from(shifts);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shifts" });
  }
});

app.post("/api/shifts", async (req, res) => {
  try {
    const [shift] = await db.insert(shifts).values(req.body).returning();
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: "Failed to create shift" });
  }
});

app.get("/api/duty-rosters", async (_, res) => {
  try {
    const data = await db.select().from(dutyRosters);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch duty rosters" });
  }
});

app.post("/api/duty-rosters", async (req, res) => {
  try {
    const [roster] = await db.insert(dutyRosters).values(req.body).returning();
    res.json(roster);
  } catch (error) {
    res.status(500).json({ error: "Failed to create duty roster" });
  }
});

app.listen(PORT, "localhost", () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
