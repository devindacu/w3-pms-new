# Print, Preview, and Download Feature Documentation

## Overview

This document describes the comprehensive print, preview, PDF, and Word download functionality available across all modules in the W3 Hotel PMS system.

## Features

- ✅ **A4 Size Formatting** - Consistent page layout across all documents
- ✅ **Print Preview** - Browser-native print dialog with proper formatting
- ✅ **PDF Download** - High-quality PDF generation
- ✅ **Word Download** - DOCX format for editing
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Universal Integration** - Easy to add to any module

## Quick Start

### Method 1: Using the PrintButton Component (Recommended)

```tsx
import { PrintButton } from '@/components/PrintButton';
import { A4PrintWrapper } from '@/components/A4PrintWrapper';

function MyReport() {
  return (
    <div>
      {/* Control buttons */}
      <PrintButton
        elementId="my-report"
        options={{
          title: 'My Report',
          filename: 'report-2024.pdf',
          includeHeader: true,
          headerText: 'Company Name',
          includeFooter: true,
          footerText: 'Confidential'
        }}
      />

      {/* Printable content */}
      <A4PrintWrapper id="my-report" title="My Report">
        <p>Your content here...</p>
      </A4PrintWrapper>
    </div>
  );
}
```

### Method 2: Using the usePrint Hook

```tsx
import { usePrint } from '@/hooks/use-print';
import { Button } from '@/components/ui/button';

function MyComponent() {
  const { print, downloadPDF, downloadWord, isProcessing } = usePrint();

  return (
    <div>
      <Button onClick={() => print('my-content')}>Print</Button>
      <Button onClick={() => downloadPDF('my-content')} disabled={isProcessing}>
        Download PDF
      </Button>
      <Button onClick={() => downloadWord('my-content')} disabled={isProcessing}>
        Download Word
      </Button>

      <div id="my-content">
        Your content...
      </div>
    </div>
  );
}
```

### Method 3: Direct Utility Functions

```tsx
import { printPreview, downloadAsPDF, downloadAsWord } from '@/lib/printUtils';

// Print preview
printPreview('element-id', { title: 'Document' });

// Download PDF
await downloadAsPDF('element-id', { 
  filename: 'report.pdf',
  orientation: 'portrait'
});

// Download Word
await downloadAsWord('element-id', { 
  filename: 'report.docx'
});
```

## Components

### A4PrintWrapper

Wraps content with A4-sized formatting and proper print styles.

**Props:**
- `id` (string, required) - Unique identifier for the print element
- `title` (string, optional) - Document title shown in header
- `headerContent` (ReactNode, optional) - Custom header content
- `footerContent` (ReactNode, optional) - Custom footer content
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
<A4PrintWrapper
  id="invoice-123"
  title="Invoice #123"
  headerContent={<div>Company Logo</div>}
  footerContent={<div>Thank you for your business</div>}
>
  <InvoiceContent />
</A4PrintWrapper>
```

### PrintButton

Dropdown menu button with print, PDF, and Word options.

**Props:**
- `elementId` (string, required) - ID of element to print
- `options` (PrintOptions, optional) - Print configuration
- `variant` (string, optional) - Button variant (default | outline | ghost)
- `size` (string, optional) - Button size (default | sm | lg | icon)
- `showLabel` (boolean, optional) - Show "Print" label (default: true)
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
<PrintButton
  elementId="report-content"
  options={{ title: 'Monthly Report' }}
  variant="outline"
  size="sm"
/>
```

## Hooks

### usePrint

React hook for print functionality.

**Returns:**
- `isProcessing` (boolean) - True when generating PDF/Word
- `print(elementId, options?)` - Open print preview
- `downloadPDF(elementId, options?)` - Download as PDF
- `downloadWord(elementId, options?)` - Download as Word document
- `showDialog(elementId, options?)` - Show print options dialog

**Example:**
```tsx
const { print, downloadPDF, isProcessing } = usePrint();

// In your component
<Button onClick={() => print('report')} disabled={isProcessing}>
  Print Report
</Button>
```

## PrintOptions Interface

```typescript
interface PrintOptions {
  title?: string;                    // Document title
  orientation?: 'portrait' | 'landscape';  // Page orientation
  filename?: string;                 // Download filename
  includeHeader?: boolean;           // Show header
  includeFooter?: boolean;           // Show footer
  headerText?: string;               // Header text
  footerText?: string;               // Footer text
}
```

## Utility Functions

### printPreview

Opens browser print dialog with proper A4 formatting.

```typescript
printPreview(elementId: string, options?: PrintOptions): void
```

### downloadAsPDF

Generates and downloads a PDF file.

