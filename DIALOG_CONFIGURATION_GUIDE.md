# Global Dialog Configuration Guide

## Overview

The W3 Hotel PMS now has a unified dialog/popup system that ensures all modals properly display content with appropriate sizing, scrolling, and responsive behavior.

## Key Features

- **Consistent Sizing**: Predefined size options from small to full-width
- **Smart Scrolling**: Fixed headers and footers with scrollable body content
- **Responsive**: Automatically adapts to different screen sizes
- **Accessible**: Built on Radix UI primitives with proper ARIA attributes

## Dialog Sizes

### Available Sizes

```typescript
- sm: 'max-w-md'      // Small dialogs (confirmations, simple forms)
- md: 'max-w-2xl'     // Medium dialogs (standard forms)
- lg: 'max-w-4xl'     // Large dialogs (detailed forms) - DEFAULT
- xl: 'max-w-6xl'     // Extra large (complex data, tables)
- 2xl: 'max-w-7xl'    // Very large (dashboards, reports)
- full: 'max-w-[95vw]' // Nearly full-width (data grids, analytics)
```

### Available Heights

```typescript
- auto: 'max-h-[85vh]' // Auto-fit content - DEFAULT
- sm: 'max-h-[50vh]'   // Short content
- md: 'max-h-[65vh]'   // Medium content
- lg: 'max-h-[80vh]'   // Tall content
- xl: 'max-h-[90vh]'   // Very tall content
- full: 'max-h-[95vh]' // Maximum height
```

## Usage Methods

### Method 1: Using ResponsiveDialog Component (Recommended)

The `ResponsiveDialog` component provides the easiest way to create properly-sized dialogs:

```tsx
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'

function MyComponent() {
  const [open, setOpen] = useState(false)
  
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      title="Create New Invoice"
      description="Fill in the details to create a new invoice"
      size="xl"           // Optional: defaults to 'lg'
      height="auto"       // Optional: defaults to 'auto'
      footer={
        <>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Invoice
          </Button>
        </>
      }
    >
      {/* Your form content here */}
      <div className="space-y-4">
        {/* Form fields */}
      </div>
    </ResponsiveDialog>
  )
}
```

### Method 2: Using Dialog Primitives with Config

For more control, use the dialog configuration utilities:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { getDialogContentClass, getDialogBodyClass } from '@/lib/dialog-config'

