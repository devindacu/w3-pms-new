# Email Templates Guide - W3 Hotel PMS

## Overview
The W3 Hotel PMS includes a comprehensive email template system that allows you to customize invoice emails with dynamic variables and automatic branding color integration.

## Features

### 🎨 Automatic Branding Integration
- Email templates automatically use your hotel's brand colors from Settings > Branding
- Primary, Secondary, and Accent colors are applied to template HTML
- Live preview shows exactly how emails will appear with your branding

### 📧 Pre-Built Templates
The system includes 6 professionally designed email templates:

1. **Standard Guest Invoice** - Complete guest folio with detailed breakdown
2. **Room Only Invoice** - Simplified invoice for accommodation charges only
3. **F&B Invoice** - Restaurant and bar invoice with themed design
4. **Group Master Invoice** - Consolidated invoice for group bookings
5. **Proforma Invoice** - Quotation/estimate invoice (non-binding)
6. **Credit Note** - Refund and credit note template

### 🔧 Template Types
Each template can be configured for specific invoice types:
- All Invoice Types
- Guest Folio Invoice
- Room Only
- F&B Invoice
- Extras Invoice
- Group Master
- Proforma
- Credit Note
- Debit Note

## Available Variables

### Guest Information
- `{{guest_name}}` - Full name of the guest
- `{{guest_first_name}}` - First name only
- `{{guest_email}}` - Guest email address
- `{{guest_phone}}` - Guest phone number
- `{{company_name}}` - Corporate guest company name

### Invoice Details
- `{{invoice_number}}` - Unique invoice number
- `{{invoice_type}}` - Type of invoice
- `{{invoice_date}}` - Date invoice was issued
- `{{due_date}}` - Payment due date
- `{{subtotal}}` - Total before tax and service charge
- `{{service_charge}}` - Service charge amount
- `{{tax_amount}}` - Total tax amount
- `{{grand_total}}` - Final total amount
- `{{amount_paid}}` - Total amount already paid
- `{{amount_due}}` - Remaining amount to pay
- `{{currency}}` - Invoice currency (LKR)

### Reservation Details
- `{{room_number}}` - Guest room number
- `{{check_in_date}}` - Guest check-in date
- `{{check_out_date}}` - Guest check-out date
- `{{nights_stayed}}` - Number of nights

### Hotel Information
- `{{hotel_name}}` - Name of the hotel
- `{{hotel_address}}` - Hotel physical address
- `{{hotel_phone}}` - Hotel contact number
- `{{hotel_email}}` - Hotel email address
- `{{hotel_website}}` - Hotel website URL
- `{{tax_registration}}` - Hotel tax/VAT number

### Payment Information
- `{{payment_link}}` - Online payment URL
- `{{bank_name}}` - Hotel bank name
- `{{account_number}}` - Hotel bank account number
- `{{account_name}}` - Bank account holder name
- `{{swift_code}}` - Bank SWIFT/BIC code

### Dates & Time
- `{{current_date}}` - Today's date
- `{{current_time}}` - Current time

### Branding Colors (for HTML templates)
- `{{brand_primary_color}}` - Hotel primary brand color
- `{{brand_secondary_color}}` - Hotel secondary brand color
- `{{brand_accent_color}}` - Hotel accent brand color

## How to Use Templates

### Loading Default Templates
1. Navigate to **Settings > Email Templates**
2. If no templates exist, click **Load Default Templates**
3. 6 pre-designed templates will be loaded with professional HTML styling

### Creating a New Template
1. Click **New Template** button
2. Fill in:
   - **Template Name**: Descriptive name for the template
   - **Invoice Type**: Select which invoice type this applies to
   - **Subject**: Email subject line (can use variables)
   - **Plain Text Body**: Fallback text version
   - **HTML Body**: Styled HTML version with branding colors
3. Insert variables by:
   - Browsing the variable list on the right
   - Clicking "Insert" next to any variable
   - Variables are categorized by type for easy access
4. Toggle **Active** to enable/disable the template
5. Click **Save**

### Editing an Existing Template
1. Find the template in the list
2. Click the **Edit** (pencil) icon
3. Make your changes
4. Click **Save**

### Previewing Templates
1. Click the **Preview** (eye) icon on any template
2. See live preview with your current branding colors
3. Toggle between HTML and Plain Text views
4. Branding colors panel shows current color scheme

### Duplicating Templates
1. Click the **Duplicate** (copy) icon
2. A copy will be created with "(Copy)" suffix
3. Edit the duplicate to create variations

