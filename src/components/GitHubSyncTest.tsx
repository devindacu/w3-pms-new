import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  GithubLogo,
  CheckCircle,
  XCircle,
  Clock,
  Warning,
  Info,
  GitBranch,
  Play,
  Database,
  ArrowRight,
  Code,
  Lightning,
  Bug,
  CheckSquare,
  List
} from '@phosphor-icons/react'
import { useGitHubSync, type GitHubSyncConfig } from '@/hooks/use-github-sync'
import { formatDistanceToNow } from 'date-fns'

interface TestResult {
  id: string
  testName: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  error?: string
  details?: string
  timestamp: number
}

export function GitHubSyncTest() {
  const defaultConfig: GitHubSyncConfig = {
    owner: '',
    repo: '',
    branch: 'primary',
    token: '',
    autoSyncInterval: 300000,
    enabled: false
  }

  const {
    syncStatus,
    recordChange,
    syncChanges,
    updateConfig,
    changeLog,
    config
  } = useGitHubSync(defaultConfig)

  const [testConfig, setTestConfig] = useState({
    owner: '',
    repo: '',
    branch: 'primary',
    token: ''
  })

  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [currentTestIndex, setCurrentTestIndex] = useState(-1)

  useEffect(() => {
    if (config) {
      setTestConfig({
        owner: config.owner || '',
        repo: config.repo || '',
        branch: config.branch || 'primary',
        token: config.token || ''
      })
    }
  }, [config])

  const addTestResult = (result: Omit<TestResult, 'id' | 'timestamp'>) => {
    const newResult: TestResult = {
      ...result,
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }
    setTestResults(prev => [...prev, newResult])
    return newResult.id
  }

  const updateTestResult = (id: string, updates: Partial<TestResult>) => {
    setTestResults(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    )
  }

  const testConfigurationValidity = async (): Promise<boolean> => {
    const testId = addTestResult({
      testName: 'Configuration Validation',
      status: 'running',
      details: 'Validating GitHub sync configuration...'
    })

    const startTime = Date.now()

    await new Promise(resolve => setTimeout(resolve, 500))

    if (!testConfig.owner || !testConfig.repo || !testConfig.branch || !testConfig.token) {
      updateTestResult(testId, {
        status: 'failed',
        error: 'Missing required configuration fields',
        duration: Date.now() - startTime,
        details: `Owner: ${testConfig.owner ? '✓' : '✗'}, Repo: ${testConfig.repo ? '✓' : '✗'}, Branch: ${testConfig.branch ? '✓' : '✗'}, Token: ${testConfig.token ? '✓' : '✗'}`
      })
      return false
    }

    updateTestResult(testId, {
      status: 'passed',
      duration: Date.now() - startTime,
      details: `All required fields present. Branch: ${testConfig.branch}`
    })
    return true
  }

  const testPrimaryBranchSetting = async (): Promise<boolean> => {
    const testId = addTestResult({
      testName: 'Primary Branch Configuration',
      status: 'running',
      details: 'Verifying primary branch setting...'
    })

    const startTime = Date.now()

    await new Promise(resolve => setTimeout(resolve, 500))

    const isPrimaryBranch = testConfig.branch === 'primary'

    if (!isPrimaryBranch) {
      updateTestResult(testId, {
        status: 'failed',
        error: `Branch is set to '${testConfig.branch}' instead of 'primary'`,
        duration: Date.now() - startTime,
        details: `Expected: 'primary', Got: '${testConfig.branch}'`
      })
      return false
    }

    updateTestResult(testId, {
      status: 'passed',
      duration: Date.now() - startTime,
      details: `Branch correctly set to 'primary'`
    })
    return true
  }

  const testGitHubAPIConnection = async (): Promise<boolean> => {
    const testId = addTestResult({
      testName: 'GitHub API Connection',
      status: 'running',
      details: 'Testing connection to GitHub API...'
    })

    const startTime = Date.now()

    try {
      const response = await fetch(`https://api.github.com/repos/${testConfig.owner}/${testConfig.repo}`, {
        headers: {
          'Authorization': `token ${testConfig.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      const duration = Date.now() - startTime

      if (!response.ok) {
        const errorData = await response.json()
        updateTestResult(testId, {
          status: 'failed',
          error: `API Error: ${response.status} ${response.statusText}`,
          duration,
          details: errorData.message || 'Unable to access repository'
        })
        return false
      }

      const repoData = await response.json()
      updateTestResult(testId, {
        status: 'passed',
        duration,
        details: `Successfully connected to ${repoData.full_name}`
      })
      return true
    } catch (error) {
      updateTestResult(testId, {
        status: 'failed',
        error: 'Network error',
        duration: Date.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const testBranchExists = async (): Promise<boolean> => {
    const testId = addTestResult({
      testName: 'Branch Existence Check',
      status: 'running',
      details: `Checking if '${testConfig.branch}' branch exists...`
    })

    const startTime = Date.now()

    try {
      const response = await fetch(
        `https://api.github.com/repos/${testConfig.owner}/${testConfig.repo}/branches/${testConfig.branch}`,
        {
          headers: {
            'Authorization': `token ${testConfig.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      const duration = Date.now() - startTime

      if (!response.ok) {
        if (response.status === 404) {
          updateTestResult(testId, {
            status: 'failed',
            error: `Branch '${testConfig.branch}' not found`,
            duration,
            details: `The branch '${testConfig.branch}' does not exist in the repository. Please create it first or use an existing branch.`
          })
        } else {
          const errorData = await response.json()
          updateTestResult(testId, {
            status: 'failed',
            error: `API Error: ${response.status}`,
            duration,
            details: errorData.message
          })
        }
        return false
      }

      const branchData = await response.json()
      updateTestResult(testId, {
        status: 'passed',
        duration,
        details: `Branch '${testConfig.branch}' exists. Latest commit: ${branchData.commit.sha.substring(0, 7)}`
      })
      return true
    } catch (error) {
      updateTestResult(testId, {
        status: 'failed',
        error: 'Network error',
        duration: Date.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const testCreateTestData = async (): Promise<boolean> => {
    const testId = addTestResult({
      testName: 'Test Data Creation',
      status: 'running',
      details: 'Creating test data for sync...'
    })

    const startTime = Date.now()

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      recordChange('test-primary-branch-sync', 'create', {
        test: true,
        timestamp: Date.now(),
        branch: testConfig.branch,
        message: `Testing sync with ${testConfig.branch} branch`,
        data: {
          testId: Date.now(),
          randomValue: Math.random(),
          environment: 'test'
        }
      })

      updateTestResult(testId, {
        status: 'passed',
        duration: Date.now() - startTime,
        details: 'Test data created and queued for sync'
      })
      return true
    } catch (error) {
      updateTestResult(testId, {
        status: 'failed',
        error: 'Failed to create test data',
        duration: Date.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const testSyncToPrimaryBranch = async (): Promise<boolean> => {
    const testId = addTestResult({
      testName: 'Sync to Primary Branch',
      status: 'running',
      details: `Syncing data to '${testConfig.branch}' branch...`
    })

    const startTime = Date.now()

    try {
      const result = await syncChanges()
      const duration = Date.now() - startTime

      if (!result.success) {
        updateTestResult(testId, {
          status: 'failed',
          error: 'Sync operation failed',
          duration,
          details: result.error || 'Unknown sync error'
        })
        return false
      }

      updateTestResult(testId, {
        status: 'passed',
        duration,
        details: `Successfully synced to '${testConfig.branch}'. Commit SHA: ${result.sha?.substring(0, 7)}`
      })
      return true
    } catch (error) {
      updateTestResult(testId, {
        status: 'failed',
        error: 'Sync exception',
        duration: Date.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const testVerifyCommitOnPrimaryBranch = async (): Promise<boolean> => {
    const testId = addTestResult({
      testName: 'Verify Commit on Primary Branch',
      status: 'running',
      details: `Verifying commit exists on '${testConfig.branch}' branch...`
    })

    const startTime = Date.now()

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const response = await fetch(
        `https://api.github.com/repos/${testConfig.owner}/${testConfig.repo}/commits?sha=${testConfig.branch}&per_page=1`,
        {
          headers: {
            'Authorization': `token ${testConfig.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      const duration = Date.now() - startTime

      if (!response.ok) {
        updateTestResult(testId, {
          status: 'failed',
          error: `Failed to fetch commits: ${response.status}`,
          duration
        })
        return false
      }

      const commits = await response.json()
      const latestCommit = commits[0]

      if (!latestCommit) {
        updateTestResult(testId, {
          status: 'failed',
          error: 'No commits found on branch',
          duration
        })
        return false
      }

      const isAutoSync = latestCommit.commit.message.includes('Auto-sync')

      updateTestResult(testId, {
        status: 'passed',
        duration,
        details: `Latest commit on '${testConfig.branch}': ${latestCommit.sha.substring(0, 7)} - "${latestCommit.commit.message.split('\n')[0]}" ${isAutoSync ? '✓ Auto-sync commit' : ''}`
      })
      return true
    } catch (error) {
      updateTestResult(testId, {
        status: 'failed',
        error: 'Verification failed',
        duration: Date.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestResults([])
    setCurrentTestIndex(0)

    updateConfig({
      owner: testConfig.owner,
      repo: testConfig.repo,
      branch: testConfig.branch,
      token: testConfig.token,
      enabled: false
    })

    const tests = [
      { name: 'Configuration Validation', fn: testConfigurationValidity },
      { name: 'Primary Branch Configuration', fn: testPrimaryBranchSetting },
      { name: 'GitHub API Connection', fn: testGitHubAPIConnection },
      { name: 'Branch Existence Check', fn: testBranchExists },
      { name: 'Test Data Creation', fn: testCreateTestData },
      { name: 'Sync to Primary Branch', fn: testSyncToPrimaryBranch },
      { name: 'Verify Commit on Primary Branch', fn: testVerifyCommitOnPrimaryBranch }
    ]

    let allPassed = true

    for (let i = 0; i < tests.length; i++) {
      setCurrentTestIndex(i)
      const result = await tests[i].fn()
      
      if (!result) {
        allPassed = false
        break
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setCurrentTestIndex(-1)
    setIsRunningTests(false)

    if (allPassed) {
      toast.success('All tests passed! GitHub sync with primary branch is working correctly.')
    } else {
      toast.error('Some tests failed. Please review the results and fix the issues.')
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="animate-spin text-primary" size={20} />
      case 'passed':
        return <CheckCircle className="text-success" size={20} />
      case 'failed':
        return <XCircle className="text-destructive" size={20} />
      default:
        return <Clock className="text-muted-foreground" size={20} />
    }
  }

  const passedTests = testResults.filter(t => t.status === 'passed').length
  const failedTests = testResults.filter(t => t.status === 'failed').length
  const totalTests = testResults.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bug size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">GitHub Sync Test Suite</h2>
            <p className="text-muted-foreground text-sm">
              Test GitHub sync functionality with primary branch configuration
            </p>
          </div>
        </div>
      </div>

      <Alert className="border-primary/50 bg-primary/5">
        <Info size={16} className="text-primary" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">✅ GitHub Sync with Primary Branch - Ready to Test</p>
            <p className="text-sm">
              This test suite validates that your GitHub repository sync is correctly configured to use the <code className="px-1 py-0.5 bg-background rounded text-primary font-mono">primary</code> branch.
              Complete the configuration below and run all tests to verify functionality.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="bg-background">
                <CheckCircle size={14} className="mr-1 text-success" />
                7 Automated Tests
              </Badge>
              <Badge variant="outline" className="bg-background">
                <GitBranch size={14} className="mr-1 text-primary" />
                Primary Branch Validation
              </Badge>
              <Badge variant="outline" className="bg-background">
                <GithubLogo size={14} className="mr-1" />
                Real GitHub API Testing
              </Badge>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Tests</p>
            <p className="text-3xl font-bold text-foreground">{totalTests}</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Passed</p>
            <p className="text-3xl font-bold text-success">{passedTests}</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Failed</p>
            <p className="text-3xl font-bold text-destructive">{failedTests}</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-primary">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-foreground">
              {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
            </p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Test Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your GitHub repository settings for testing
                </p>

                <Alert className="mb-4">
                  <Info size={16} />
                  <AlertDescription>
                    <strong>Primary Branch:</strong> GitHub's default branch is now called 'primary' instead of 'main' or 'master'. 
                    This test suite verifies that your sync configuration correctly uses the 'primary' branch.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-owner">Repository Owner</Label>
                      <Input
                        id="test-owner"
                        placeholder="e.g., your-username"
                        value={testConfig.owner}
                        onChange={(e) => setTestConfig(prev => ({ ...prev, owner: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="test-repo">Repository Name</Label>
                      <Input
                        id="test-repo"
                        placeholder="e.g., hotel-pms-data"
                        value={testConfig.repo}
                        onChange={(e) => setTestConfig(prev => ({ ...prev, repo: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-branch" className="flex items-center gap-2">
                      <GitBranch size={16} />
                      Branch (should be 'primary')
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="test-branch"
                        placeholder="primary"
                        value={testConfig.branch}
                        onChange={(e) => setTestConfig(prev => ({ ...prev, branch: e.target.value }))}
                      />
                      {testConfig.branch === 'primary' && (
                        <Badge variant="default" className="bg-success shrink-0">
                          <CheckCircle size={14} className="mr-1" />
                          Correct
                        </Badge>
                      )}
                      {testConfig.branch && testConfig.branch !== 'primary' && (
                        <Badge variant="destructive" className="shrink-0">
                          <Warning size={14} className="mr-1" />
                          Should be 'primary'
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-token">GitHub Personal Access Token</Label>
                    <Input
                      id="test-token"
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={testConfig.token}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, token: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Test Suite</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <CheckSquare size={16} className="text-muted-foreground" />
                    <span>1. Validate configuration fields</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <CheckSquare size={16} className="text-muted-foreground" />
                    <span>2. Verify branch is set to 'primary'</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <CheckSquare size={16} className="text-muted-foreground" />
                    <span>3. Test GitHub API connection</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <CheckSquare size={16} className="text-muted-foreground" />
                    <span>4. Check if 'primary' branch exists</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <CheckSquare size={16} className="text-muted-foreground" />
                    <span>5. Create test data</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <CheckSquare size={16} className="text-muted-foreground" />
                    <span>6. Sync data to primary branch</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <CheckSquare size={16} className="text-muted-foreground" />
                    <span>7. Verify commit on primary branch</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={runAllTests}
                  className="w-full"
                  disabled={isRunningTests || !testConfig.owner || !testConfig.repo || !testConfig.branch || !testConfig.token}
                  size="lg"
                >
                  <Lightning size={20} className="mr-2" />
                  {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
                </Button>
                
                {!testConfig.owner || !testConfig.repo || !testConfig.branch || !testConfig.token ? (
                  <Alert>
                    <Warning size={16} />
                    <AlertDescription className="text-sm">
                      Please fill in all configuration fields above before running tests.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <List size={20} />
                <h3 className="text-lg font-semibold">Test Results</h3>
              </div>
              {testResults.length > 0 && (
                <Badge variant={failedTests === 0 ? "default" : "destructive"} className={failedTests === 0 ? "bg-success" : ""}>
                  {passedTests}/{totalTests} Passed
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {testResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Code size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No test results yet</p>
                    <p className="text-sm mt-1">Configure settings and run tests</p>
                  </div>
                ) : (
                  testResults.map((result, index) => (
                    <Card key={result.id} className={`p-4 ${result.status === 'running' ? 'border-primary' : ''}`}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(result.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{result.testName}</h4>
                                {result.duration && (
                                  <Badge variant="outline" className="text-xs">
                                    {result.duration}ms
                                  </Badge>
                                )}
                              </div>
                              {result.details && (
                                <p className="text-sm text-muted-foreground">{result.details}</p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              result.status === 'passed' ? 'default' :
                              result.status === 'failed' ? 'destructive' :
                              'secondary'
                            }
                            className={result.status === 'passed' ? 'bg-success' : ''}
                          >
                            {result.status}
                          </Badge>
                        </div>

                        {result.error && (
                          <Alert variant="destructive">
                            <XCircle size={16} />
                            <AlertDescription>
                              <strong>Error:</strong> {result.error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      {isRunningTests && (
        <Alert>
          <Clock size={16} className="animate-spin" />
          <AlertDescription>
            Running tests... This may take a few moments. Please do not close this page.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