function MyDialog() {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={getDialogContentClass('xl', 'lg')}>
        <DialogHeader className="dialog-header-fixed">
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>View and edit invoice information</DialogDescription>
        </DialogHeader>
        
        <div className={getDialogBodyClass('lg') + ' dialog-body-scrollable'}>
          {/* Scrollable content */}
        </div>
        
        <DialogFooter className="dialog-footer-fixed">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Method 3: Using Standard Dialog with Manual Classes

For simple dialogs, the updated default styles work automatically:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

function SimpleDialog() {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Are you sure you want to proceed?
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Best Practices

### 1. Choose the Right Size

- **Small forms** (login, confirmation): `size="sm"`
- **Standard forms** (create/edit single entity): `size="md"` or `size="lg"`
- **Complex forms** (multi-section, tabs): `size="xl"`
- **Data tables/grids**: `size="2xl"` or `size="full"`
- **Reports/analytics**: `size="xl"` or `size="2xl"`

### 2. Fixed Headers and Footers

Always use the provided CSS classes for proper scrolling:

```tsx
<DialogHeader className="dialog-header-fixed">
  {/* This stays at the top */}
</DialogHeader>

<div className="dialog-body-scrollable">
  {/* This scrolls if content is too long */}
</div>

<DialogFooter className="dialog-footer-fixed">
  {/* This stays at the bottom */}
</DialogFooter>
```

### 3. Content Organization

```tsx
<ResponsiveDialog size="xl" height="lg">
  <div className="space-y-6">
    {/* Section 1 */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      {/* Fields */}
    </div>
    
    {/* Section 2 */}
    <Separator />
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Additional Details</h3>
      {/* Fields */}
    </div>
  </div>
</ResponsiveDialog>
```

### 4. Responsive Tables in Dialogs

```tsx
<ResponsiveDialog size="2xl" height="xl">
  <div className="space-y-4">
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          {/* Headers */}
        </TableHeader>
        <TableBody>
          {/* Rows */}
        </TableBody>
      </Table>
    </div>
  </div>
</ResponsiveDialog>
```

### 5. Forms with Many Fields

```tsx
<ResponsiveDialog size="xl" height="xl" title="Guest Profile">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label>First Name</Label>
      <Input />
    </div>
    <div className="space-y-2">
      <Label>Last Name</Label>
      <Input />
    </div>
    {/* More fields in 2-column layout */}
  </div>
</ResponsiveDialog>
```

## Common Patterns

### Pattern 1: Create/Edit Dialog

```tsx
<ResponsiveDialog
  open={open}
  onOpenChange={setOpen}
  title={editMode ? "Edit Invoice" : "Create Invoice"}
  size="xl"
  height="lg"
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleSubmit}>
        {editMode ? "Update" : "Create"}
      </Button>
    </>
  }
>
  <form className="space-y-6">
    {/* Form sections */}
  </form>
</ResponsiveDialog>
```

### Pattern 2: View-Only Dialog

```tsx
<ResponsiveDialog
  open={open}
  onOpenChange={setOpen}
  title="Invoice Details"
  size="2xl"
  height="xl"
  footer={
    <Button onClick={() => setOpen(false)}>Close</Button>
  }
>
  <div className="space-y-6">
    {/* Display sections */}
  </div>
</ResponsiveDialog>
```

### Pattern 3: Multi-Step Dialog

```tsx
<ResponsiveDialog
  open={open}
  onOpenChange={setOpen}
  title={`Step ${step} of 3`}
  size="lg"
  footer={
    <>
      <Button variant="outline" onClick={handleBack} disabled={step === 1}>
        Back
      </Button>
      <Button onClick={handleNext}>
        {step === 3 ? "Finish" : "Next"}
      </Button>
    </>
  }
>
  {step === 1 && <Step1Content />}
  {step === 2 && <Step2Content />}
  {step === 3 && <Step3Content />}
</ResponsiveDialog>
```

## Migration Guide

### Updating Existing Dialogs

1. **Find dialogs with sizing issues**:
   ```bash
   # Look for DialogContent with custom max-w classes
   grep -r "DialogContent.*max-w" src/components/
   ```

2. **Replace with ResponsiveDialog**:
   ```tsx
   // Before
   <Dialog open={open} onOpenChange={setOpen}>
     <DialogContent className="max-w-lg">
       <DialogHeader>
         <DialogTitle>Title</DialogTitle>
       </DialogHeader>
       {/* content */}
       <DialogFooter>
         {/* buttons */}
       </DialogFooter>
     </DialogContent>
   </Dialog>
   
   // After
   <ResponsiveDialog
     open={open}
     onOpenChange={setOpen}
     title="Title"
     size="lg"
     footer={/* buttons */}
   >
     {/* content */}
   </ResponsiveDialog>
   ```

3. **Add scrolling to long content**:
   ```tsx
   // Before
   <DialogContent className="max-w-4xl">
     <div className="space-y-4">
       {/* long content */}
     </div>
   </DialogContent>
   
   // After
   <DialogContent className={getDialogContentClass('xl', 'lg')}>
     <DialogHeader className="dialog-header-fixed">
       {/* header */}
     </DialogHeader>
     <div className="dialog-body-scrollable">
       {/* long content */}
     </div>
     <DialogFooter className="dialog-footer-fixed">
       {/* footer */}
     </DialogFooter>
   </DialogContent>
   ```

## CSS Classes Reference

### Global Classes (in index.css)

```css
[data-radix-dialog-content] {
  /* Makes dialog flex container with max height */
  max-h-[90vh];
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header-fixed {
  /* Sticky header at top */
  position: sticky;
  top: 0;
  background: var(--background);
  z-index: 10;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.dialog-footer-fixed {
  /* Sticky footer at bottom */
  position: sticky;
  bottom: 0;
  background: var(--background);
  z-index: 10;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  margin-top: 1rem;
}

.dialog-body-scrollable {
  /* Scrollable content area */
  overflow-y: auto;
  flex: 1;
  padding: 1rem 1.5rem;
}
```

## Troubleshooting

### Content is Cut Off

**Solution**: Use a larger `size` or `height` value:
```tsx
<ResponsiveDialog size="xl" height="xl">
```

### Scrolling Not Working

**Solution**: Ensure you're using the scrolling classes:
```tsx
<div className="dialog-body-scrollable">
  {/* content */}
</div>
```

### Footer Hidden on Long Content

**Solution**: Use `dialog-footer-fixed` class:
```tsx
<DialogFooter className="dialog-footer-fixed">
  {/* buttons */}
</DialogFooter>
```

### Mobile Layout Issues

**Solution**: The dialog system is responsive by default. For very wide content, use a grid:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* content adapts to mobile */}
</div>
```

## Examples by Use Case

### Invoice Creation Dialog
```tsx
<ResponsiveDialog size="2xl" height="xl" title="Create Invoice">
  {/* Large form with many fields */}
</ResponsiveDialog>
```

### Guest Profile Dialog
```tsx
<ResponsiveDialog size="xl" height="lg" title="Guest Profile">
  {/* Medium-large form with sections */}
</ResponsiveDialog>
```

### Confirmation Dialog
```tsx
<ResponsiveDialog size="sm" title="Confirm Delete">
  {/* Simple message */}
</ResponsiveDialog>
```

### Report Preview
```tsx
<ResponsiveDialog size="2xl" height="full" title="Financial Report">
  {/* Large report with charts */}
</ResponsiveDialog>
```

### Data Table Filter
```tsx
<ResponsiveDialog size="lg" height="md" title="Filter Options">
  {/* Filter form */}
</ResponsiveDialog>
```

## Summary

- Use `ResponsiveDialog` for new dialogs
- Choose appropriate `size` and `height` props
- Use `dialog-header-fixed`, `dialog-body-scrollable`, and `dialog-footer-fixed` classes
- Follow responsive design patterns with grid layouts
- Test on mobile and desktop viewports

For questions or issues, refer to `/src/lib/dialog-config.ts` and `/src/components/ResponsiveDialog.tsx`.
