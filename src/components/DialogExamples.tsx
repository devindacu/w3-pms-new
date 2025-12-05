import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { DialogSize, DialogHeight } from '@/lib/dialog-config'

export function DialogExamples() {
  const [openSmall, setOpenSmall] = useState(false)
  const [openMedium, setOpenMedium] = useState(false)
  const [openLarge, setOpenLarge] = useState(false)
  const [openXL, setOpenXL] = useState(false)
  const [open2XL, setOpen2XL] = useState(false)
  const [openFull, setOpenFull] = useState(false)
  const [openCustom, setOpenCustom] = useState(false)
  const [customSize, setCustomSize] = useState<DialogSize>('lg')
  const [customHeight, setCustomHeight] = useState<DialogHeight>('auto')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dialog Size Examples</h2>
        <p className="text-muted-foreground mt-1">
          Test different dialog configurations and sizes
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Preset Sizes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button onClick={() => setOpenSmall(true)} variant="outline">
            Small (sm)
          </Button>
          <Button onClick={() => setOpenMedium(true)} variant="outline">
            Medium (md)
          </Button>
          <Button onClick={() => setOpenLarge(true)} variant="outline">
            Large (lg)
          </Button>
          <Button onClick={() => setOpenXL(true)} variant="outline">
            XL (xl)
          </Button>
          <Button onClick={() => setOpen2XL(true)} variant="outline">
            2XL (2xl)
          </Button>
          <Button onClick={() => setOpenFull(true)} variant="outline">
            Full Width
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Custom Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Size</Label>
            <Select value={customSize} onValueChange={(v) => setCustomSize(v as DialogSize)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
                <SelectItem value="2xl">2X Large</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Height</Label>
            <Select value={customHeight} onValueChange={(v) => setCustomHeight(v as DialogHeight)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
                <SelectItem value="full">Full Height</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={() => setOpenCustom(true)} className="w-full">
              Open Custom Dialog
            </Button>
          </div>
        </div>
      </Card>

      <ResponsiveDialog
        open={openSmall}
        onOpenChange={setOpenSmall}
        title="Small Dialog Example"
        description="Best for confirmations and simple alerts"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpenSmall(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpenSmall(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={openMedium}
        onOpenChange={setOpenMedium}
        title="Medium Dialog Example"
        description="Ideal for basic forms with 5-10 fields"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpenMedium(false)}>
              Cancel
            </Button>
            <Button>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="Enter name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input placeholder="+1 (555) 000-0000" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Additional information" rows={3} />
          </div>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={openLarge}
        onOpenChange={setOpenLarge}
        title="Large Dialog Example"
        description="Good for standard data entry forms"
        size="lg"
        height="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpenLarge(false)}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-semibold">Address Details</h3>
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input />
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input />
              </div>
            </div>
          </div>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={openXL}
        onOpenChange={setOpenXL}
        title="Extra Large Dialog Example"
        description="Perfect for complex forms with multiple sections"
        size="xl"
        height="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpenXL(false)}>
              Cancel
            </Button>
            <Button variant="outline">Save as Draft</Button>
            <Button>Submit</Button>
          </>
        }
      >
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((section) => (
            <div key={section} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Section {section}</h3>
                <Badge variant="outline">Required</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label>Field {field}</Label>
                    <Input placeholder={`Enter field ${field}`} />
                  </div>
                ))}
              </div>
              {section < 5 && <Separator />}
            </div>
          ))}
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={open2XL}
        onOpenChange={setOpen2XL}
        title="2X Large Dialog Example"
        description="Designed for data tables and detailed reports"
        size="2xl"
        height="xl"
        footer={
          <Button onClick={() => setOpen2XL(false)}>Close</Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This size is ideal for displaying wide data tables, comprehensive reports, or multi-column layouts.
          </p>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <Card key={i} className="p-4">
                <h4 className="font-semibold mb-2">Item {i + 1}</h4>
                <p className="text-sm text-muted-foreground">
                  Sample content for demonstration
                </p>
              </Card>
            ))}
          </div>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={openFull}
        onOpenChange={setOpenFull}
        title="Full Width Dialog Example"
        description="Reserved for dashboards and analytics views"
        size="full"
        height="full"
        footer={
          <Button onClick={() => setOpenFull(false)}>Close</Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This dialog takes up 95% of the viewport width and height, providing maximum space for complex interfaces.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 32 }).map((_, i) => (
              <Card key={i} className="p-4">
                <h4 className="font-semibold mb-2">Widget {i + 1}</h4>
                <p className="text-sm text-muted-foreground">
                  Dashboard widget content
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Metric A</span>
                    <span className="font-semibold">123</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Metric B</span>
                    <span className="font-semibold">456</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={openCustom}
        onOpenChange={setOpenCustom}
        title="Custom Configuration"
        description={`Size: ${customSize} | Height: ${customHeight}`}
        size={customSize}
        height={customHeight}
        footer={
          <Button onClick={() => setOpenCustom(false)}>Close</Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm">
            This dialog uses your custom size and height settings:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm font-semibold">Width</p>
              <p className="text-lg">{customSize}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-semibold">Height</p>
              <p className="text-lg">{customHeight}</p>
            </Card>
          </div>
          <Separator />
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                Content line {i + 1} - This demonstrates scrolling behavior
              </p>
            ))}
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  )
}