```typescript
downloadAsPDF(elementId: string, options?: PrintOptions): Promise<void>
```

### downloadAsWord

Generates and downloads a Word document.

```typescript
downloadAsWord(elementId: string, options?: PrintOptions): Promise<void>
```

### showPrintDialog

Shows a dialog with print, PDF, and Word options.

```typescript
showPrintDialog(elementId: string, options?: PrintOptions): void
```

### applyA4PrintStyles

Applies A4 sizing and print styles to an element.

```typescript
applyA4PrintStyles(element: HTMLElement): void
```

## A4 Size Constants

```typescript
const A4_SIZE = {
  width: 210,       // mm
  height: 297,      // mm
  widthPx: 794,     // pixels
  heightPx: 1123,   // pixels
  margin: 20,       // mm
  marginPx: 76      // pixels
};
```

## CSS Classes

### Print-Specific Classes

- `.no-print` - Hide element when printing
- `.page-break` - Force page break after element
- `.no-page-break` - Prevent page break inside element
- `.print-content` - Main content wrapper for printing

### Example:
```tsx
<div className="no-print">
  <Button>This won't appear in print</Button>
</div>

<div className="page-break">
  <p>This will be on its own page</p>
</div>
```

## Best Practices

### 1. Structure Your Content

```tsx
<div>
  {/* Controls - hidden in print */}
  <div className="no-print">
    <PrintButton elementId="content" />
  </div>

  {/* Printable content */}
  <A4PrintWrapper id="content" title="Document">
    <YourContent />
  </A4PrintWrapper>
</div>
```

### 2. Use Tables for Data

Tables automatically format well in print:

```tsx
<table className="w-full border-collapse">
  <thead>
    <tr className="bg-gray-100">
      <th className="border p-2">Column 1</th>
      <th className="border p-2">Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border p-2">Data 1</td>
      <td className="border p-2">Data 2</td>
    </tr>
  </tbody>
</table>
```

### 3. Add Page Breaks

Control pagination with page break classes:

```tsx
<section className="no-page-break">
  <h2>Section Title</h2>
  <p>Content that should stay together...</p>
</section>

<div className="page-break" />

<section>
  <h2>Next Section</h2>
  <p>This will start on a new page...</p>
</section>
```

### 4. Handle Large Content

For content longer than one page, the system automatically paginates:

```tsx
<A4PrintWrapper id="long-report" title="Annual Report">
  {sections.map(section => (
    <div key={section.id} className="mb-8">
      <h2>{section.title}</h2>
      <p>{section.content}</p>
    </div>
  ))}
</A4PrintWrapper>
```

## Module Integration Checklist

To add print functionality to any module:

- [ ] Import required components
- [ ] Wrap printable content in `<A4PrintWrapper>`
- [ ] Add unique `id` to wrapper
- [ ] Add `<PrintButton>` or use `usePrint` hook
- [ ] Add `.no-print` to control elements
- [ ] Test print preview
- [ ] Test PDF download
- [ ] Test Word download
- [ ] Verify page breaks
- [ ] Check header/footer rendering

## Modules with Print Support

The following modules have been updated with print functionality:

- ✅ Invoices & Folios
- ✅ Financial Reports
- ✅ Daily Reports
- ✅ Guest Management
- ✅ Inventory Reports
- ✅ Procurement Documents
- ✅ Channel Manager Reports
- ✅ Housekeeping Reports
- ✅ All Custom Reports

## Dependencies

The print functionality requires the following npm packages:

```json
{
  "dependencies": {
    "jspdf": "^2.5.2",
    "html2canvas": "^1.4.1",
    "docx": "^8.5.0",
    "file-saver": "^2.0.5"
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7"
  }
}
```

Install with:
```bash
npm install jspdf html2canvas docx file-saver
npm install --save-dev @types/file-saver
```

## Troubleshooting

### PDF Generation Issues

If PDF generation fails:
1. Check that the element ID exists
2. Ensure content is visible (not hidden)
3. Verify images use CORS-compliant URLs
4. Check browser console for errors

### Word Document Issues

If Word generation fails:
1. Ensure content is properly structured
2. Complex CSS may not convert well
3. Use tables for tabular data
4. Keep styling simple for best results

### Print Preview Issues

If print preview doesn't show content:
1. Verify element ID is correct
2. Check that content is rendered
3. Ensure print styles are loaded
4. Try with simpler content first

## Examples

See `ExamplePrintableReport.tsx` for a complete working example.

## Support

For issues or questions about print functionality:
1. Check this documentation
2. Review the example component
3. Test with the provided utilities
4. Contact the development team

---

**Last Updated**: 2024-01-27
**Version**: 1.0.0
