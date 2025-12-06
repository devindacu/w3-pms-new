import { GuestInvoice, HotelBranding } from './types'
import { formatCurrency } from './helpers'

export interface EmailTemplate {
  id: string
  name: string
  category: 'invoice' | 'reservation' | 'welcome' | 'feedback' | 'marketing' | 'notification'
  invoiceType: 'all' | 'guest-folio' | 'room-only' | 'fnb' | 'extras' | 'group-master' | 'proforma' | 'credit-note' | 'debit-note'
  subject: string
  bodyPlainText: string
  bodyHtml: string
  isActive: boolean
  isDefault: boolean
  variables: TemplateVariable[]
  createdAt: number
  updatedAt: number
  createdBy: string
  tags?: string[]
  description?: string
}

export interface TemplateVariable {
  key: string
  name: string
  description: string
  example: string
  category: 'guest' | 'invoice' | 'hotel' | 'payment' | 'dates' | 'custom'
}

export const AVAILABLE_VARIABLES: TemplateVariable[] = [
  { key: '{{guest_name}}', name: 'Guest Name', description: 'Full name of the guest', example: 'John Doe', category: 'guest' },
  { key: '{{guest_first_name}}', name: 'Guest First Name', description: 'First name only', example: 'John', category: 'guest' },
  { key: '{{guest_email}}', name: 'Guest Email', description: 'Guest email address', example: 'john@example.com', category: 'guest' },
  { key: '{{guest_phone}}', name: 'Guest Phone', description: 'Guest phone number', example: '+94 77 123 4567', category: 'guest' },
  { key: '{{company_name}}', name: 'Company Name', description: 'Corporate guest company name', example: 'ABC Corp Ltd', category: 'guest' },
  { key: '{{guest_nationality}}', name: 'Guest Nationality', description: 'Guest nationality/country', example: 'Sri Lanka', category: 'guest' },
  { key: '{{guest_preferences}}', name: 'Guest Preferences', description: 'Special requests or preferences', example: 'Non-smoking, high floor', category: 'guest' },
  
  { key: '{{invoice_number}}', name: 'Invoice Number', description: 'Unique invoice number', example: 'INV-2024-0001', category: 'invoice' },
  { key: '{{invoice_type}}', name: 'Invoice Type', description: 'Type of invoice', example: 'Guest Folio Invoice', category: 'invoice' },
  { key: '{{invoice_date}}', name: 'Invoice Date', description: 'Date invoice was issued', example: 'January 15, 2024', category: 'invoice' },
  { key: '{{due_date}}', name: 'Due Date', description: 'Payment due date', example: 'January 30, 2024', category: 'invoice' },
  { key: '{{subtotal}}', name: 'Subtotal', description: 'Total before tax and service charge', example: 'LKR 50,000.00', category: 'invoice' },
  { key: '{{service_charge}}', name: 'Service Charge', description: 'Service charge amount', example: 'LKR 5,000.00', category: 'invoice' },
  { key: '{{tax_amount}}', name: 'Tax Amount', description: 'Total tax amount', example: 'LKR 8,250.00', category: 'invoice' },
  { key: '{{grand_total}}', name: 'Grand Total', description: 'Final total amount', example: 'LKR 63,250.00', category: 'invoice' },
  { key: '{{amount_paid}}', name: 'Amount Paid', description: 'Total amount already paid', example: 'LKR 20,000.00', category: 'invoice' },
  { key: '{{amount_due}}', name: 'Amount Due', description: 'Remaining amount to pay', example: 'LKR 43,250.00', category: 'invoice' },
  { key: '{{currency}}', name: 'Currency', description: 'Invoice currency', example: 'LKR', category: 'invoice' },
  { key: '{{confirmation_number}}', name: 'Confirmation Number', description: 'Booking confirmation number', example: 'CNF-2024-0001', category: 'invoice' },
  
  { key: '{{room_number}}', name: 'Room Number', description: 'Guest room number', example: '301', category: 'invoice' },
  { key: '{{room_type}}', name: 'Room Type', description: 'Type of room booked', example: 'Deluxe Ocean View', category: 'invoice' },
  { key: '{{check_in_date}}', name: 'Check-in Date', description: 'Guest check-in date', example: 'January 10, 2024', category: 'dates' },
  { key: '{{check_out_date}}', name: 'Check-out Date', description: 'Guest check-out date', example: 'January 15, 2024', category: 'dates' },
  { key: '{{check_in_time}}', name: 'Check-in Time', description: 'Standard check-in time', example: '2:00 PM', category: 'dates' },
  { key: '{{check_out_time}}', name: 'Check-out Time', description: 'Standard check-out time', example: '12:00 PM', category: 'dates' },
  { key: '{{nights_stayed}}', name: 'Nights Stayed', description: 'Number of nights', example: '5 nights', category: 'dates' },
  { key: '{{number_of_guests}}', name: 'Number of Guests', description: 'Total guest count', example: '2 Adults', category: 'invoice' },
  
  { key: '{{hotel_name}}', name: 'Hotel Name', description: 'Name of the hotel', example: 'W3 Hotel & Resort', category: 'hotel' },
  { key: '{{hotel_address}}', name: 'Hotel Address', description: 'Hotel physical address', example: '123 Beach Road, Colombo', category: 'hotel' },
  { key: '{{hotel_phone}}', name: 'Hotel Phone', description: 'Hotel contact number', example: '+94 11 234 5678', category: 'hotel' },
  { key: '{{hotel_email}}', name: 'Hotel Email', description: 'Hotel email address', example: 'info@w3hotel.com', category: 'hotel' },
  { key: '{{hotel_website}}', name: 'Hotel Website', description: 'Hotel website URL', example: 'www.w3hotel.com', category: 'hotel' },
  { key: '{{tax_registration}}', name: 'Tax Registration', description: 'Hotel tax/VAT number', example: 'VAT-123456789', category: 'hotel' },
  { key: '{{wifi_password}}', name: 'WiFi Password', description: 'Guest WiFi access password', example: 'Welcome2024', category: 'hotel' },
  { key: '{{parking_info}}', name: 'Parking Information', description: 'Parking availability and details', example: 'Complimentary valet parking', category: 'hotel' },
  
  { key: '{{payment_link}}', name: 'Payment Link', description: 'Online payment URL', example: 'https://pay.w3hotel.com/inv123', category: 'payment' },
  { key: '{{bank_name}}', name: 'Bank Name', description: 'Hotel bank name', example: 'Commercial Bank', category: 'payment' },
  { key: '{{account_number}}', name: 'Account Number', description: 'Hotel bank account number', example: '1234567890', category: 'payment' },
  { key: '{{account_name}}', name: 'Account Name', description: 'Bank account holder name', example: 'W3 Hotels (Pvt) Ltd', category: 'payment' },
  { key: '{{swift_code}}', name: 'SWIFT Code', description: 'Bank SWIFT/BIC code', example: 'CCEYLKLX', category: 'payment' },
  
  { key: '{{current_date}}', name: 'Current Date', description: 'Today\'s date', example: 'January 20, 2024', category: 'dates' },
  { key: '{{current_time}}', name: 'Current Time', description: 'Current time', example: '2:30 PM', category: 'dates' },
  
  { key: '{{brand_primary_color}}', name: 'Primary Brand Color', description: 'Hotel primary brand color', example: '#2c5f2d', category: 'custom' },
  { key: '{{brand_secondary_color}}', name: 'Secondary Brand Color', description: 'Hotel secondary brand color', example: '#97bc62', category: 'custom' },
  { key: '{{brand_accent_color}}', name: 'Accent Brand Color', description: 'Hotel accent brand color', example: '#4a7c59', category: 'custom' },
  
  { key: '{{cancellation_policy}}', name: 'Cancellation Policy', description: 'Booking cancellation terms', example: 'Free cancellation up to 48 hours', category: 'custom' },
  { key: '{{special_offers}}', name: 'Special Offers', description: 'Current promotions or offers', example: '20% off spa services', category: 'custom' },
  { key: '{{amenities_list}}', name: 'Amenities List', description: 'Hotel facilities and services', example: 'Pool, Spa, Gym, Restaurant', category: 'custom' },
  
  { key: '{{directions_from_airport}}', name: 'Directions from Airport', description: 'How to reach hotel from airport', example: '15 minutes by taxi', category: 'custom' },
  { key: '{{nearest_landmark}}', name: 'Nearest Landmark', description: 'Popular landmark near hotel', example: 'Next to City Mall', category: 'custom' },
  { key: '{{transportation_options}}', name: 'Transportation Options', description: 'Available transport methods', example: 'Taxi, Shuttle, Public Bus', category: 'custom' },
  { key: '{{shuttle_service}}', name: 'Shuttle Service', description: 'Hotel shuttle availability', example: 'Complimentary airport shuttle', category: 'custom' },
  { key: '{{check_in_requirements}}', name: 'Check-in Requirements', description: 'Documents needed for check-in', example: 'Valid ID and booking confirmation', category: 'custom' },
  { key: '{{early_checkin_available}}', name: 'Early Check-in Info', description: 'Early check-in availability', example: 'Subject to availability', category: 'custom' },
  { key: '{{late_checkout_available}}', name: 'Late Checkout Info', description: 'Late checkout availability', example: 'Available for additional charge', category: 'custom' },
  { key: '{{google_maps_link}}', name: 'Google Maps Link', description: 'Link to hotel on Google Maps', example: 'https://maps.google.com/?q=Hotel', category: 'custom' },
]

