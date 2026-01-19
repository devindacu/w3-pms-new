import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EnvelopeSimple, Eye, PaperPlaneTilt } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { EmailTemplate } from '@/lib/invoiceEmailTemplates'
import type { HotelBranding, GuestInvoice } from '@/lib/types'
import { generateInvoiceEmail } from '@/lib/invoiceEmailTemplates'
import { createSafeHtml } from '@/lib/sanitize'

interface TestEmailTemplateProps {
  templates: EmailTemplate[]
  branding: HotelBranding | null
}

export function TestEmailTemplate({ templates, branding }: TestEmailTemplateProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [testGuestName, setTestGuestName] = useState('John Smith')
  const [testGuestEmail, setTestGuestEmail] = useState('john.smith@example.com')
  const [testGuestPhone, setTestGuestPhone] = useState('+94 77 123 4567')
  const [testRoomNumber, setTestRoomNumber] = useState('301')
  const [testCheckInDate, setTestCheckInDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [testCheckOutDate, setTestCheckOutDate] = useState(
    new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewSubject, setPreviewSubject] = useState('')

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  const handleGeneratePreview = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template')
      return
    }

    const testInvoice: GuestInvoice = {
      id: `test-${Date.now()}`,
      invoiceNumber: `INV-TEST-${Date.now()}`,
      invoiceType: 'guest-folio',
      status: 'draft',
      folioIds: ['test-folio'],
      reservationIds: ['test-reservation'],
      invoiceDate: Date.now(),
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      guestName: testGuestName,
      guestEmail: testGuestEmail,
      guestPhone: testGuestPhone,
      guestId: 'test-guest',
      roomNumber: testRoomNumber,
      checkInDate: new Date(testCheckInDate).getTime(),
      checkOutDate: new Date(testCheckOutDate).getTime(),
      currency: 'LKR',
      exchangeRate: 1,
      lineItems: [],
      subtotal: 50000,
      discounts: [],
      totalDiscount: 0,
      serviceChargeRate: 10,
      serviceChargeAmount: 5000,
      taxLines: [
        { 
          taxType: 'vat', 
          taxName: 'VAT', 
          taxRate: 15, 
          taxableAmount: 55000,
          taxAmount: 8250,
          isInclusive: false
        }
      ],
      totalTax: 8250,
      grandTotal: 63250,
      payments: [],
      totalPaid: 20000,
      amountDue: 43250,
      creditNotes: [],
      debitNotes: [],
      prepayments: [],
      netAmountDue: 43250,
      isPostedToAccounts: false,
      deliveryMethods: [],
      auditTrail: [],
      isGroupMaster: false,
      isTaxExempt: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'test-user',
    }

    const email = generateInvoiceEmail(testInvoice, selectedTemplate, branding)
    
    setPreviewHtml(email.bodyHtml)
    setPreviewSubject(email.subject)
    toast.success('Email preview generated!')
  }

  const handleSendTestEmail = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template')
      return
    }

    if (!testGuestEmail) {
      toast.error('Please enter a recipient email')
      return
    }

    toast.success(`Test email would be sent to: ${testGuestEmail}`, {
      description: `Template: ${selectedTemplate.name}`,
      duration: 5000,
    })
  }

  const preArrivalTemplates = templates.filter(
    t => t.category === 'reservation' && t.name.toLowerCase().includes('pre-arrival')
  )

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} variant="outline" size="lg">
        <PaperPlaneTilt size={20} className="mr-2" />
        Test Email Templates
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Test Email Templates with Hotel Directions</DialogTitle>
            <DialogDescription>
              Preview and test email templates with your hotel's specific directions and travel information
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
            <div className="lg:col-span-1 space-y-4">
              <div>
                <Label htmlFor="template">Select Template</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {preArrivalTemplates.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Pre-Arrival Templates
                        </div>
                        {preArrivalTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Other Templates
                    </div>
                    {templates
                      .filter(t => !preArrivalTemplates.includes(t))
                      .map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Card className="p-4 space-y-3">
                <h4 className="font-semibold text-sm">Test Guest Information</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="guest-name" className="text-xs">Guest Name</Label>
                  <Input
                    id="guest-name"
                    value={testGuestName}
                    onChange={(e) => setTestGuestName(e.target.value)}
                    placeholder="John Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-email" className="text-xs">Guest Email</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={testGuestEmail}
                    onChange={(e) => setTestGuestEmail(e.target.value)}
                    placeholder="guest@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-phone" className="text-xs">Guest Phone</Label>
                  <Input
                    id="guest-phone"
                    value={testGuestPhone}
                    onChange={(e) => setTestGuestPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room-number" className="text-xs">Room Number</Label>
                  <Input
                    id="room-number"
                    value={testRoomNumber}
                    onChange={(e) => setTestRoomNumber(e.target.value)}
                    placeholder="301"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="check-in" className="text-xs">Check-in Date</Label>
                    <Input
                      id="check-in"
                      type="date"
                      value={testCheckInDate}
                      onChange={(e) => setTestCheckInDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="check-out" className="text-xs">Check-out Date</Label>
                    <Input
                      id="check-out"
                      type="date"
                      value={testCheckOutDate}
                      onChange={(e) => setTestCheckOutDate(e.target.value)}
                    />
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-2">
                <Button onClick={handleGeneratePreview} className="w-full">
                  <Eye size={18} className="mr-2" />
                  Generate Preview
                </Button>
                <Button onClick={handleSendTestEmail} variant="outline" className="w-full">
                  <EnvelopeSimple size={18} className="mr-2" />
                  Send Test Email
                </Button>
              </div>

              {selectedTemplate && (
                <Card className="p-4 bg-muted">
                  <h4 className="font-semibold text-sm mb-2">Template Info</h4>
                  <div className="space-y-1 text-xs">
                    <p><span className="font-medium">Category:</span> {selectedTemplate.category}</p>
                    <p><span className="font-medium">Type:</span> {selectedTemplate.invoiceType}</p>
                    <p><span className="font-medium">Status:</span> {selectedTemplate.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Email Preview</TabsTrigger>
                  <TabsTrigger value="directions">Hotel Directions</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-4">
                  {previewHtml ? (
                    <Card className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Subject Line</Label>
                          <p className="font-semibold mt-1">{previewSubject}</p>
                        </div>
                        <ScrollArea className="h-[600px] w-full border rounded-md">
                          <div 
                            className="p-4"
                            dangerouslySetInnerHTML={createSafeHtml(previewHtml, true)}
                          />
                        </ScrollArea>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-12 text-center">
                      <EnvelopeSimple size={64} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Preview Generated</h3>
                      <p className="text-muted-foreground text-sm">
                        Select a template and click "Generate Preview" to see the email
                      </p>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="directions" className="mt-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Hotel Travel Directions Configuration</h3>
                    
                    {branding?.travelDirections ? (
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-4 pr-4">
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">From Airport</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.directionsFromAirport}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">From City Center</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.directionsFromCity}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Driving Directions</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.drivingDirections}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Nearest Landmarks</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.nearestLandmark}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Nearby Attractions</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.nearbyAttractions}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Transportation Options</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.transportationOptions}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Taxi Fare</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.taxiFare}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Public Transport</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.publicTransport}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Shuttle Service</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.shuttleService}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Shuttle Schedule</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.shuttleSchedule}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Local Travel Tips</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.localTravelTips}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Parking Information</Label>
                            <p className="text-sm mt-1 leading-relaxed">{branding.travelDirections.parkingInfo}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">GPS Coordinates</Label>
                            <p className="text-sm mt-1 font-mono">{branding.travelDirections.gpsCoordinates}</p>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Google Maps Link</Label>
                            <a 
                              href={branding.travelDirections.googleMapsLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm mt-1 text-primary hover:underline block"
                            >
                              {branding.travelDirections.googleMapsLink}
                            </a>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground">Waze Link</Label>
                            <a 
                              href={branding.travelDirections.wazeLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm mt-1 text-primary hover:underline block"
                            >
                              {branding.travelDirections.wazeLink}
                            </a>
                          </div>
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                          No travel directions configured yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Go to Settings → Branding to configure hotel travel directions
                        </p>
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
