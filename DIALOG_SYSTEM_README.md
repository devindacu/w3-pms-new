# Global Dialog System Implementation

## Overview

The W3 Hotel PMS now features a comprehensive global dialog/popup system that ensures consistent sizing, proper content display, and optimal user experience across all modules.

## What Was Implemented

### 1. Core Configuration System

**File**: `/src/lib/dialog-config.ts`

- Centralized dialog size and height presets
- Utility functions for consistent styling
- Type-safe configuration options

**Available Sizes**:
- `sm`: 448px (28rem) - Small dialogs
- `md`: 672px (42rem) - Medium dialogs
- `lg`: 896px (56rem) - Large dialogs (default)
- `xl`: 1152px (72rem) - Extra large
- `2xl`: 1280px (80rem) - 2X Large
- `full`: 95vw - Full width

**Available Heights**:
- `auto`: 85vh - Auto-fit (default)
- `sm`: 50vh - Small height
- `md`: 65vh - Medium height
- `lg`: 80vh - Large height
- `xl`: 90vh - Extra large height
- `full`: 95vh - Maximum height

### 2. Global Settings System

**File**: `/src/lib/dialog-settings.ts`

- Module-specific default configurations
- Customizable global defaults
- Preset configurations for common use cases

**Module Defaults**:
- `invoice`: 2xl width, xl height
- `guest-profile`: xl width, lg height
- `reservation`: xl width, lg height
- `payment`: md width, auto height
- `confirmation`: sm width, auto height
- `report`: 2xl width, full height
- `analytics`: 2xl width, xl height
- `filters`: lg width, md height

### 3. Responsive Dialog Component

**File**: `/src/components/ResponsiveDialog.tsx`

A reusable component that wraps the base Dialog with:
- Automatic size configuration
- Fixed header and footer support
- Scrollable body content
- Type-safe props

**Usage**:
```tsx
<ResponsiveDialog
  open={open}
  onOpenChange={setOpen}
  title="Dialog Title"
  description="Optional description"
  size="xl"
  height="lg"
  footer={<Button>Save</Button>}
>
  {/* Content */}
</ResponsiveDialog>
```

### 4. Enhanced Base Dialog

**File**: `/src/components/ui/dialog.tsx`

Updated the shadcn Dialog component with:
- Default max-width increased to `4xl` (from `lg`)
- Default max-height set to `90vh`
- Flex layout for proper content flow
- Overflow handling

### 5. Global CSS Classes

**File**: `/src/index.css`

Added utility classes for consistent dialog behavior:

```css
.dialog-header-fixed
.dialog-footer-fixed
.dialog-body-scrollable
```

These ensure:
- Headers stay visible when scrolling
- Footers remain accessible
- Content scrolls independently

### 6. User Settings Interface

**File**: `/src/components/DialogSettings.tsx`

A settings panel in the Settings module allowing users to:
- Configure default dialog size
- Configure default dialog height
- Enable/disable fixed headers
- Enable/disable fixed footers
- View module-specific defaults
- Reset to defaults

**Location**: Settings → Dialogs tab

### 7. Documentation

**Files**:
- `/DIALOG_CONFIGURATION_GUIDE.md` - Comprehensive developer guide
- `/DIALOG_SYSTEM_README.md` - This file

### 8. Example Components

**File**: `/src/components/DialogExamples.tsx`

Interactive examples demonstrating:
- All size presets
- All height presets
- Custom configurations
- Real-world use cases

## Key Features

### 1. Consistent Sizing
All dialogs use predefined sizes ensuring visual consistency across the application.

### 2. Proper Scrolling
- Fixed headers prevent title/description from scrolling away
- Fixed footers keep action buttons always accessible
- Body content scrolls independently

### 3. Responsive Design
- Adapts to mobile devices automatically
- Uses percentage-based widths on small screens
- Grid layouts collapse to single column

### 4. Type Safety
Full TypeScript support with:
- Type-safe size options
- Type-safe height options
- Proper prop interfaces

### 5. Customizable
Users can configure:
- Global defaults
- Per-module defaults
- Individual dialog overrides

## How to Use

### Method 1: ResponsiveDialog (Recommended)

```tsx
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

function MyComponent() {
  const [open, setOpen] = useState(false)
  
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      title="Create Invoice"
      size="xl"
      height="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Your form content */}
      </div>
    </ResponsiveDialog>
  )
}
```

### Method 2: Dialog with Configuration

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { getDialogContentClass, getDialogBodyClass } from '@/lib/dialog-config'

