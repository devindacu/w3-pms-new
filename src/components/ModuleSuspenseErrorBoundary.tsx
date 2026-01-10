import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowClockwise, Warning } from '@phosphor-icons/react'

interface Props {
  children: ReactNode
  moduleName?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

export class ModuleSuspenseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Module load error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <Card className="max-w-2xl w-full p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Warning size={32} className="text-destructive" weight="duotone" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Failed to Load {this.props.moduleName || 'Module'}
                </h2>
                <p className="text-muted-foreground max-w-md">
                  We encountered an error while loading this module. This might be due to a temporary network issue or a problem with the module itself.
                </p>
              </div>

              {this.state.error && (
                <details className="w-full text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                    View technical details
                  </summary>
                  <div className="mt-3 p-4 bg-muted rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      <code>{this.state.error.toString()}</code>
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex gap-3 pt-2">
                <Button onClick={this.handleRetry} size="lg" className="gap-2">
                  <ArrowClockwise size={20} />
                  Retry Loading
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline" 
                  size="lg"
                >
                  Return to Dashboard
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                If this problem persists, please contact support or try refreshing the page.
              </p>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