export const DEFAULT_TEMPLATES: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
  {
    name: 'Standard Guest Invoice',
    category: 'invoice',
    invoiceType: 'guest-folio',
    description: 'Professional invoice email for guest checkout',
    tags: ['invoice', 'payment', 'checkout'],
    subject: 'Your Invoice from {{hotel_name}} - {{invoice_number}}',
    bodyPlainText: `Dear {{guest_name}},

Thank you for staying with us at {{hotel_name}}. Please find attached your invoice for your recent stay.

Invoice Details:
- Invoice Number: {{invoice_number}}
- Invoice Date: {{invoice_date}}
- Room Number: {{room_number}}
- Check-in: {{check_in_date}}
- Check-out: {{check_out_date}}

Amount Summary:
- Subtotal: {{subtotal}}
- Service Charge: {{service_charge}}
- Tax: {{tax_amount}}
- Grand Total: {{grand_total}}
- Amount Paid: {{amount_paid}}
- Balance Due: {{amount_due}}

{{#if amount_due > 0}}
Payment Information:
Please settle the outstanding balance within {{payment_terms}} days. You can make payment through:
- Bank Transfer: {{bank_name}}, Account: {{account_number}}
- Online Payment: {{payment_link}}
{{/if}}

Should you have any questions regarding this invoice, please don't hesitate to contact us at {{hotel_email}} or {{hotel_phone}}.

We hope you enjoyed your stay and look forward to welcoming you back soon!

Best regards,
{{hotel_name}} Team

---
{{hotel_name}}
{{hotel_address}}
Tel: {{hotel_phone}} | Email: {{hotel_email}}
{{hotel_website}}
Tax Registration: {{tax_registration}}`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'IBM Plex Sans', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      margin: 20px auto;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: {{brand_primary_color}};
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.95;
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 16px;
      color: #333333;
      margin-bottom: 20px;
    }
    .info-card {
      background-color: #f9fafa;
      border-left: 4px solid {{brand_primary_color}};
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-card h3 {
      margin: 0 0 15px 0;
      color: {{brand_primary_color}};
      font-size: 18px;
      font-weight: 600;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e8ebe9;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #666666;
      font-size: 14px;
    }
    .info-value {
      color: #333333;
      font-weight: 600;
      font-size: 14px;
    }
    .total-section {
      background-color: #f9fafa;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
      border: 2px solid {{brand_primary_color}};
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 16px;
    }
    .total-row.grand {
      border-top: 2px solid {{brand_primary_color}};
      margin-top: 10px;
      padding-top: 15px;
      font-size: 20px;
      font-weight: 700;
      color: {{brand_primary_color}};
    }
    .payment-info {
      background-color: #fffbf0;
      border: 2px solid {{brand_accent_color}};
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }
    .payment-info h3 {
      margin: 0 0 15px 0;
      color: {{brand_primary_color}};
      font-size: 18px;
    }
    .payment-method {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
      border-left: 3px solid {{brand_accent_color}};
    }
    .button {
      display: inline-block;
      background: {{brand_primary_color}};
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 10px 0;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f9fafa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e8ebe9;
    }
    .footer p {
      margin: 5px 0;
      font-size: 13px;
      color: #666666;
    }
    .footer .hotel-name {
      font-weight: 700;
      color: {{brand_primary_color}};
      font-size: 16px;
      margin-bottom: 10px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, {{brand_primary_color}}, transparent);
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{hotel_name}}</h1>
      <p>Invoice & Statement</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear {{guest_name}},</p>
      
      <p>Thank you for staying with us at <strong>{{hotel_name}}</strong>. Please find your invoice details below for your recent stay.</p>
      
      <div class="info-card">
        <h3>📋 Invoice Details</h3>
        <div class="info-row">
          <span class="info-label">Invoice Number:</span>
          <span class="info-value">{{invoice_number}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Invoice Date:</span>
          <span class="info-value">{{invoice_date}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Room Number:</span>
          <span class="info-value">{{room_number}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Check-in:</span>
          <span class="info-value">{{check_in_date}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Check-out:</span>
          <span class="info-value">{{check_out_date}}</span>
        </div>
      </div>
      
      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>{{subtotal}}</span>
        </div>
        <div class="total-row">
          <span>Service Charge:</span>
          <span>{{service_charge}}</span>
        </div>
        <div class="total-row">
          <span>Tax:</span>
          <span>{{tax_amount}}</span>
        </div>
        <div class="total-row grand">
          <span>Grand Total:</span>
          <span>{{grand_total}}</span>
        </div>
        <div class="total-row" style="color: #388e3c;">
          <span>Amount Paid:</span>
          <span>{{amount_paid}}</span>
        </div>
        <div class="total-row" style="color: #f57c00; font-weight: 600;">
          <span>Balance Due:</span>
          <span>{{amount_due}}</span>
        </div>
      </div>
      
      <div class="payment-info">
        <h3>💳 Payment Information</h3>
        <p style="margin: 0 0 15px 0; color: #666;">Please settle the outstanding balance at your earliest convenience.</p>
        
        <div class="payment-method">
          <strong>Bank Transfer</strong><br>
          Bank: {{bank_name}}<br>
          Account Name: {{account_name}}<br>
          Account Number: {{account_number}}<br>
          SWIFT Code: {{swift_code}}
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <a href="{{payment_link}}" class="button">Pay Online Now</a>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <p style="color: #666; font-size: 14px;">Should you have any questions regarding this invoice, please don't hesitate to contact us at <a href="mailto:{{hotel_email}}" style="color: {{brand_primary_color}};">{{hotel_email}}</a> or call us at {{hotel_phone}}.</p>
      
      <p style="color: {{brand_primary_color}}; font-weight: 600; margin-top: 20px;">We hope you enjoyed your stay and look forward to welcoming you back soon!</p>
    </div>
    
    <div class="footer">
      <p class="hotel-name">{{hotel_name}}</p>
      <p>{{hotel_address}}</p>
      <p>Tel: {{hotel_phone}} | Email: {{hotel_email}}</p>
      <p>{{hotel_website}}</p>
      <p style="margin-top: 15px; font-size: 12px;">Tax Registration: {{tax_registration}}</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: true,
    variables: AVAILABLE_VARIABLES,
  },
  {
    name: 'Room Only Invoice',
    category: 'invoice',
    invoiceType: 'room-only',
    description: 'Simple room charges invoice',
    tags: ['invoice', 'room'],
    subject: 'Room Charges Invoice - {{invoice_number}}',
    bodyPlainText: `Dear {{guest_name}},

Please find your room charges invoice attached.

Invoice Number: {{invoice_number}}
Date: {{invoice_date}}
Room: {{room_number}}
Stay Period: {{check_in_date}} to {{check_out_date}}
Total Nights: {{nights_stayed}}

Total Amount: {{grand_total}}

Thank you for choosing {{hotel_name}}.

Best regards,
{{hotel_name}} Team`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'IBM Plex Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{brand_primary_color}}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
    .total { font-size: 20px; font-weight: bold; color: {{brand_primary_color}}; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{hotel_name}}</h1>
    <p>Room Charges Invoice</p>
  </div>
  <div class="content">
    <p>Dear {{guest_name}},</p>
    <p>Please find your room charges invoice details below.</p>
    <p><strong>Invoice Number:</strong> {{invoice_number}}<br>
    <strong>Date:</strong> {{invoice_date}}<br>
    <strong>Room:</strong> {{room_number}}<br>
    <strong>Stay Period:</strong> {{check_in_date}} to {{check_out_date}}</p>
    <p class="total">Total Amount: {{grand_total}}</p>
    <p>Thank you for choosing {{hotel_name}}.</p>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: false,
    variables: AVAILABLE_VARIABLES,
  },
  {
    name: 'F&B Invoice',
    category: 'invoice',
    invoiceType: 'fnb',
    description: 'Restaurant and bar charges',
    tags: ['invoice', 'fnb', 'restaurant'],
    subject: 'F&B Invoice from {{hotel_name}} - {{invoice_number}}',
    bodyPlainText: `Dear {{guest_name}},

Thank you for dining with us. Please find your F&B invoice attached.

Invoice Number: {{invoice_number}}
Date: {{invoice_date}}

Amount: {{grand_total}}

We hope you enjoyed your meal and look forward to serving you again.

Best regards,
{{hotel_name}} Restaurant Team`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'IBM Plex Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{brand_accent_color}}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fffef8; padding: 20px; border: 2px solid {{brand_accent_color}}; border-top: none; border-radius: 0 0 8px 8px; }
    .total { font-size: 20px; font-weight: bold; color: {{brand_accent_color}}; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍽️ {{hotel_name}}</h1>
    <p>Restaurant & Bar Invoice</p>
  </div>
  <div class="content">
    <p>Dear {{guest_name}},</p>
    <p>Thank you for dining with us. Please find your F&B invoice details below.</p>
    <p><strong>Invoice Number:</strong> {{invoice_number}}<br>
    <strong>Date:</strong> {{invoice_date}}</p>
    <p class="total">Total Amount: {{grand_total}}</p>
    <p>We hope you enjoyed your meal and look forward to serving you again soon!</p>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: false,
    variables: AVAILABLE_VARIABLES,
  },
  {
    name: 'Group Master Invoice',
    category: 'invoice',
    invoiceType: 'group-master',
    description: 'Consolidated invoice for group bookings',
    tags: ['invoice', 'group', 'corporate'],
    subject: 'Group Invoice - {{invoice_number}} - {{hotel_name}}',
    bodyPlainText: `Dear {{guest_name}},

Please find attached the consolidated invoice for your group booking at {{hotel_name}}.

Invoice Number: {{invoice_number}}
Invoice Date: {{invoice_date}}
Group Check-in: {{check_in_date}}
Group Check-out: {{check_out_date}}

Total Amount: {{grand_total}}
Amount Paid: {{amount_paid}}
Balance Due: {{amount_due}}

Payment is due by {{due_date}}.

Bank Details:
{{bank_name}}
Account: {{account_number}}
SWIFT: {{swift_code}}

Thank you for choosing {{hotel_name}} for your group event.

Best regards,
{{hotel_name}} Group Sales Team`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'IBM Plex Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; }
    .header { background: {{brand_secondary_color}}; color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f5f5f5; padding: 25px; border: 2px solid {{brand_secondary_color}}; border-top: none; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 4px; border-left: 4px solid {{brand_primary_color}}; }
    .total-box { background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 4px; border: 2px solid {{brand_primary_color}}; }
    .total { font-size: 22px; font-weight: bold; color: {{brand_primary_color}}; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{hotel_name}}</h1>
    <p>Group Master Invoice</p>
  </div>
  <div class="content">
    <p>Dear {{guest_name}},</p>
    <p>Please find attached the consolidated invoice for your group booking.</p>
    
    <div class="info-box">
      <p><strong>Invoice Number:</strong> {{invoice_number}}<br>
      <strong>Invoice Date:</strong> {{invoice_date}}<br>
      <strong>Group Check-in:</strong> {{check_in_date}}<br>
      <strong>Group Check-out:</strong> {{check_out_date}}</p>
    </div>
    
    <div class="total-box">
      <p class="total">Total Amount: {{grand_total}}</p>
      <p><strong>Amount Paid:</strong> {{amount_paid}}<br>
      <strong>Balance Due:</strong> <span style="color: #d32f2f;">{{amount_due}}</span></p>
      <p><strong>Payment Due Date:</strong> {{due_date}}</p>
    </div>
    
    <div class="info-box">
      <h3>Bank Transfer Details</h3>
      <p><strong>Bank:</strong> {{bank_name}}<br>
      <strong>Account Name:</strong> {{account_name}}<br>
      <strong>Account Number:</strong> {{account_number}}<br>
      <strong>SWIFT Code:</strong> {{swift_code}}</p>
    </div>
    
    <p>Thank you for choosing {{hotel_name}} for your group event.</p>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: false,
    variables: AVAILABLE_VARIABLES,
  },
  {
    name: 'Proforma Invoice',
    category: 'invoice',
    invoiceType: 'proforma',
    description: 'Quotation for upcoming stay',
    tags: ['invoice', 'quote', 'proforma'],
    subject: 'Proforma Invoice - {{invoice_number}} - {{hotel_name}}',
    bodyPlainText: `Dear {{guest_name}},

Please find attached the proforma invoice for your upcoming stay at {{hotel_name}}.

Proforma Invoice Number: {{invoice_number}}
Issue Date: {{invoice_date}}
Expected Check-in: {{check_in_date}}
Expected Check-out: {{check_out_date}}

Estimated Total: {{grand_total}}

This is a preliminary invoice and not a demand for payment. Final charges may vary based on actual consumption and services used.

For reservations or inquiries, please contact us at {{hotel_email}} or {{hotel_phone}}.

Best regards,
{{hotel_name}} Reservations Team`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'IBM Plex Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{brand_secondary_color}}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .watermark { text-align: center; font-size: 32px; color: {{brand_secondary_color}}; opacity: 0.1; transform: rotate(-15deg); margin: 30px 0; }
    .content { background: #fafafa; padding: 20px; border: 2px dashed {{brand_secondary_color}}; border-top: none; border-radius: 0 0 8px 8px; }
    .notice { background: #fffbf0; border-left: 4px solid {{brand_accent_color}}; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{hotel_name}}</h1>
    <p>Proforma Invoice (Quotation)</p>
  </div>
  <div class="watermark">PROFORMA</div>
  <div class="content">
    <p>Dear {{guest_name}},</p>
    <p>Please find the proforma invoice for your upcoming stay.</p>
    
    <p><strong>Proforma Invoice Number:</strong> {{invoice_number}}<br>
    <strong>Issue Date:</strong> {{invoice_date}}<br>
    <strong>Expected Check-in:</strong> {{check_in_date}}<br>
    <strong>Expected Check-out:</strong> {{check_out_date}}</p>
    
    <p style="font-size: 20px; font-weight: bold; color: {{brand_primary_color}}; margin: 20px 0;">Estimated Total: {{grand_total}}</p>
    
    <div class="notice">
      <strong>⚠️ Important Notice:</strong><br>
      This is a preliminary invoice for reference only and not a demand for payment. Final charges may vary based on actual consumption and services used during your stay.
    </div>
    
    <p>For reservations or inquiries, please contact us at {{hotel_email}} or {{hotel_phone}}.</p>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: false,
    variables: AVAILABLE_VARIABLES,
  },
  {
    name: 'Credit Note',
    category: 'invoice',
    invoiceType: 'credit-note',
    description: 'Refund or credit notification',
    tags: ['invoice', 'credit', 'refund'],
    subject: 'Credit Note Issued - {{invoice_number}} - {{hotel_name}}',
    bodyPlainText: `Dear {{guest_name}},

A credit note has been issued for your account.

Credit Note Number: {{invoice_number}}
Date: {{invoice_date}}
Original Invoice: [Reference]

Credit Amount: {{grand_total}}

This credit will be applied to your account and can be used for future stays or refunded as per our refund policy.

If you have any questions, please contact us at {{hotel_email}}.

Best regards,
{{hotel_name}} Accounts Team`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'IBM Plex Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{brand_accent_color}}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f0fcf5; padding: 20px; border: 2px solid {{brand_accent_color}}; border-top: none; border-radius: 0 0 8px 8px; }
    .credit-amount { font-size: 24px; font-weight: bold; color: {{brand_accent_color}}; text-align: center; margin: 25px 0; padding: 20px; background: white; border-radius: 8px; border: 2px solid {{brand_accent_color}}; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{hotel_name}}</h1>
    <p>Credit Note</p>
  </div>
  <div class="content">
    <p>Dear {{guest_name}},</p>
    <p>A credit note has been issued for your account.</p>
    
    <p><strong>Credit Note Number:</strong> {{invoice_number}}<br>
    <strong>Date:</strong> {{invoice_date}}</p>
    
    <div class="credit-amount">
      Credit Amount<br>
      {{grand_total}}
    </div>
    
    <p>This credit will be applied to your account and can be used for future stays or refunded as per our refund policy.</p>
    
    <p>If you have any questions, please contact us at {{hotel_email}}.</p>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: false,
    variables: AVAILABLE_VARIABLES,
  },
  {
    name: 'Booking Confirmation - Standard',
    category: 'reservation',
    invoiceType: 'all',
    description: 'Confirm guest reservation details',
    tags: ['reservation', 'confirmation', 'booking'],
    subject: '✓ Booking Confirmed - {{hotel_name}} - Confirmation {{confirmation_number}}',
    bodyPlainText: `Dear {{guest_name}},

Thank you for choosing {{hotel_name}}! We're delighted to confirm your reservation.

RESERVATION DETAILS
Confirmation Number: {{confirmation_number}}
Guest Name: {{guest_name}}
Email: {{guest_email}}
Phone: {{guest_phone}}

STAY INFORMATION
Check-in Date: {{check_in_date}} (from {{check_in_time}})
Check-out Date: {{check_out_date}} (by {{check_out_time}})
Number of Nights: {{nights_stayed}}
Room Type: {{room_type}}
Number of Guests: {{number_of_guests}}

BOOKING SUMMARY
Total Amount: {{grand_total}}
Amount Paid: {{amount_paid}}
Balance Due: {{amount_due}}

IMPORTANT INFORMATION
- Check-in time: {{check_in_time}}
- Check-out time: {{check_out_time}}
- Cancellation Policy: {{cancellation_policy}}

GETTING HERE
{{hotel_name}}
{{hotel_address}}
Parking: {{parking_info}}

We look forward to welcoming you and ensuring you have a wonderful stay!

If you have any special requests or questions, please don't hesitate to contact us:
Phone: {{hotel_phone}}
Email: {{hotel_email}}
Website: {{hotel_website}}

Best regards,
The {{hotel_name}} Team`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #f5f7f6;
    }
    .email-container {
      background-color: #ffffff;
      margin: 20px auto;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, {{brand_primary_color}}, {{brand_accent_color}});
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header .checkmark {
      font-size: 48px;
      margin-bottom: 15px;
      display: block;
    }
    .header p {
      margin: 5px 0 0 0;
      font-size: 16px;
      opacity: 0.95;
      font-weight: 500;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 25px;
      font-weight: 500;
    }
    .confirmation-number {
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      border: 2px solid {{brand_primary_color}};
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .confirmation-number h2 {
      margin: 0 0 10px 0;
      color: {{brand_primary_color}};
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .confirmation-number .number {
      font-size: 28px;
      font-weight: 700;
      color: {{brand_primary_color}};
      font-family: 'Courier New', monospace;
      letter-spacing: 2px;
    }
    .section {
      background-color: #f9fafa;
      border-left: 4px solid {{brand_primary_color}};
      padding: 25px;
      margin: 25px 0;
      border-radius: 6px;
    }
    .section h3 {
      margin: 0 0 20px 0;
      color: {{brand_primary_color}};
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e8ebe9;
      align-items: center;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #666666;
      font-size: 14px;
      font-weight: 500;
    }
    .detail-value {
      color: #333333;
      font-weight: 600;
      font-size: 15px;
      text-align: right;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fff9e6, #fffef5);
      border: 2px solid {{brand_accent_color}};
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .highlight-box h3 {
      margin: 0 0 15px 0;
      color: {{brand_primary_color}};
      font-size: 18px;
      font-weight: 700;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 16px;
    }
    .price-row.total {
      border-top: 2px solid {{brand_primary_color}};
      margin-top: 15px;
      padding-top: 15px;
      font-size: 22px;
      font-weight: 700;
      color: {{brand_primary_color}};
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .info-card {
      background: white;
      padding: 18px;
      border-radius: 6px;
      border: 1px solid #e8ebe9;
      text-align: center;
    }
    .info-card .icon {
      font-size: 32px;
      margin-bottom: 10px;
      color: {{brand_accent_color}};
    }
    .info-card .label {
      font-size: 12px;
      color: #666666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
      font-weight: 600;
    }
    .info-card .value {
      font-size: 16px;
      color: #333333;
      font-weight: 700;
    }
    .button {
      display: inline-block;
      background: {{brand_primary_color}};
      color: white !important;
      padding: 14px 35px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 0;
      text-align: center;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    .button:hover {
      background: {{brand_accent_color}};
      transform: translateY(-1px);
    }
    .important-info {
      background: #fffbf0;
      border: 2px solid #ffa726;
      border-radius: 6px;
      padding: 20px;
      margin: 25px 0;
    }
    .important-info h3 {
      margin: 0 0 15px 0;
      color: #f57c00;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .important-info ul {
      margin: 0;
      padding-left: 20px;
    }
    .important-info li {
      margin: 8px 0;
      color: #666;
    }
    .footer {
      background-color: #f9fafa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e8ebe9;
    }
    .footer .hotel-name {
      font-weight: 700;
      color: {{brand_primary_color}};
      font-size: 18px;
      margin-bottom: 15px;
    }
    .footer p {
      margin: 5px 0;
      font-size: 13px;
      color: #666666;
      line-height: 1.8;
    }
    .footer .contact-links {
      margin-top: 15px;
    }
    .footer .contact-links a {
      color: {{brand_primary_color}};
      text-decoration: none;
      margin: 0 10px;
      font-weight: 600;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, {{brand_primary_color}}, transparent);
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .header h1 {
        font-size: 26px;
      }
      .content {
        padding: 25px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <span class="checkmark">✓</span>
      <h1>Booking Confirmed!</h1>
      <p>{{hotel_name}}</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear {{guest_name}},</p>
      
      <p>Thank you for choosing <strong>{{hotel_name}}</strong>! We're delighted to confirm your reservation and look forward to welcoming you for what we hope will be a memorable stay.</p>
      
      <div class="confirmation-number">
        <h2>Your Confirmation Number</h2>
        <div class="number">{{confirmation_number}}</div>
      </div>
      
      <div class="section">
        <h3>📋 Reservation Details</h3>
        <div class="detail-row">
          <span class="detail-label">Guest Name</span>
          <span class="detail-value">{{guest_name}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">{{guest_email}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone</span>
          <span class="detail-value">{{guest_phone}}</span>
        </div>
      </div>
      
      <div class="info-grid">
        <div class="info-card">
          <div class="icon">📅</div>
          <div class="label">Check-in</div>
          <div class="value">{{check_in_date}}</div>
          <div style="font-size: 13px; color: #999; margin-top: 5px;">from {{check_in_time}}</div>
        </div>
        <div class="info-card">
          <div class="icon">📅</div>
          <div class="label">Check-out</div>
          <div class="value">{{check_out_date}}</div>
          <div style="font-size: 13px; color: #999; margin-top: 5px;">by {{check_out_time}}</div>
        </div>
        <div class="info-card">
          <div class="icon">🛏️</div>
          <div class="label">Room Type</div>
          <div class="value">{{room_type}}</div>
        </div>
        <div class="info-card">
          <div class="icon">👥</div>
          <div class="label">Guests</div>
          <div class="value">{{number_of_guests}}</div>
        </div>
      </div>
      
      <div class="highlight-box">
        <h3>💰 Booking Summary</h3>
        <div class="price-row">
          <span>Total Amount:</span>
          <span>{{grand_total}}</span>
        </div>
        <div class="price-row" style="color: #388e3c;">
          <span>Amount Paid:</span>
          <span>{{amount_paid}}</span>
        </div>
        <div class="price-row total">
          <span>Balance Due:</span>
          <span>{{amount_due}}</span>
        </div>
      </div>
      
      <div class="important-info">
        <h3><span style="font-size: 20px;">⚠️</span> Important Information</h3>
        <ul>
          <li><strong>Check-in Time:</strong> {{check_in_time}}</li>
          <li><strong>Check-out Time:</strong> {{check_out_time}}</li>
          <li><strong>Cancellation Policy:</strong> {{cancellation_policy}}</li>
          <li><strong>Special Requests:</strong> {{guest_preferences}}</li>
        </ul>
      </div>
      
      <div class="section">
        <h3>📍 Getting Here</h3>
        <p style="margin: 0; line-height: 1.8;">
          <strong>{{hotel_name}}</strong><br>
          {{hotel_address}}<br>
          <strong>Parking:</strong> {{parking_info}}
        </p>
      </div>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="{{payment_link}}" class="button">Manage My Booking</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.8;">
        If you have any special requests or questions about your stay, please don't hesitate to reach out to our team. We're here to ensure your visit is perfect in every way.
      </p>
      
      <p style="color: {{brand_primary_color}}; font-weight: 700; font-size: 16px; margin-top: 25px;">
        We can't wait to welcome you to {{hotel_name}}!
      </p>
    </div>
    
    <div class="footer">
      <p class="hotel-name">{{hotel_name}}</p>
      <p>{{hotel_address}}</p>
      <div class="contact-links">
        <a href="tel:{{hotel_phone}}">{{hotel_phone}}</a> |
        <a href="mailto:{{hotel_email}}">{{hotel_email}}</a>
      </div>
      <p style="margin-top: 10px;">{{hotel_website}}</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: false,
    variables: AVAILABLE_VARIABLES,
  },
  {
    name: 'Welcome Email - Deluxe',
    category: 'welcome',
    invoiceType: 'all',
    description: 'Welcome guests upon check-in with detailed information',
    tags: ['welcome', 'checkin', 'greeting', 'arrival'],
    subject: '🏨 Welcome to {{hotel_name}}, {{guest_first_name}}!',
    bodyPlainText: `Dear {{guest_first_name}},

Welcome to {{hotel_name}}!

We're absolutely delighted to have you with us and hope your stay will be comfortable and memorable.

YOUR STAY DETAILS
Room Number: {{room_number}}
Room Type: {{room_type}}
Check-out Date: {{check_out_date}} at {{check_out_time}}

HOTEL AMENITIES
{{amenities_list}}

CONNECTIVITY
Wi-Fi Network: Available in all areas
Password: {{wifi_password}}

DINING
Breakfast: 7:00 AM - 10:30 AM
Lunch: 12:00 PM - 3:00 PM
Dinner: 6:00 PM - 10:30 PM

SPECIAL OFFERS
{{special_offers}}

NEED ASSISTANCE?
Our front desk is available 24/7 to assist you with anything you need.
Phone: {{hotel_phone}} (Ext. 0 from your room)
Email: {{hotel_email}}

We wish you a pleasant and relaxing stay!

Warm regards,
The {{hotel_name}} Team`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #f5f7f6;
    }
    .email-container {
      background-color: #ffffff;
      margin: 20px auto;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, {{brand_primary_color}}, {{brand_accent_color}});
      color: #ffffff;
      padding: 50px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255,255,255,0.05) 10px,
        rgba(255,255,255,0.05) 20px
      );
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header .icon {
      font-size: 64px;
      margin-bottom: 15px;
      display: block;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .header p {
      margin: 5px 0 0 0;
      font-size: 18px;
      opacity: 0.95;
      font-weight: 500;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 20px;
    }
    .welcome-message {
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      border-radius: 8px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
      border: 2px solid {{brand_primary_color}};
    }
    .welcome-message h2 {
      margin: 0 0 10px 0;
      color: {{brand_primary_color}};
      font-size: 24px;
      font-weight: 700;
    }
    .welcome-message p {
      margin: 0;
      color: #666;
      font-size: 15px;
    }
    .room-details {
      background: #f9fafa;
      border-left: 4px solid {{brand_primary_color}};
      border-radius: 6px;
      padding: 25px;
      margin: 25px 0;
    }
    .room-details h3 {
      margin: 0 0 20px 0;
      color: {{brand_primary_color}};
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e8ebe9;
    }
    .detail-item:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }
    .detail-value {
      color: #333;
      font-weight: 600;
      font-size: 15px;
    }
    .amenities-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 25px 0;
    }
    .amenity-card {
      background: white;
      border: 2px solid #e8ebe9;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s ease;
    }
    .amenity-card:hover {
      border-color: {{brand_accent_color}};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .amenity-card .icon {
      font-size: 36px;
      margin-bottom: 10px;
      color: {{brand_accent_color}};
    }
    .amenity-card h4 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 15px;
      font-weight: 700;
    }
    .amenity-card p {
      margin: 0;
      color: #666;
      font-size: 12px;
    }
    .info-box {
      background: #fffef5;
      border: 2px solid {{brand_accent_color}};
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-box h3 {
      margin: 0 0 15px 0;
      color: {{brand_primary_color}};
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-box p {
      margin: 8px 0;
      color: #666;
      font-size: 14px;
    }
    .dining-schedule {
      background: white;
      border: 1px solid #e8ebe9;
      border-radius: 6px;
      overflow: hidden;
      margin: 20px 0;
    }
    .dining-row {
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;
      border-bottom: 1px solid #e8ebe9;
    }
    .dining-row:last-child {
      border-bottom: none;
    }
    .dining-row:nth-child(even) {
      background: #f9fafa;
    }
    .dining-name {
      font-weight: 600;
      color: #333;
    }
    .dining-time {
      color: #666;
      font-size: 14px;
    }
    .special-offer {
      background: linear-gradient(135deg, #fff9e6, #fffef5);
      border: 2px solid #ffa726;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      text-align: center;
    }
    .special-offer h3 {
      margin: 0 0 15px 0;
      color: #f57c00;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .special-offer p {
      margin: 0;
      color: #666;
      font-size: 15px;
      line-height: 1.6;
    }
    .cta-section {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      background: {{brand_primary_color}};
      color: white !important;
      padding: 14px 35px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 5px;
      font-size: 15px;
      transition: all 0.3s ease;
    }
    .button:hover {
      background: {{brand_accent_color}};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .button.secondary {
      background: white;
      color: {{brand_primary_color}} !important;
      border: 2px solid {{brand_primary_color}};
    }
    .button.secondary:hover {
      background: {{brand_primary_color}};
      color: white !important;
    }
    .contact-card {
      background: #f9fafa;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      text-align: center;
    }
    .contact-card h3 {
      margin: 0 0 15px 0;
      color: {{brand_primary_color}};
      font-size: 18px;
      font-weight: 700;
    }
    .contact-card p {
      margin: 8px 0;
      color: #666;
      font-size: 14px;
    }
    .contact-card a {
      color: {{brand_primary_color}};
      text-decoration: none;
      font-weight: 600;
    }
    .footer {
      background-color: #f9fafa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e8ebe9;
    }
    .footer .hotel-name {
      font-weight: 700;
      color: {{brand_primary_color}};
      font-size: 18px;
      margin-bottom: 15px;
    }
    .footer p {
      margin: 5px 0;
      font-size: 13px;
      color: #666666;
      line-height: 1.8;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, {{brand_primary_color}}, transparent);
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .amenities-grid {
        grid-template-columns: 1fr;
      }
      .header h1 {
        font-size: 28px;
      }
      .content {
        padding: 25px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-content">
        <span class="icon">🏨</span>
        <h1>Welcome!</h1>
        <p>{{hotel_name}}</p>
      </div>
    </div>
    
    <div class="content">
      <p class="greeting">Dear {{guest_first_name}},</p>
      
      <div class="welcome-message">
        <h2>We're Delighted to Have You!</h2>
        <p>Your comfort and satisfaction are our top priorities. We hope your stay will be comfortable, relaxing, and memorable.</p>
      </div>
      
      <div class="room-details">
        <h3><span>🛏️</span> Your Stay Details</h3>
        <div class="detail-item">
          <span class="detail-label">Room Number</span>
          <span class="detail-value">{{room_number}}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Room Type</span>
          <span class="detail-value">{{room_type}}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Check-out</span>
          <span class="detail-value">{{check_out_date}} at {{check_out_time}}</span>
        </div>
      </div>
      
      <h3 style="color: {{brand_primary_color}}; font-size: 20px; margin: 30px 0 20px 0;">Hotel Amenities & Services</h3>
      
      <div class="amenities-grid">
        <div class="amenity-card">
          <div class="icon">📶</div>
          <h4>Free Wi-Fi</h4>
          <p>{{wifi_password}}</p>
        </div>
        <div class="amenity-card">
          <div class="icon">🍽️</div>
          <h4>Restaurant</h4>
          <p>Open Daily</p>
        </div>
        <div class="amenity-card">
          <div class="icon">🏊</div>
          <h4>Swimming Pool</h4>
          <p>6 AM - 10 PM</p>
        </div>
        <div class="amenity-card">
          <div class="icon">💪</div>
          <h4>Fitness Center</h4>
          <p>24/7 Access</p>
        </div>
      </div>
      
      <div class="info-box">
        <h3><span>🍳</span> Dining Hours</h3>
        <div class="dining-schedule">
          <div class="dining-row">
            <span class="dining-name">Breakfast</span>
            <span class="dining-time">7:00 AM - 10:30 AM</span>
          </div>
          <div class="dining-row">
            <span class="dining-name">Lunch</span>
            <span class="dining-time">12:00 PM - 3:00 PM</span>
          </div>
          <div class="dining-row">
            <span class="dining-name">Dinner</span>
            <span class="dining-time">6:00 PM - 10:30 PM</span>
          </div>
          <div class="dining-row">
            <span class="dining-name">Room Service</span>
            <span class="dining-time">24 Hours</span>
          </div>
        </div>
      </div>
      
      <div class="special-offer">
        <h3><span>🎁</span> Special Offers</h3>
        <p><strong>{{special_offers}}</strong></p>
        <p style="margin-top: 10px; font-size: 13px;">Ask our concierge for more details!</p>
      </div>
      
      <div class="cta-section">
        <a href="tel:{{hotel_phone}}" class="button">Call Front Desk</a>
        <a href="mailto:{{hotel_email}}" class="button secondary">Email Us</a>
      </div>
      
      <div class="divider"></div>
      
      <div class="contact-card">
        <h3>Need Assistance?</h3>
        <p>Our front desk is available <strong>24/7</strong> to assist you with anything you need.</p>
        <p>
          📞 <a href="tel:{{hotel_phone}}">{{hotel_phone}}</a> (Ext. 0 from your room)<br>
          ✉️ <a href="mailto:{{hotel_email}}">{{hotel_email}}</a>
        </p>
      </div>
      
      <p style="color: {{brand_primary_color}}; font-weight: 700; font-size: 18px; text-align: center; margin-top: 30px;">
        We wish you a pleasant and relaxing stay!
      </p>
    </div>
    
    <div class="footer">
      <p class="hotel-name">{{hotel_name}}</p>
      <p>{{hotel_address}}</p>
      <p>{{hotel_phone}} | {{hotel_email}}</p>
      <p style="margin-top: 10px;">{{hotel_website}}</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: false,
    variables: AVAILABLE_VARIABLES,
  },
  {
    name: 'Feedback Request',
    category: 'feedback',
    invoiceType: 'all',
    description: 'Request guest feedback after checkout',
    tags: ['feedback', 'review', 'checkout'],
    subject: 'How was your stay at {{hotel_name}}?',
    bodyPlainText: `Dear {{guest_name}},

Thank you for choosing {{hotel_name}} for your recent stay.

We hope you had a wonderful experience. Your feedback helps us improve our services.

Please take a moment to share your thoughts about your stay.

We look forward to welcoming you back soon!

Best regards,
{{hotel_name}} Team

{{hotel_email}} | {{hotel_phone}}`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'IBM Plex Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{brand_secondary_color}}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: {{brand_primary_color}}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⭐ We'd Love Your Feedback</h1>
    <p>{{hotel_name}}</p>
  </div>
  <div class="content">
    <p>Dear {{guest_name}},</p>
    <p>Thank you for choosing {{hotel_name}} for your recent stay.</p>
    <p>We hope you had a wonderful experience! Your feedback helps us continually improve our services.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" class="button">Share Your Experience</a>
    </div>
    <p>We look forward to welcoming you back soon!</p>
    <p style="margin-top: 30px; color: #666; font-size: 14px;">
      {{hotel_name}}<br>
      {{hotel_email}} | {{hotel_phone}}
    </p>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: false,
    variables: AVAILABLE_VARIABLES,
  },
  {
    name: 'Pre-Arrival - Check-in Instructions & Directions',
    category: 'reservation',
    invoiceType: 'all',
    description: 'Pre-arrival email with check-in instructions, hotel directions, and travel tips',
    tags: ['pre-arrival', 'directions', 'check-in', 'travel', 'arrival'],
    subject: '🗺️ Your Arrival Guide - {{hotel_name}} - Check-in {{check_in_date}}',
    bodyPlainText: `Dear {{guest_name}},

We're excited to welcome you to {{hotel_name}} soon!

Your reservation is confirmed for check-in on {{check_in_date}}. This email contains important information to help make your arrival smooth and hassle-free.

CHECK-IN INFORMATION
Check-in Date: {{check_in_date}}
Check-in Time: {{check_in_time}} onwards
Check-out Date: {{check_out_date}} at {{check_out_time}}
Confirmation Number: {{confirmation_number}}
Room Type: {{room_type}}
Number of Guests: {{number_of_guests}}

WHAT TO BRING
- Valid government-issued photo ID or passport
- Booking confirmation (this email)
- Payment method for incidentals
{{check_in_requirements}}

EARLY CHECK-IN & LATE CHECK-OUT
{{early_checkin_available}}
{{late_checkout_available}}

HOTEL LOCATION
{{hotel_name}}
{{hotel_address}}
Phone: {{hotel_phone}}

View on Google Maps: {{google_maps_link}}

GETTING HERE

From Airport:
{{directions_from_airport}}

Nearest Landmark:
{{nearest_landmark}}

Transportation Options:
{{transportation_options}}

Airport Shuttle:
{{shuttle_service}}

Parking:
{{parking_info}}

HELPFUL INFORMATION
- WiFi: Available throughout the property - Password: {{wifi_password}}
- Luggage Storage: Available before check-in and after check-out
- Concierge Service: Available 24/7 to assist with bookings and recommendations

AMENITIES & SERVICES
{{amenities_list}}

SPECIAL REQUESTS
If you have any special requests or need assistance with your arrival, please contact us at least 24 hours before check-in:
Phone: {{hotel_phone}}
Email: {{hotel_email}}

We look forward to providing you with an exceptional stay experience!

Safe travels,
The {{hotel_name}} Team

---
{{hotel_name}}
{{hotel_address}}
Tel: {{hotel_phone}} | Email: {{hotel_email}}
{{hotel_website}}`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 650px;
      margin: 0 auto;
      padding: 0;
      background-color: #f5f7f6;
    }
    .email-container {
      background-color: #ffffff;
      margin: 20px auto;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, {{brand_primary_color}}, {{brand_accent_color}});
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '🗺️🧳✈️🏨';
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 80px;
      opacity: 0.1;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
    }
    .header .icon {
      font-size: 56px;
      margin-bottom: 15px;
      display: block;
    }
    .header p {
      margin: 5px 0 0 0;
      font-size: 17px;
      opacity: 0.95;
      font-weight: 500;
      position: relative;
      z-index: 1;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 20px;
      font-weight: 500;
    }
    .intro-message {
      background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
      border-left: 4px solid {{brand_primary_color}};
      border-radius: 8px;
      padding: 20px 25px;
      margin: 25px 0;
    }
    .intro-message p {
      margin: 0;
      color: #2e7d32;
      font-size: 15px;
      font-weight: 500;
    }
    .countdown-box {
      background: linear-gradient(135deg, #fff3e0, #ffe0b2);
      border: 2px solid #ff9800;
      border-radius: 10px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
    }
    .countdown-box h2 {
      margin: 0 0 10px 0;
      color: #e65100;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
    }
    .countdown-box .date {
      font-size: 28px;
      font-weight: 700;
      color: #f57c00;
      margin: 10px 0;
    }
    .section {
      background-color: #f9fafa;
      border-left: 4px solid {{brand_primary_color}};
      padding: 25px;
      margin: 25px 0;
      border-radius: 6px;
    }
    .section h3 {
      margin: 0 0 20px 0;
      color: {{brand_primary_color}};
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e8ebe9;
      align-items: center;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #666666;
      font-size: 14px;
      font-weight: 500;
    }
    .detail-value {
      color: #333333;
      font-weight: 600;
      font-size: 15px;
      text-align: right;
    }
    .checklist {
      background: white;
      border: 2px solid {{brand_accent_color}};
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .checklist h3 {
      margin: 0 0 20px 0;
      color: {{brand_primary_color}};
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .checklist-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 0;
      gap: 12px;
    }
    .checklist-item .checkbox {
      width: 24px;
      height: 24px;
      border: 2px solid {{brand_primary_color}};
      border-radius: 4px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: {{brand_primary_color}};
    }
    .checklist-item .text {
      flex: 1;
      color: #333;
      font-size: 15px;
      line-height: 24px;
    }
    .directions-card {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border: 2px solid #1976d2;
      border-radius: 10px;
      padding: 25px;
      margin: 25px 0;
    }
    .directions-card h3 {
      margin: 0 0 20px 0;
      color: #0d47a1;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .direction-item {
      background: white;
      padding: 18px;
      margin: 12px 0;
      border-radius: 6px;
      border-left: 4px solid #1976d2;
    }
    .direction-item h4 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .direction-item p {
      margin: 0;
      color: #555;
      font-size: 14px;
      line-height: 1.6;
    }
    .map-button {
      display: inline-block;
      background: #1976d2;
      color: white !important;
      padding: 14px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 15px 0;
      font-size: 15px;
      text-align: center;
      transition: all 0.3s ease;
    }
    .map-button:hover {
      background: #0d47a1;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .info-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e8ebe9;
      text-align: center;
      transition: all 0.3s ease;
    }
    .info-card:hover {
      border-color: {{brand_accent_color}};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .info-card .icon {
      font-size: 36px;
      margin-bottom: 12px;
      color: {{brand_accent_color}};
    }
    .info-card .label {
      font-size: 12px;
      color: #666666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .info-card .value {
      font-size: 16px;
      color: #333333;
      font-weight: 700;
    }
    .info-card .subvalue {
      font-size: 13px;
      color: #999;
      margin-top: 5px;
    }
    .important-notice {
      background: #fff9e6;
      border: 2px solid #ffa726;
      border-radius: 8px;
      padding: 20px 25px;
      margin: 25px 0;
    }
    .important-notice h3 {
      margin: 0 0 15px 0;
      color: #f57c00;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .important-notice ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    .important-notice li {
      margin: 10px 0;
      color: #666;
      line-height: 1.6;
    }
    .important-notice li strong {
      color: #f57c00;
    }
    .amenities-section {
      background: #f9fafa;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .amenities-section h3 {
      margin: 0 0 20px 0;
      color: {{brand_primary_color}};
      font-size: 18px;
      font-weight: 700;
      text-align: center;
    }
    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    .amenity-item {
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e8ebe9;
    }
    .amenity-item .icon {
      font-size: 32px;
      margin-bottom: 8px;
      color: {{brand_accent_color}};
    }
    .amenity-item .name {
      font-size: 13px;
      color: #333;
      font-weight: 600;
    }
    .contact-highlight {
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      border: 2px solid {{brand_primary_color}};
      border-radius: 10px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
    }
    .contact-highlight h3 {
      margin: 0 0 20px 0;
      color: {{brand_primary_color}};
      font-size: 20px;
      font-weight: 700;
    }
    .contact-highlight p {
      margin: 10px 0;
      color: #333;
      font-size: 15px;
    }
    .contact-highlight .contact-methods {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .contact-highlight a {
      color: {{brand_primary_color}};
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-highlight a:hover {
      text-decoration: underline;
    }
    .button {
      display: inline-block;
      background: {{brand_primary_color}};
      color: white !important;
      padding: 14px 35px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 5px;
      font-size: 15px;
      transition: all 0.3s ease;
    }
    .button:hover {
      background: {{brand_accent_color}};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .footer {
      background-color: #f9fafa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e8ebe9;
    }
    .footer .hotel-name {
      font-weight: 700;
      color: {{brand_primary_color}};
      font-size: 18px;
      margin-bottom: 15px;
    }
    .footer p {
      margin: 5px 0;
      font-size: 13px;
      color: #666666;
      line-height: 1.8;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, {{brand_primary_color}}, transparent);
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .info-grid, .amenities-grid {
        grid-template-columns: 1fr;
      }
      .header h1 {
        font-size: 26px;
      }
      .content {
        padding: 25px 20px;
      }
      .contact-highlight .contact-methods {
        flex-direction: column;
        align-items: center;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <span class="icon">🗺️</span>
      <h1>Your Arrival Guide</h1>
      <p>Everything You Need for a Smooth Check-In</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear {{guest_name}},</p>
      
      <div class="intro-message">
        <p>We're excited to welcome you to <strong>{{hotel_name}}</strong> soon! This guide contains everything you need to know for a seamless arrival and check-in experience.</p>
      </div>
      
      <div class="countdown-box">
        <h2>📅 Your Check-In Date</h2>
        <div class="date">{{check_in_date}}</div>
        <p style="margin: 10px 0 0 0; color: #f57c00; font-weight: 600;">Check-in starts at {{check_in_time}}</p>
      </div>
      
      <div class="section">
        <h3><span>📋</span> Reservation Details</h3>
        <div class="detail-row">
          <span class="detail-label">Confirmation Number</span>
          <span class="detail-value">{{confirmation_number}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Guest Name</span>
          <span class="detail-value">{{guest_name}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Room Type</span>
          <span class="detail-value">{{room_type}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Number of Guests</span>
          <span class="detail-value">{{number_of_guests}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out Date</span>
          <span class="detail-value">{{check_out_date}} at {{check_out_time}}</span>
        </div>
      </div>
      
      <div class="checklist">
        <h3><span>✅</span> Check-In Checklist - What to Bring</h3>
        <div class="checklist-item">
          <div class="checkbox">✓</div>
          <div class="text"><strong>Valid Photo ID or Passport</strong> - Government-issued identification required for all guests</div>
        </div>
        <div class="checklist-item">
          <div class="checkbox">✓</div>
          <div class="text"><strong>Booking Confirmation</strong> - Print this email or show it on your mobile device</div>
        </div>
        <div class="checklist-item">
          <div class="checkbox">✓</div>
          <div class="text"><strong>Payment Method</strong> - Credit card or cash for incidentals and security deposit</div>
        </div>
        <div class="checklist-item">
          <div class="checkbox">✓</div>
          <div class="text">{{check_in_requirements}}</div>
        </div>
      </div>
      
      <div class="info-grid">
        <div class="info-card">
          <div class="icon">🕐</div>
          <div class="label">Early Check-In</div>
          <div class="value">Available</div>
          <div class="subvalue">{{early_checkin_available}}</div>
        </div>
        <div class="info-card">
          <div class="icon">🕐</div>
          <div class="label">Late Check-Out</div>
          <div class="value">Available</div>
          <div class="subvalue">{{late_checkout_available}}</div>
        </div>
      </div>
      
      <div class="directions-card">
        <h3><span>🗺️</span> How to Find Us</h3>
        
        <div style="text-align: center; background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #333; font-weight: 600; font-size: 16px;">{{hotel_name}}</p>
          <p style="margin: 0; color: #666; font-size: 14px;">{{hotel_address}}</p>
          <a href="{{google_maps_link}}" class="map-button" style="margin-top: 15px;">📍 Open in Google Maps</a>
        </div>
        
        <div class="direction-item">
          <h4><span>✈️</span> From Airport</h4>
          <p>{{directions_from_airport}}</p>
        </div>
        
        <div class="direction-item">
          <h4><span>📍</span> Nearest Landmark</h4>
          <p>{{nearest_landmark}}</p>
        </div>
        
        <div class="direction-item">
          <h4><span>🚗</span> Transportation Options</h4>
          <p>{{transportation_options}}</p>
        </div>
        
        <div class="direction-item">
          <h4><span>🚐</span> Hotel Shuttle Service</h4>
          <p>{{shuttle_service}}</p>
        </div>
        
        <div class="direction-item">
          <h4><span>🅿️</span> Parking Information</h4>
          <p>{{parking_info}}</p>
        </div>
      </div>
      
      <div class="important-notice">
        <h3><span style="font-size: 20px;">💡</span> Helpful Tips</h3>
        <ul>
          <li><strong>WiFi Access:</strong> Free WiFi throughout the property - Password: <strong>{{wifi_password}}</strong></li>
          <li><strong>Luggage Storage:</strong> Available before check-in and after check-out at no charge</li>
          <li><strong>Concierge Service:</strong> Available 24/7 to assist with bookings, tours, and local recommendations</li>
          <li><strong>Currency Exchange:</strong> Available at the front desk</li>
          <li><strong>Emergency Contact:</strong> {{hotel_phone}} (24-hour front desk)</li>
        </ul>
      </div>
      
      <div class="amenities-section">
        <h3>🌟 Hotel Amenities & Services</h3>
        <div class="amenities-grid">
          <div class="amenity-item">
            <div class="icon">🏊</div>
            <div class="name">Swimming Pool</div>
          </div>
          <div class="amenity-item">
            <div class="icon">💪</div>
            <div class="name">Fitness Center</div>
          </div>
          <div class="amenity-item">
            <div class="icon">🍽️</div>
            <div class="name">Restaurant</div>
          </div>
          <div class="amenity-item">
            <div class="icon">💆</div>
            <div class="name">Spa & Wellness</div>
          </div>
          <div class="amenity-item">
            <div class="icon">🛎️</div>
            <div class="name">Room Service</div>
          </div>
          <div class="amenity-item">
            <div class="icon">📶</div>
            <div class="name">Free WiFi</div>
          </div>
        </div>
        <p style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">{{amenities_list}}</p>
      </div>
      
      <div class="divider"></div>
      
      <div class="contact-highlight">
        <h3>📞 Questions About Your Arrival?</h3>
        <p>Our team is here to help! Contact us at least 24 hours before check-in if you need any assistance.</p>
        <div class="contact-methods">
          <a href="tel:{{hotel_phone}}">📞 {{hotel_phone}}</a>
          <a href="mailto:{{hotel_email}}">✉️ {{hotel_email}}</a>
        </div>
      </div>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="{{payment_link}}" class="button">View/Manage My Booking</a>
      </div>
      
      <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
        <p style="margin: 0; color: {{brand_primary_color}}; font-weight: 700; font-size: 20px;">
          🎉 We can't wait to welcome you!
        </p>
        <p style="margin: 15px 0 0 0; color: #666; font-size: 15px;">
          Safe travels, and see you soon at {{hotel_name}}!
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p class="hotel-name">{{hotel_name}}</p>
      <p>{{hotel_address}}</p>
      <p>Tel: {{hotel_phone}} | Email: {{hotel_email}}</p>
      <p style="margin-top: 10px;">{{hotel_website}}</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: false,
    variables: AVAILABLE_VARIABLES,
  },
]

export function replaceVariables(
  template: string,
  invoice: GuestInvoice,
  branding?: HotelBranding | null
): string {
  let result = template

  const firstName = invoice.guestName.split(' ')[0] || invoice.guestName
  const nightsStayed = invoice.checkInDate && invoice.checkOutDate
    ? Math.ceil((invoice.checkOutDate - invoice.checkInDate) / (1000 * 60 * 60 * 24))
    : 0

  const primaryColor = branding?.colorScheme?.primary || '#2c5f2d'
  const secondaryColor = branding?.colorScheme?.secondary || '#97bc62'
  const accentColor = branding?.colorScheme?.accent || '#4a7c59'

  const variables: Record<string, string> = {
    '{{guest_name}}': invoice.guestName,
    '{{guest_first_name}}': firstName,
    '{{guest_email}}': invoice.guestEmail || '',
    '{{guest_phone}}': invoice.guestPhone || '',
    '{{company_name}}': invoice.companyName || '',
    '{{guest_nationality}}': 'International',
    '{{guest_preferences}}': 'As per your booking',
    
    '{{invoice_number}}': invoice.invoiceNumber,
    '{{confirmation_number}}': invoice.invoiceNumber,
    '{{invoice_type}}': formatInvoiceType(invoice.invoiceType),
    '{{invoice_date}}': new Date(invoice.invoiceDate).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }),
    '{{due_date}}': invoice.dueDate 
      ? new Date(invoice.dueDate).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })
      : 'On receipt',
    '{{subtotal}}': formatCurrency(invoice.subtotal),
    '{{service_charge}}': formatCurrency(invoice.serviceChargeAmount),
    '{{tax_amount}}': formatCurrency(invoice.totalTax),
    '{{grand_total}}': formatCurrency(invoice.grandTotal),
    '{{amount_paid}}': formatCurrency(invoice.totalPaid),
    '{{amount_due}}': formatCurrency(invoice.amountDue),
    '{{currency}}': invoice.currency,
    
    '{{room_number}}': invoice.roomNumber || 'TBA',
    '{{room_type}}': 'Deluxe Room',
    '{{number_of_guests}}': '2 Adults',
    '{{check_in_date}}': invoice.checkInDate 
      ? new Date(invoice.checkInDate).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })
      : '',
    '{{check_out_date}}': invoice.checkOutDate 
      ? new Date(invoice.checkOutDate).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })
      : '',
    '{{check_in_time}}': '2:00 PM',
    '{{check_out_time}}': '12:00 PM',
    '{{nights_stayed}}': nightsStayed > 0 ? `${nightsStayed} night${nightsStayed > 1 ? 's' : ''}` : '',
    
    '{{hotel_name}}': branding?.hotelName || 'W3 Hotel',
    '{{hotel_address}}': branding?.hotelAddress || '',
    '{{hotel_phone}}': branding?.hotelPhone || '',
    '{{hotel_email}}': branding?.hotelEmail || '',
    '{{hotel_website}}': branding?.hotelWebsite || '',
    '{{tax_registration}}': branding?.taxRegistrationNumber || '',
    '{{wifi_password}}': 'Welcome2024',
    '{{parking_info}}': 'Complimentary valet parking available',
    
    '{{payment_link}}': `https://pay.hotel.com/invoice/${invoice.invoiceNumber}`,
    '{{bank_name}}': invoice.bankDetails?.bankName || branding?.bankDetails?.bankName || '',
    '{{account_number}}': invoice.bankDetails?.accountNumber || branding?.bankDetails?.accountNumber || '',
    '{{account_name}}': invoice.bankDetails?.accountName || branding?.bankDetails?.accountName || '',
    '{{swift_code}}': invoice.bankDetails?.swiftCode || branding?.bankDetails?.swiftCode || '',
    
    '{{current_date}}': new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }),
    '{{current_time}}': new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', minute: '2-digit', hour12: true 
    }),

    '{{brand_primary_color}}': primaryColor,
    '{{brand_secondary_color}}': secondaryColor,
    '{{brand_accent_color}}': accentColor,
    
    '{{cancellation_policy}}': 'Free cancellation up to 48 hours before check-in',
    '{{special_offers}}': '20% off spa services for hotel guests',
    '{{amenities_list}}': 'Swimming Pool, Fitness Center, Spa, Restaurant, Room Service',
    
    '{{directions_from_airport}}': 'Approximately 15 minutes by taxi from the airport. Follow the coastal road towards the city center. Our hotel is clearly visible on your right.',
    '{{nearest_landmark}}': 'Located next to City Mall and 200 meters from the Beach Promenade.',
    '{{transportation_options}}': 'Airport taxi (LKR 2,500), Rideshare apps (Uber/PickMe), Public bus #138 (LKR 50), or hotel shuttle service.',
    '{{shuttle_service}}': 'Complimentary airport shuttle available for bookings of 3+ nights. Please request at least 24 hours in advance.',
    '{{check_in_requirements}}': 'Please ensure you have all required travel documents and COVID-19 certificates if applicable.',
    '{{early_checkin_available}}': 'Subject to availability - please contact us on arrival day',
    '{{late_checkout_available}}': 'Available for an additional charge of LKR 2,000 per hour',
    '{{google_maps_link}}': `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branding?.hotelAddress || 'W3 Hotel')}`,
  }

  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
  })

  return result
}

function formatInvoiceType(type: string): string {
  const typeMap: Record<string, string> = {
    'guest-folio': 'Guest Folio Invoice',
    'room-only': 'Room Only Invoice',
    'fnb': 'F&B Invoice',
    'extras': 'Extras Invoice',
    'group-master': 'Group Master Account',
    'proforma': 'Proforma Invoice',
    'credit-note': 'Credit Note',
    'debit-note': 'Debit Note',
  }
  return typeMap[type] || type
}

export function generateInvoiceEmail(
  invoice: GuestInvoice,
  template: EmailTemplate,
  branding?: HotelBranding | null
): {
  subject: string
  bodyPlainText: string
  bodyHtml: string
} {
  return {
    subject: replaceVariables(template.subject, invoice, branding),
    bodyPlainText: replaceVariables(template.bodyPlainText, invoice, branding),
    bodyHtml: replaceVariables(template.bodyHtml, invoice, branding),
  }
}