function MyDialog() {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={getDialogContentClass('xl', 'lg')}>
        <DialogHeader className="dialog-header-fixed">
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
        
        <div className={getDialogBodyClass('lg') + ' dialog-body-scrollable'}>
          {/* Scrollable content */}
        </div>
        
        <DialogFooter className="dialog-footer-fixed">
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Method 3: Standard Dialog (Simple Cases)

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

function SimpleDialog() {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirm</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Are you sure?
        </div>
        <DialogFooter>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Size Selection Guide

Choose the appropriate size based on content:

| Size | Use Case | Examples |
|------|----------|----------|
| `sm` | Simple confirmations, alerts | Delete confirmation, logout |
| `md` | Basic forms (5-10 fields) | Login, quick add forms |
| `lg` | Standard forms | Guest creation, room booking |
| `xl` | Complex forms, multiple sections | Guest profile, invoice creation |
| `2xl` | Data tables, reports | Financial reports, analytics |
| `full` | Dashboards, complex views | Full analytics dashboard |

## Height Selection Guide

| Height | Use Case | Examples |
|--------|----------|----------|
| `auto` | Content-dependent | Most dialogs |
| `sm` | Minimal content | Simple confirmations |
| `md` | Short forms | Filter dialogs |
| `lg` | Standard forms | Most data entry |
| `xl` | Long forms, lists | Guest profiles with history |
| `full` | Maximum content | Full reports, analytics |

## Best Practices

### 1. Use Semantic Sizing
Choose sizes that match your content needs, not arbitrary values.

### 2. Fixed Headers/Footers
Always use the CSS classes for dialogs with scrollable content:
```tsx
<DialogHeader className="dialog-header-fixed">
<div className="dialog-body-scrollable">
<DialogFooter className="dialog-footer-fixed">
```

### 3. Responsive Layouts
Use grid layouts that adapt:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

### 4. Consistent Spacing
Use Tailwind's spacing scale:
```tsx
<div className="space-y-4"> {/* or space-y-6 */}
```

### 5. Module-Specific Defaults
Reference the module defaults in `/src/lib/dialog-settings.ts` for consistency.

## Migration Guide

### Updating Existing Dialogs

1. **Find dialogs**: Search for `DialogContent` in your codebase
2. **Replace with ResponsiveDialog** or add proper classes
3. **Add scrolling classes** for long content
4. **Test on different screen sizes**

Example migration:

**Before**:
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

**After**:
```tsx
<ResponsiveDialog
  open={open}
  onOpenChange={setOpen}
  title="Title"
  size="lg"
>
  {/* content */}
</ResponsiveDialog>
```

## Configuration

### User Settings

Users can configure dialog behavior in:
**Settings → Dialogs**

Options:
- Default Width
- Default Height
- Fixed Headers (on/off)
- Fixed Footers (on/off)

### Developer Settings

Module defaults can be customized in:
`/src/lib/dialog-settings.ts`

```typescript
export const DIALOG_MODULE_DEFAULTS: Record<string, Partial<GlobalDialogSettings>> = {
  'my-module': {
    defaultSize: 'xl',
    defaultHeight: 'lg',
  },
}
```

## Troubleshooting

### Content Cut Off
**Solution**: Increase `size` or `height`:
```tsx
<ResponsiveDialog size="xl" height="lg">
```

### Scrolling Not Working
**Solution**: Use the scrolling class:
```tsx
<div className="dialog-body-scrollable">
```

### Footer Hidden
**Solution**: Use the fixed footer class:
```tsx
<DialogFooter className="dialog-footer-fixed">
```

### Mobile Issues
**Solution**: Use responsive grids:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2">
```

## Testing

Test dialogs with:
1. Different content amounts (short, long)
2. Different screen sizes (mobile, tablet, desktop)
3. Different form layouts (single column, grid)
4. Nested scrolling scenarios

## Future Enhancements

Potential improvements:
- [ ] Save user's size preferences per module
- [ ] Add animation customization
- [ ] Add keyboard shortcuts
- [ ] Add drag-to-resize option
- [ ] Add minimize/maximize controls

## Support

For issues or questions:
1. Check `/DIALOG_CONFIGURATION_GUIDE.md`
2. Review `/src/components/DialogExamples.tsx`
3. Examine `/src/lib/dialog-config.ts`

## Summary

The global dialog system provides:
- ✅ Consistent sizing across all modules
- ✅ Proper content display and scrolling
- ✅ User-configurable defaults
- ✅ Developer-friendly API
- ✅ Full TypeScript support
- ✅ Responsive design
- ✅ Comprehensive documentation

All dialogs and popups in the W3 Hotel PMS now follow these standards for optimal user experience.
