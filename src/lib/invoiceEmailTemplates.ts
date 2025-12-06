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
  
  { key: '{{room_number}}', name: 'Room Number', description: 'Guest room number', example: '301', category: 'invoice' },
  { key: '{{check_in_date}}', name: 'Check-in Date', description: 'Guest check-in date', example: 'January 10, 2024', category: 'dates' },
  { key: '{{check_out_date}}', name: 'Check-out Date', description: 'Guest check-out date', example: 'January 15, 2024', category: 'dates' },
  { key: '{{nights_stayed}}', name: 'Nights Stayed', description: 'Number of nights', example: '5 nights', category: 'dates' },
  
  { key: '{{hotel_name}}', name: 'Hotel Name', description: 'Name of the hotel', example: 'W3 Hotel & Resort', category: 'hotel' },
  { key: '{{hotel_address}}', name: 'Hotel Address', description: 'Hotel physical address', example: '123 Beach Road, Colombo', category: 'hotel' },
  { key: '{{hotel_phone}}', name: 'Hotel Phone', description: 'Hotel contact number', example: '+94 11 234 5678', category: 'hotel' },
  { key: '{{hotel_email}}', name: 'Hotel Email', description: 'Hotel email address', example: 'info@w3hotel.com', category: 'hotel' },
  { key: '{{hotel_website}}', name: 'Hotel Website', description: 'Hotel website URL', example: 'www.w3hotel.com', category: 'hotel' },
  { key: '{{tax_registration}}', name: 'Tax Registration', description: 'Hotel tax/VAT number', example: 'VAT-123456789', category: 'hotel' },
  
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
    name: 'Booking Confirmation',
    category: 'reservation',
    invoiceType: 'all',
    description: 'Confirm guest reservation details',
    tags: ['reservation', 'confirmation', 'welcome'],
    subject: 'Booking Confirmed - {{hotel_name}}',
    bodyPlainText: `Dear {{guest_name}},

Thank you for choosing {{hotel_name}}! Your reservation is confirmed.

Reservation Details:
- Confirmation Number: {{invoice_number}}
- Check-in: {{check_in_date}}
- Check-out: {{check_out_date}}
- Nights: {{nights_stayed}}
- Room: {{room_number}}

We look forward to welcoming you!

Best regards,
{{hotel_name}} Team`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'IBM Plex Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{brand_primary_color}}; color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
    .confirmation-box { background: #f0f9ff; border-left: 4px solid {{brand_primary_color}}; padding: 20px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✓ Booking Confirmed</h1>
    <p>{{hotel_name}}</p>
  </div>
  <div class="content">
    <p>Dear {{guest_name}},</p>
    <p>Thank you for choosing {{hotel_name}}! Your reservation is confirmed.</p>
    <div class="confirmation-box">
      <h3 style="color: {{brand_primary_color}}; margin-top: 0;">Reservation Details</h3>
      <p><strong>Confirmation Number:</strong> {{invoice_number}}<br>
      <strong>Check-in:</strong> {{check_in_date}}<br>
      <strong>Check-out:</strong> {{check_out_date}}<br>
      <strong>Nights:</strong> {{nights_stayed}}<br>
      <strong>Room:</strong> {{room_number}}</p>
    </div>
    <p>We look forward to welcoming you!</p>
    <p style="margin-top: 30px; color: #666; font-size: 14px;">For any questions, contact us at {{hotel_email}} or {{hotel_phone}}.</p>
  </div>
</body>
</html>`,
    isActive: true,
    isDefault: false,
    variables: AVAILABLE_VARIABLES,
  },
  {
    name: 'Welcome Email',
    category: 'welcome',
    invoiceType: 'all',
    description: 'Welcome guests upon check-in',
    tags: ['welcome', 'checkin', 'greeting'],
    subject: 'Welcome to {{hotel_name}}!',
    bodyPlainText: `Dear {{guest_first_name}},

Welcome to {{hotel_name}}!

We're delighted to have you with us. Your comfort is our priority.

Room: {{room_number}}
Wi-Fi: Available in all areas
Checkout: {{check_out_date}}

If you need anything, please don't hesitate to contact our front desk.

Enjoy your stay!

{{hotel_name}} Team`,
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'IBM Plex Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, {{brand_primary_color}}, {{brand_accent_color}}); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
    .welcome-text { font-size: 24px; font-weight: 600; color: {{brand_primary_color}}; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 32px;">🏨 Welcome!</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.95;">{{hotel_name}}</p>
  </div>
  <div class="content">
    <p>Dear {{guest_first_name}},</p>
    <p class="welcome-text">We're delighted to have you with us!</p>
    <p>Your comfort is our priority. Here are your stay details:</p>
    <ul style="background: #f9f9f9; padding: 20px; border-radius: 4px; list-style: none;">
      <li><strong>Room:</strong> {{room_number}}</li>
      <li><strong>Checkout:</strong> {{check_out_date}}</li>
      <li><strong>Wi-Fi:</strong> Available in all areas</li>
    </ul>
    <p>If you need anything, please contact our front desk.</p>
    <p style="margin-top: 30px;"><strong>Enjoy your stay!</strong></p>
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
    
    '{{invoice_number}}': invoice.invoiceNumber,
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
    
    '{{room_number}}': invoice.roomNumber || 'N/A',
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
    '{{nights_stayed}}': nightsStayed > 0 ? `${nightsStayed} night${nightsStayed > 1 ? 's' : ''}` : '',
    
    '{{hotel_name}}': branding?.hotelName || 'W3 Hotel',
    '{{hotel_address}}': branding?.hotelAddress || '',
    '{{hotel_phone}}': branding?.hotelPhone || '',
    '{{hotel_email}}': branding?.hotelEmail || '',
    '{{hotel_website}}': branding?.hotelWebsite || '',
    '{{tax_registration}}': branding?.taxRegistrationNumber || '',
    
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