### Deleting Templates
- Default templates cannot be deleted
- Custom templates can be deleted with the **Delete** (trash) icon

## HTML Styling with Branding Colors

### Using Brand Colors in HTML Templates
Your templates can reference brand colors using special variables:

```html
<!-- Headers with primary color -->
<div style="background: {{brand_primary_color}}; color: white;">
  <h1>{{hotel_name}}</h1>
</div>

<!-- Borders and accents -->
<div style="border-left: 4px solid {{brand_primary_color}};">
  Invoice details here
</div>

<!-- Buttons -->
<a href="{{payment_link}}" 
   style="background: {{brand_primary_color}}; color: white; padding: 12px 30px;">
  Pay Now
</a>

<!-- Total amounts -->
<div style="color: {{brand_primary_color}}; font-weight: bold;">
  Total: {{grand_total}}
</div>
```

### Template Design Tips
1. **Use Inline CSS**: Email clients require inline CSS styles
2. **Keep Width Under 600px**: Optimal for email viewing
3. **Test Across Clients**: Preview in multiple email clients
4. **Include Fallbacks**: Always provide plain text version
5. **Brand Consistency**: Use color variables for consistent branding

## Sample Template Structure

### Minimal HTML Template
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: 'IBM Plex Sans', Arial, sans-serif; 
      max-width: 600px; 
      margin: 0 auto; 
    }
    .header { 
      background: {{brand_primary_color}}; 
      color: white; 
      padding: 20px; 
      text-align: center; 
    }
    .content { 
      padding: 20px; 
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{hotel_name}}</h1>
  </div>
  <div class="content">
    <p>Dear {{guest_name}},</p>
    <p>Your invoice {{invoice_number}} is attached.</p>
    <p><strong>Total: {{grand_total}}</strong></p>
  </div>
</body>
</html>
```

## Integration with Invoice System

### Automatic Email Sending
When you send invoices via email from:
- Front Office > Guest Invoicing
- Batch Invoice Operations

The system:
1. Finds the active template matching the invoice type
2. Replaces all variables with actual data
3. Applies your current branding colors
4. Generates both HTML and plain text versions
5. Sends the email with invoice PDF attached

### Template Selection Priority
1. Active template matching exact invoice type
2. Active template for "all" invoice types
3. Default template if no custom template exists

## Best Practices

### Subject Lines
✅ **Good**: "Your Invoice from {{hotel_name}} - {{invoice_number}}"
✅ **Good**: "Room Charges Invoice - {{invoice_number}}"
❌ **Avoid**: Generic subjects like "Invoice" or "Bill"

### Personalization
- Always use `{{guest_name}}` for personal greeting
- Include relevant invoice details upfront
- Add payment instructions clearly
- Provide contact information for questions

### Design
- Use hotel branding colors consistently
- Keep layout clean and scannable
- Highlight important amounts (Grand Total, Amount Due)
- Include clear call-to-action buttons
- Make payment instructions prominent

### Testing
1. Preview template after creation
2. Check how branding colors appear
3. Send test emails to yourself
4. Verify variables are replaced correctly
5. Test on mobile devices

## Troubleshooting

### Variables Not Replacing
- Ensure variable syntax is exact: `{{variable_name}}`
- Check for extra spaces inside braces
- Verify the data exists in the invoice

### Colors Not Showing
- Verify branding colors are set in Settings > Branding
- Use correct variable names for colors
- Check email client CSS support

### Template Not Being Used
- Ensure template is marked as "Active"
- Check invoice type matches template type
- Verify template is saved properly

## Advanced Customization

### Conditional Content
While template variables are replaced automatically, you can structure your HTML to show/hide sections:

```html
<!-- Include payment info only in certain templates -->
<div class="payment-info">
  <h3>Payment Information</h3>
  <p>Bank: {{bank_name}}</p>
  <p>Account: {{account_number}}</p>
</div>
```

### Multi-language Support
Create separate templates for different languages:
- "Guest Invoice - English"
- "Guest Invoice - Sinhala"
- "Guest Invoice - Tamil"

### Seasonal Variations
Duplicate templates and add seasonal branding:
- "Holiday Season Invoice"
- "Summer Special Invoice"

## Support

For additional help with email templates:
1. Check the variable reference list in the template editor
2. Use the Preview function to test changes
3. Review default templates for examples
4. Contact system administrator for custom requirements

---

**Note**: All email templates automatically use your configured branding from Settings > Branding. Update your brand colors there, and all email templates will reflect the new colors immediately.
