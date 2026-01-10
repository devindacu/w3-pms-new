import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { guestCheckInCheckOutWorkflow } from './workflows/guest-checkin-checkout'
import { restaurantOrderToFolioWorkflow } from './workflows/restaurant-order-folio'
import { roomRevenueToFinanceWorkflow } from './workflows/room-revenue-finance'
import { procurementToInventoryWorkflow } from './workflows/procurement-inventory'
import { maintenanceRequestWorkflow } from './workflows/maintenance-request'
import { channelManagerSyncWorkflow } from './workflows/channel-manager-sync'
import { guestLoyaltyWorkflow } from './workflows/guest-loyalty'
import { hrPayrollWorkflow } from './workflows/hr-payroll'

export interface TestResult {
  testName: string
  workflow: string
  status: 'passed' | 'failed' | 'running' | 'pending'
  duration?: number
  error?: string
  details?: string[]
  timestamp?: number
}

export interface IntegrationTestRunnerProps {
  onComplete?: (results: TestResult[]) => void
}

export function IntegrationTestRunner({ onComplete }: IntegrationTestRunnerProps) {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set())

  const workflows = [
    {
      name: 'Guest Check-in to Check-out',
      description: 'Tests complete guest journey including reservation, check-in, services, and check-out',
      workflow: guestCheckInCheckOutWorkflow,
      category: 'Front Office'
    },
    {
      name: 'Restaurant Order to Folio',
      description: 'Tests F&B order creation and posting to guest folio',
      workflow: restaurantOrderToFolioWorkflow,
      category: 'F&B Operations'
    },
    {
      name: 'Room Revenue to Finance',
      description: 'Tests room charges, rate plans, and revenue accounting',
      workflow: roomRevenueToFinanceWorkflow,
      category: 'Revenue Management'
    },
    {
      name: 'Procurement to Inventory',
      description: 'Tests purchase order creation, GRN, and inventory updates',
      workflow: procurementToInventoryWorkflow,
      category: 'Supply Chain'
    },
    {
      name: 'Maintenance Request Flow',
      description: 'Tests maintenance request creation, assignment, and completion',
      workflow: maintenanceRequestWorkflow,
      category: 'Engineering'
    },
    {
      name: 'Channel Manager Sync',
      description: 'Tests OTA integration, inventory sync, and reservation import',
      workflow: channelManagerSyncWorkflow,
      category: 'Distribution'
    },
    {
      name: 'Guest Loyalty & CRM',
      description: 'Tests loyalty points, upsells, and marketing campaigns',
      workflow: guestLoyaltyWorkflow,
      category: 'CRM'
    },
    {
      name: 'HR & Payroll Integration',
      description: 'Tests attendance, leave, shifts, and payroll calculation',
      workflow: hrPayrollWorkflow,
      category: 'Human Resources'
    }
  ]

  const toggleExpanded = (testName: string) => {
    setExpandedTests(prev => {
      const next = new Set(prev)
      if (next.has(testName)) {
        next.delete(testName)
      } else {
        next.add(testName)
      }
      return next
    })
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])
    const testResults: TestResult[] = []

    for (const workflow of workflows) {
      const testResult: TestResult = {
        testName: workflow.name,
        workflow: workflow.category,
        status: 'running',
        timestamp: Date.now()
      }
      
      setResults(prev => [...prev, testResult])

      const startTime = Date.now()
      
      try {
        const result = await workflow.workflow()
        const duration = Date.now() - startTime
        
        const updatedResult: TestResult = {
          ...testResult,
          status: result.success ? 'passed' : 'failed',
          duration,
          error: result.error,
          details: result.steps
        }
        
        testResults.push(updatedResult)
        setResults(prev => prev.map(r => 
          r.testName === workflow.name ? updatedResult : r
        ))

        if (result.success) {
          toast.success(`✓ ${workflow.name}`, {
            description: `Completed in ${duration}ms`
          })
        } else {
          toast.error(`✗ ${workflow.name}`, {
            description: result.error
          })
        }
      } catch (error) {
        const duration = Date.now() - startTime
        const updatedResult: TestResult = {
          ...testResult,
          status: 'failed',
          duration,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
        
        testResults.push(updatedResult)
        setResults(prev => prev.map(r => 
          r.testName === workflow.name ? updatedResult : r
        ))

        toast.error(`✗ ${workflow.name}`, {
          description: 'Test execution failed'
        })
      }
    }

    setIsRunning(false)
    onComplete?.(testResults)
  }

  const passedTests = results.filter(r => r.status === 'passed').length
  const failedTests = results.filter(r => r.status === 'failed').length
  const totalTests = workflows.length
  const progress = results.length > 0 ? (results.filter(r => r.status !== 'running').length / totalTests) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Test Suite</h2>
          <p className="text-muted-foreground mt-1">
            Automated cross-module workflow testing
          </p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          size="lg"
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {results.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Test Progress</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {passedTests} Passed
                  </span>
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {failedTests} Failed
                  </span>
                  <span className="text-muted-foreground">
                    {results.filter(r => r.status !== 'running').length}/{totalTests}
                  </span>
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((workflow) => {
          const result = results.find(r => r.testName === workflow.name)
          const isExpanded = expandedTests.has(workflow.name)
          
          return (
            <Card key={workflow.name} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{workflow.name}</h3>
                      {result && (
                        <>
                          {result.status === 'passed' && (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                          {result.status === 'failed' && (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          )}
                          {result.status === 'running' && (
                            <Clock className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {workflow.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    {workflow.category}
                  </Badge>
                </div>

                {result && (
                  <div className="space-y-2">
                    {result.duration && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{result.duration}ms</span>
                      </div>
                    )}

                    {result.error && (
                      <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{result.error}</span>
                      </div>
                    )}

                    {result.details && result.details.length > 0 && (
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(workflow.name)}
                          className="h-7 text-xs"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3 mr-1" />
                          ) : (
                            <ChevronRight className="h-3 w-3 mr-1" />
                          )}
                          {result.details.length} steps
                        </Button>
                        
                        {isExpanded && (
                          <ScrollArea className="h-32 mt-2 rounded border bg-muted/30 p-2">
                            <div className="space-y-1">
                              {result.details.map((step, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary font-mono">{idx + 1}.</span>
                                  <span className="flex-1">{step}</span>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
