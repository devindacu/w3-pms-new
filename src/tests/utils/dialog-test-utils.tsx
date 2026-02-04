/**
 * Dialog Testing Utilities
 * 
 * Provides comprehensive testing utilities for DialogAdapter and enhanced dialogs
 * including responsive behavior testing, accessibility validation, and interaction testing.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

/**
 * Test dialog at different viewport sizes
 */
export const viewportSizes = {
  mobile: { width: 375, height: 667, label: 'Mobile (iPhone SE)' },
  tablet: { width: 768, height: 1024, label: 'Tablet (iPad)' },
  desktop: { width: 1920, height: 1080, label: 'Desktop (Full HD)' },
}

/**
 * Set viewport size for responsive testing
 */
export const setViewport = (size: keyof typeof viewportSizes) => {
  const { width, height } = viewportSizes[size]
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

/**
 * Test dialog responsive behavior across all viewport sizes
 */
export const testDialogResponsive = async (
  DialogComponent: React.ComponentType<any>,
  props: any
) => {
  const results: Record<string, boolean> = {}

  for (const [size, config] of Object.entries(viewportSizes)) {
    setViewport(size as keyof typeof viewportSizes)
    const { unmount } = render(<DialogComponent {...props} />)
    
    // Check if dialog is visible
    const dialog = screen.queryByRole('dialog')
    results[`${size}_rendered`] = dialog !== null
    
    // Check responsive classes
    if (dialog) {
      const styles = window.getComputedStyle(dialog)
      results[`${size}_maxHeight`] = 
        size === 'mobile' ? styles.maxHeight.includes('95vh') : true
    }
    
    unmount()
  }

  return results
}

/**
 * Test dialog accessibility
 */
export const testDialogAccessibility = async (
  DialogComponent: React.ComponentType<any>,
  props: any
) => {
  const { container } = render(<DialogComponent {...props} />)
  
  const checks = {
    hasRole: screen.queryByRole('dialog') !== null,
    hasAriaLabel: container.querySelector('[aria-label]') !== null,
    hasAriaDescribedBy: container.querySelector('[aria-describedby]') !== null,
    keyboardNavigable: true, // Will be tested separately
  }

  return checks
}

/**
 * Test dialog keyboard navigation
 */
export const testDialogKeyboard = async (
  DialogComponent: React.ComponentType<any>,
  props: { open: boolean; onOpenChange: (open: boolean) => void }
) => {
  const onOpenChange = vi.fn()
  render(<DialogComponent {...props} open={true} onOpenChange={onOpenChange} />)
  
  // Test Escape key
  fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  
  return { escapeWorks: onOpenChange.mock.calls.length > 0 }
}

/**
 * Test dialog animations
 */
export const testDialogAnimations = async (
  DialogComponent: React.ComponentType<any>,
  props: any
) => {
  const { container, rerender } = render(
    <DialogComponent {...props} open={false} />
  )
  
  // Check closed state
  const dialogClosed = screen.queryByRole('dialog')
  const closedState = dialogClosed === null
  
  // Open dialog
  rerender(<DialogComponent {...props} open={true} />)
  
  // Check open state
  await waitFor(() => {
    const dialogOpen = screen.queryByRole('dialog')
    return dialogOpen !== null
  })
  
  return {
    closedCorrectly: closedState,
    openedCorrectly: screen.queryByRole('dialog') !== null,
  }
}

/**
 * Test dialog form submission
 */
export const testDialogFormSubmit = async (
  DialogComponent: React.ComponentType<any>,
  props: any,
  submitButtonText: string = 'Save'
) => {
  const onSubmit = vi.fn()
  render(<DialogComponent {...props} onSubmit={onSubmit} />)
  
  const submitButton = screen.getByText(submitButtonText)
  fireEvent.click(submitButton)
  
  await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  
  return { submitted: onSubmit.mock.calls.length > 0 }
}

/**
 * Test dialog data persistence
 */
export const testDialogDataPersistence = async (
  DialogComponent: React.ComponentType<any>,
  props: any,
  testData: Record<string, any>
) => {
  const { container } = render(<DialogComponent {...props} data={testData} />)
  
  // Check if data is rendered
  const results: Record<string, boolean> = {}
  
  for (const [key, value] of Object.entries(testData)) {
    const element = container.querySelector(`[name="${key}"]`)
    if (element) {
      results[key] = (element as HTMLInputElement).value === String(value)
    }
  }
  
  return results
}

/**
 * Comprehensive dialog test suite
 */
export const runDialogTestSuite = async (
  DialogComponent: React.ComponentType<any>,
  props: any
) => {
  const results = {
    responsive: await testDialogResponsive(DialogComponent, props),
    accessibility: await testDialogAccessibility(DialogComponent, props),
    keyboard: await testDialogKeyboard(DialogComponent, props),
    animations: await testDialogAnimations(DialogComponent, props),
  }
  
  return results
}

/**
 * Mock dialog props for testing
 */
export const createMockDialogProps = (overrides = {}) => ({
  open: true,
  onOpenChange: vi.fn(),
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  ...overrides,
})

/**
 * Test dialog loading state
 */
export const testDialogLoadingState = async (
  DialogComponent: React.ComponentType<any>,
  props: any
) => {
  const { rerender } = render(
    <DialogComponent {...props} loading={false} />
  )
  
  // Check not loading
  const loadingIndicatorBefore = screen.queryByRole('status')
  const notLoadingInitially = loadingIndicatorBefore === null
  
  // Set loading
  rerender(<DialogComponent {...props} loading={true} />)
  
  // Check loading
  await waitFor(() => {
    const loadingIndicatorAfter = screen.queryByRole('status') || 
                                   screen.queryByText(/loading/i)
    return loadingIndicatorAfter !== null
  })
  
  return {
    notLoadingInitially,
    showsLoadingState: screen.queryByRole('status') !== null ||
                       screen.queryByText(/loading/i) !== null,
  }
}

/**
 * Test dialog size variants
 */
export const testDialogSizeVariants = async (
  DialogComponent: React.ComponentType<any>,
  props: any,
  expectedSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
) => {
  const { container } = render(<DialogComponent {...props} size={expectedSize} />)
  
  const dialog = container.querySelector('[role="dialog"]')
  if (!dialog) return { hasCorrectSize: false }
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }
  
  const expectedClass = sizeClasses[expectedSize]
  const hasCorrectSize = dialog.className.includes(expectedClass)
  
  return { hasCorrectSize, actualClasses: dialog.className }
}

export default {
  viewportSizes,
  setViewport,
  testDialogResponsive,
  testDialogAccessibility,
  testDialogKeyboard,
  testDialogAnimations,
  testDialogFormSubmit,
  testDialogDataPersistence,
  runDialogTestSuite,
  createMockDialogProps,
  testDialogLoadingState,
  testDialogSizeVariants,
}
