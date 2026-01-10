import type { WorkflowResult } from './test-utils'
import { delay, generateTestId, calculateTotal } from './test-utils'

export async function restaurantOrderToFolioWorkflow(): Promise<WorkflowResult> {
  const steps: string[] = []
  
  try {
    steps.push('Starting restaurant order to folio workflow')
    await delay(100)

    const guestId = generateTestId('guest')
    const folioId = generateTestId('folio')
    steps.push(`Guest folio: ${folioId}`)
    await delay(50)

    const orderId = generateTestId('order')
    steps.push(`Creating F&B order: ${orderId}`)
    
    const orderItems = [
      { menuItemId: 'item-1', name: 'Caesar Salad', quantity: 2, price: 15, category: 'appetizer' },
      { menuItemId: 'item-2', name: 'Grilled Salmon', quantity: 1, price: 35, category: 'main' },
      { menuItemId: 'item-3', name: 'Ribeye Steak', quantity: 1, price: 45, category: 'main' },
      { menuItemId: 'item-4', name: 'Tiramisu', quantity: 2, price: 12, category: 'dessert' },
      { menuItemId: 'item-5', name: 'Red Wine', quantity: 1, price: 28, category: 'beverage' }
    ]
    
    steps.push(`Added ${orderItems.length} items to order`)
    await delay(100)

    const subtotal = calculateTotal(orderItems)
    steps.push(`Order subtotal: $${subtotal}`)
    await delay(50)

    const serviceCharge = subtotal * 0.10
    const tax = subtotal * 0.08
    const total = subtotal + serviceCharge + tax
    
    steps.push(`Applied 10% service charge: $${serviceCharge.toFixed(2)}`)
    steps.push(`Applied 8% tax: $${tax.toFixed(2)}`)
    steps.push(`Order total: $${total.toFixed(2)}`)
    await delay(100)

    const order = {
      id: orderId,
      guestId,
      roomNumber: '205',
      type: 'room-service' as const,
      items: orderItems,
      subtotal,
      serviceCharge,
      tax,
      total,
      status: 'pending' as const,
      createdAt: Date.now()
    }
    await delay(50)

    steps.push('Sending order to kitchen')
    steps.push('Kitchen preparing order')
    await delay(200)

    steps.push('Updating inventory for consumed items')
    for (const item of orderItems) {
      steps.push(`- Deducted ${item.name} ingredients from inventory`)
      await delay(30)
    }
    await delay(50)

    steps.push('Order ready for delivery')
    await delay(100)

    steps.push('Order delivered to guest')
    await delay(100)

    steps.push('Posting charges to guest folio')
    const folioCharge = {
      id: generateTestId('charge'),
      folioId,
      orderId,
      description: 'Room Service - Order #' + orderId.slice(-8),
      amount: total,
      category: 'fnb',
      postedAt: Date.now(),
      postedBy: 'test-user'
    }
    
    steps.push(`Charge posted to folio: $${total.toFixed(2)}`)
    await delay(100)

    steps.push('Recording F&B revenue')
    const revenueEntry = {
      id: generateTestId('revenue'),
      department: 'fnb',
      category: 'room-service',
      amount: subtotal,
      serviceCharge,
      tax,
      total,
      date: Date.now()
    }
    steps.push(`Revenue recorded: $${total.toFixed(2)}`)
    await delay(50)

    steps.push('Updating kitchen performance metrics')
    await delay(50)

    steps.push('Workflow completed successfully')
    
    return {
      success: true,
      steps
    }
  } catch (error) {
    steps.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      steps
    }
  }
}
