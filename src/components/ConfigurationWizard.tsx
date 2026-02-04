import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  Sparkle,
  Info,
  Warning,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  completed: boolean;
  optional?: boolean;
}

interface ConfigurationWizardProps {
  title: string;
  description: string;
  steps: WizardStep[];
  onComplete: (data: any) => void;
  renderStepContent: (stepId: string, data: any, setData: (data: any) => void) => React.ReactNode;
}

export function ConfigurationWizard({
  title,
  description,
  steps: initialSteps,
  onComplete,
  renderStepContent,
}: ConfigurationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(initialSteps);
  const [data, setData] = useState<any>({});

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    // Mark current step as completed
    const updatedSteps = [...steps];
    updatedSteps[currentStep].completed = true;
    setSteps(updatedSteps);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Wizard complete
      onComplete(data);
      toast.success('Configuration completed successfully!');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (steps[currentStep].optional) {
      const updatedSteps = [...steps];
      updatedSteps[currentStep].completed = true;
      setSteps(updatedSteps);
      setCurrentStep(currentStep + 1);
    }
  };

  const canProceed = () => {
    // Add custom validation logic here if needed
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-2',
              index < steps.length - 1 && 'flex-1'
            )}
          >
            <button
              onClick={() => setCurrentStep(index)}
              disabled={index > currentStep && !step.completed}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full font-medium transition-all',
                index === currentStep && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                step.completed && index !== currentStep && 'bg-success text-success-foreground',
                !step.completed && index !== currentStep && 'bg-muted text-muted-foreground',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {step.completed && index !== currentStep ? (
                <CheckCircle size={20} weight="fill" />
              ) : (
                index + 1
              )}
            </button>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-muted mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start gap-4">
            {steps[currentStep].icon && (
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                {steps[currentStep].icon}
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
              <CardDescription className="mt-2">
                {steps[currentStep].description}
              </CardDescription>
              {steps[currentStep].optional && (
                <Badge variant="outline" className="mt-2">
                  Optional
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {renderStepContent(steps[currentStep].id, data, setData)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        <div className="flex gap-2">
          {steps[currentStep].optional && currentStep < steps.length - 1 && (
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle size={18} className="mr-2" weight="fill" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Example: Channel Setup Wizard
export function ChannelSetupWizard({ onComplete }: { onComplete: (data: any) => void }) {
  const steps: WizardStep[] = [
    {
      id: 'channel-selection',
      title: 'Select Channel',
      description: 'Choose the OTA channel you want to integrate',
      completed: false,
    },
    {
      id: 'credentials',
      title: 'Enter Credentials',
      description: 'Provide your API credentials for the selected channel',
      completed: false,
    },
    {
      id: 'sync-settings',
      title: 'Configure Sync',
      description: 'Set up synchronization preferences',
      completed: false,
      optional: true,
    },
    {
      id: 'test-connection',
      title: 'Test Connection',
      description: 'Verify that everything is working correctly',
      completed: false,
    },
  ];

  const renderStepContent = (stepId: string, data: any, setData: (data: any) => void) => {
    switch (stepId) {
      case 'channel-selection':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Booking.com', 'Airbnb', 'Expedia', 'Agoda'].map((channel) => (
                <button
                  key={channel}
                  onClick={() => setData({ ...data, channel })}
                  className={cn(
                    'p-6 rounded-lg border-2 transition-all hover:shadow-lg',
                    data.channel === channel
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center">
                      <Sparkle size={24} weight="fill" />
                    </div>
                    <p className="font-medium">{channel}</p>
                  </div>
                </button>
              ))}
            </div>
            {data.channel && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" weight="fill" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {data.channel} selected
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    You'll need your API credentials from {data.channel} to proceed.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key *</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={data.apiKey || ''}
                  onChange={(e) => setData({ ...data, apiKey: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyId">Property ID *</Label>
                <Input
                  id="propertyId"
                  placeholder="Enter your property ID"
                  value={data.propertyId || ''}
                  onChange={(e) => setData({ ...data, propertyId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret (optional)</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="Enter API secret if required"
                  value={data.apiSecret || ''}
                  onChange={(e) => setData({ ...data, apiSecret: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Warning size={20} className="text-amber-600 flex-shrink-0 mt-0.5" weight="fill" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Keep your credentials secure
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  Never share your API credentials with anyone. They will be encrypted and stored securely.
                </p>
              </div>
            </div>
          </div>
        );

      case 'sync-settings':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data at regular intervals
                  </p>
                </div>
                <Switch
                  checked={data.autoSync ?? true}
                  onCheckedChange={(checked) => setData({ ...data, autoSync: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Sync Frequency</Label>
                <Select
                  value={String(data.syncFrequency || 15)}
                  onValueChange={(value) => setData({ ...data, syncFrequency: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>What to sync</Label>
                <div className="space-y-3">
                  {[
                    { key: 'syncAvailability', label: 'Room Availability' },
                    { key: 'syncRates', label: 'Rates & Pricing' },
                    { key: 'syncReservations', label: 'Reservations' },
                    { key: 'syncReviews', label: 'Guest Reviews' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label>{item.label}</Label>
                      <Switch
                        checked={data[item.key] ?? true}
                        onCheckedChange={(checked) =>
                          setData({ ...data, [item.key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'test-connection':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-6 rounded-lg border-2 border-dashed text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle size={32} weight="fill" className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to test</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click the button below to test your connection to {data.channel}
                </p>
                <Button>Test Connection</Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Configuration Summary</h4>
                <div className="p-4 rounded-lg bg-muted space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Channel:</span>
                    <span className="font-medium">{data.channel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property ID:</span>
                    <span className="font-medium">{data.propertyId || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto-sync:</span>
                    <span className="font-medium">{data.autoSync ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sync Frequency:</span>
                    <span className="font-medium">Every {data.syncFrequency || 15} minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step content not found</div>;
    }
  };

  return <ConfigurationWizard
    title="Channel Setup Wizard"
    description="Let's get your OTA channel connected in just a few steps"
    steps={steps}
    onComplete={onComplete}
    renderStepContent={renderStepContent}
  />;
}
