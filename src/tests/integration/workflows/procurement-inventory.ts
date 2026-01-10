import type { WorkflowResult } from './test-utils'
import { delay, generateTestId, calculateTotal } from './test-utils'

export async function procurementToInventoryWorkflow(): Promise<WorkflowResult> {
  const steps: string[] = []
  
  try {
    steps.push('Starting procurement to inventory workflow')
    await delay(100)

    const requisitionId = generateTestId('req')
    steps.push(`Creating purchase requisition: ${requisitionId}`)
    
    const requisitionItems = [
      { itemId: 'inv-001', name: 'Tomatoes', quantity: 50, unit: 'kg', estimatedPrice: 3 },
      { itemId: 'inv-002', name: 'Chicken Breast', quantity: 30, unit: 'kg', estimatedPrice: 8 },
      { itemId: 'inv-003', name: 'Olive Oil', quantity: 10, unit: 'liter', estimatedPrice: 12 },
      { itemId: 'inv-004', name: 'Pasta', quantity: 25, unit: 'kg', estimatedPrice: 4 }
    ]
    
    steps.push(`Added ${requisitionItems.length} items to requisition`)
    await delay(100)

    const estimatedTotal = calculateTotal(requisitionItems.map(i => ({ 
      quantity: i.quantity, 
      price: i.estimatedPrice 
    })))
    steps.push(`Estimated total: $${estimatedTotal}`)
    await delay(50)

    steps.push('Submitting requisition for approval')
    const requisition = {
      id: requisitionId,
      department: 'kitchen',
      requestedBy: 'test-chef',
      items: requisitionItems,
      estimatedTotal,
      status: 'pending-approval' as const,
      createdAt: Date.now()
    }
    await delay(100)

    steps.push('Manager approving requisition')
    await delay(50)

    const poId = generateTestId('po')
    steps.push(`Creating purchase order: ${poId}`)
    
    const supplierId = 'supplier-001'
    const purchaseOrder = {
      id: poId,
      requisitionId,
      supplierId,
      supplierName: 'Fresh Foods Supplier',
      items: requisitionItems,
      subtotal: estimatedTotal,
      tax: estimatedTotal * 0.08,
      total: estimatedTotal * 1.08,
      status: 'draft' as const,
      deliveryDate: Date.now() + (3 * 24 * 60 * 60 * 1000),
      createdAt: Date.now()
    }
    
    steps.push(`PO total: $${purchaseOrder.total.toFixed(2)}`)
    await delay(100)

    steps.push('Sending PO to supplier')
    steps.push('PO sent to supplier')
    await delay(100)

    steps.push('Supplier delivering goods (simulating 3-day wait)')
    await delay(150)

    const grnId = generateTestId('grn')
    steps.push(`Creating Goods Receipt Note: ${grnId}`)
    
    const receivedItems = requisitionItems.map(item => ({
      ...item,
      receivedQuantity: item.quantity,
      actualPrice: item.estimatedPrice + (Math.random() * 0.5 - 0.25),
      quality: 'good' as const
    }))
    
    steps.push('Inspecting received goods')
    await delay(100)

    for (const item of receivedItems) {
      steps.push(`  ✓ ${item.name}: ${item.receivedQuantity} ${item.unit} - Quality: ${item.quality}`)
      await delay(30)
    }
    await delay(50)

    const grn = {
      id: grnId,
      poId,
      receivedBy: 'test-storekeeper',
      items: receivedItems,
      receivedAt: Date.now(),
      status: 'received' as const
    }
    
    steps.push('GRN created and approved')
    await delay(100)

    steps.push('Updating inventory levels')
    for (const item of receivedItems) {
      const inventoryUpdate = {
        itemId: item.itemId,
        quantityBefore: 20,
        quantityReceived: item.receivedQuantity,
        quantityAfter: 20 + item.receivedQuantity,
        unitPrice: item.actualPrice,
        updatedAt: Date.now()
      }
      
      steps.push(`  ${item.name}: ${inventoryUpdate.quantityBefore} → ${inventoryUpdate.quantityAfter} ${item.unit}`)
      await delay(30)
    }
    await delay(100)

    steps.push('Creating supplier invoice')
    const actualTotal = calculateTotal(receivedItems.map(i => ({ 
      quantity: i.receivedQuantity, 
      price: i.actualPrice 
    })))
    
    const invoiceId = generateTestId('invoice')
    const invoice = {
      id: invoiceId,
      poId,
      grnId,
      supplierId,
      amount: actualTotal,
      tax: actualTotal * 0.08,
      total: actualTotal * 1.08,
      dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
      status: 'pending' as const
    }
    
    steps.push(`Invoice ${invoiceId}: $${invoice.total.toFixed(2)}`)
    await delay(100)

    steps.push('Three-way matching: PO vs GRN vs Invoice')
    const variance = Math.abs(purchaseOrder.total - invoice.total)
    steps.push(`Variance: $${variance.toFixed(2)}`)
    
    if (variance < 5) {
      steps.push('✓ Three-way match successful')
    } else {
      steps.push('⚠ Variance requires approval')
    }
    await delay(100)

    steps.push('Recording accounts payable')
    const apEntry = {
      supplierId,
      invoiceId,
      amount: invoice.total,
      dueDate: invoice.dueDate,
      createdAt: Date.now()
    }
    steps.push(`AP recorded: $${apEntry.amount.toFixed(2)}`)
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
