import type { WorkflowResult } from './test-utils'
import { delay, generateTestId } from './test-utils'

export async function hrPayrollWorkflow(): Promise<WorkflowResult> {
  const steps: string[] = []
  
  try {
    steps.push('Starting HR & payroll integration workflow')
    await delay(100)

    const employeeId = generateTestId('emp')
    steps.push(`Employee: ${employeeId}`)
    
    const employee = {
      id: employeeId,
      firstName: 'Michael',
      lastName: 'Chen',
      employeeCode: 'EMP-1234',
      department: 'front-office',
      position: 'Front Desk Agent',
      hourlyRate: 18,
      joinDate: Date.now() - (180 * 24 * 60 * 60 * 1000),
      status: 'active'
    }
    
    steps.push(`${employee.firstName} ${employee.lastName} - ${employee.position}`)
    await delay(100)

    steps.push('Recording attendance for pay period (2 weeks)')
    const attendanceRecords = [
      { date: 1, hoursWorked: 8, shift: 'morning' },
      { date: 2, hoursWorked: 8, shift: 'morning' },
      { date: 3, hoursWorked: 8, shift: 'evening' },
      { date: 4, hoursWorked: 8, shift: 'morning' },
      { date: 5, hoursWorked: 8, shift: 'morning' },
      { date: 8, hoursWorked: 8, shift: 'evening' },
      { date: 9, hoursWorked: 8, shift: 'morning' },
      { date: 10, hoursWorked: 10, shift: 'morning' },
      { date: 11, hoursWorked: 8, shift: 'evening' },
      { date: 12, hoursWorked: 8, shift: 'morning' }
    ]
    
    const totalHours = attendanceRecords.reduce((sum, r) => sum + r.hoursWorked, 0)
    steps.push(`Total hours worked: ${totalHours}`)
    await delay(100)

    steps.push('Processing leave request')
    const leaveRequestId = generateTestId('leave')
    const leaveRequest = {
      id: leaveRequestId,
      employeeId,
      type: 'sick-leave',
      startDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
      endDate: Date.now() + (9 * 24 * 60 * 60 * 1000),
      days: 2,
      status: 'approved',
      approvedBy: 'manager-001'
    }
    
    steps.push(`Leave approved: ${leaveRequest.days} days (${leaveRequest.type})`)
    await delay(100)

    steps.push('Calculating regular hours and overtime')
    const regularHours = Math.min(totalHours, 80)
    const overtimeHours = Math.max(totalHours - 80, 0)
    
    steps.push(`  Regular hours: ${regularHours}`)
    steps.push(`  Overtime hours: ${overtimeHours}`)
    await delay(50)

    steps.push('Calculating gross pay')
    const regularPay = regularHours * employee.hourlyRate
    const overtimePay = overtimeHours * employee.hourlyRate * 1.5
    const grossPay = regularPay + overtimePay
    
    steps.push(`  Regular pay: $${regularPay}`)
    if (overtimePay > 0) {
      steps.push(`  Overtime pay: $${overtimePay}`)
    }
    steps.push(`  Gross pay: $${grossPay}`)
    await delay(100)

    steps.push('Calculating deductions')
    const federalTax = grossPay * 0.12
    const stateTax = grossPay * 0.05
    const socialSecurity = grossPay * 0.062
    const medicare = grossPay * 0.0145
    const totalDeductions = federalTax + stateTax + socialSecurity + medicare
    
    steps.push(`  Federal tax (12%): $${federalTax.toFixed(2)}`)
    steps.push(`  State tax (5%): $${stateTax.toFixed(2)}`)
    steps.push(`  Social Security (6.2%): $${socialSecurity.toFixed(2)}`)
    steps.push(`  Medicare (1.45%): $${medicare.toFixed(2)}`)
    steps.push(`  Total deductions: $${totalDeductions.toFixed(2)}`)
    await delay(100)

    const netPay = grossPay - totalDeductions
    steps.push(`Net pay: $${netPay.toFixed(2)}`)
    await delay(50)

    steps.push('Generating payslip')
    const payslipId = generateTestId('payslip')
    const payslip = {
      id: payslipId,
      employeeId,
      payPeriodStart: Date.now() - (14 * 24 * 60 * 60 * 1000),
      payPeriodEnd: Date.now(),
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      grossPay,
      deductions: {
        federalTax,
        stateTax,
        socialSecurity,
        medicare
      },
      totalDeductions,
      netPay,
      paymentDate: Date.now() + (2 * 24 * 60 * 60 * 1000),
      status: 'processed'
    }
    
    steps.push(`Payslip generated: ${payslipId}`)
    await delay(100)

    steps.push('Recording payroll expense')
    const expenseId = generateTestId('expense')
    const payrollExpense = {
      id: expenseId,
      category: 'payroll',
      department: employee.department,
      employeeId,
      amount: grossPay,
      employerTaxes: socialSecurity + medicare,
      totalCost: grossPay + socialSecurity + medicare,
      date: Date.now()
    }
    
    steps.push(`Total payroll cost: $${payrollExpense.totalCost.toFixed(2)}`)
    await delay(100)

    steps.push('Updating HR analytics')
    const hrMetrics = {
      totalHeadcount: 1,
      averageHoursPerEmployee: totalHours,
      overtimePercentage: (overtimeHours / totalHours) * 100,
      laborCostPercentage: 0.35,
      attendanceRate: 0.95
    }
    
    steps.push(`Overtime: ${hrMetrics.overtimePercentage.toFixed(1)}%`)
    steps.push(`Attendance rate: ${(hrMetrics.attendanceRate * 100).toFixed(1)}%`)
    await delay(50)

    steps.push('Scheduling performance review')
    const reviewId = generateTestId('review')
    const review = {
      id: reviewId,
      employeeId,
      type: 'quarterly',
      scheduledDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
      status: 'scheduled',
      reviewerId: 'manager-001'
    }
    
    steps.push(`Performance review scheduled: ${reviewId}`)
    await delay(100)

    steps.push('Sending payslip notification to employee')
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
