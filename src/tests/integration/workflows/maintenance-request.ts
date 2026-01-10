import type { WorkflowResult } from './test-utils'
import { delay, generateTestId } from './test-utils'

export async function maintenanceRequestWorkflow(): Promise<WorkflowResult> {
  const steps: string[] = []
  
  try {
    steps.push('Starting maintenance request workflow')
    await delay(100)

    const requestId = generateTestId('maint')
    steps.push(`Creating maintenance request: ${requestId}`)
    
    const maintenanceRequest = {
      id: requestId,
      roomNumber: '305',
      type: 'repair',
      category: 'plumbing',
      priority: 'high' as const,
      description: 'Leaking faucet in bathroom',
      reportedBy: 'housekeeping-staff',
      reportedAt: Date.now(),
      status: 'scheduled' as const
    }
    
    steps.push(`Priority: ${maintenanceRequest.priority}`)
    steps.push(`Category: ${maintenanceRequest.category}`)
    await delay(100)

    steps.push('Updating room status to maintenance')
    const roomStatus = 'maintenance'
    steps.push(`Room 305 status: ${roomStatus}`)
    await delay(50)

    steps.push('Assigning to maintenance engineer')
    const assignedTo = 'engineer-002'
    steps.push(`Assigned to: ${assignedTo}`)
    await delay(100)

    steps.push('Engineer acknowledging request')
    await delay(50)

    steps.push('Checking required materials')
    const materials = [
      { id: 'mat-001', name: 'Faucet Assembly', quantity: 1, cost: 45 },
      { id: 'mat-002', name: 'Plumbers Tape', quantity: 1, cost: 5 },
      { id: 'mat-003', name: 'Pipe Sealant', quantity: 1, cost: 8 }
    ]
    
    for (const material of materials) {
      steps.push(`  - ${material.name}: ${material.quantity} unit(s)`)
      await delay(30)
    }
    await delay(50)

    steps.push('Issuing materials from inventory')
    const totalMaterialCost = materials.reduce((sum, m) => sum + (m.quantity * m.cost), 0)
    steps.push(`Total material cost: $${totalMaterialCost}`)
    await delay(100)

    steps.push('Engineer starting work')
    await delay(150)

    steps.push('Work in progress...')
    await delay(100)

    steps.push('Work completed')
    const completedAt = Date.now()
    await delay(100)

    const laborHours = 2
    const laborRate = 35
    const laborCost = laborHours * laborRate
    
    steps.push(`Labor: ${laborHours} hours @ $${laborRate}/hr = $${laborCost}`)
    await delay(50)

    const totalCost = totalMaterialCost + laborCost
    steps.push(`Total maintenance cost: $${totalCost}`)
    await delay(100)

    steps.push('Recording maintenance expense')
    const expenseId = generateTestId('expense')
    const expense = {
      id: expenseId,
      category: 'maintenance',
      description: `Room 305 ${maintenanceRequest.category} repair`,
      materials: totalMaterialCost,
      labor: laborCost,
      total: totalCost,
      date: Date.now()
    }
    steps.push(`Expense recorded: ${expenseId}`)
    await delay(100)

    steps.push('Updating maintenance analytics')
    const metrics = {
      averageResponseTime: 45,
      averageCompletionTime: 180,
      totalCost: totalCost,
      requestsByCategory: { plumbing: 1 }
    }
    await delay(50)

    steps.push('Scheduling housekeeping inspection')
    const inspectionId = generateTestId('inspection')
    steps.push(`Inspection task: ${inspectionId}`)
    await delay(100)

    steps.push('Housekeeping inspecting room')
    await delay(100)

    steps.push('Inspection passed - updating room status')
    await delay(50)

    steps.push('Room 305 status: vacant-clean')
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
