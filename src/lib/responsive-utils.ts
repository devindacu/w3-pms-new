export const responsiveClasses = {
  dialog: {
    container: 'flex flex-col max-h-[95vh] sm:max-h-[90vh]',
    header: 'sticky top-0 bg-background z-10 pb-3 sm:pb-4 border-b shrink-0',
    body: 'overflow-y-auto overflow-x-hidden flex-1 px-3 sm:px-6 py-3 sm:py-4 min-h-0',
    footer: 'sticky bottom-0 bg-background z-10 pt-3 sm:pt-4 border-t shrink-0',
    title: 'text-base sm:text-lg font-semibold',
    description: 'text-xs sm:text-sm text-muted-foreground',
  },
  
  form: {
    field: 'space-y-1.5 sm:space-y-2',
    label: 'text-xs sm:text-sm font-medium',
    input: 'text-sm sm:text-base h-9 sm:h-10',
    textarea: 'text-sm sm:text-base min-h-[80px] sm:min-h-[100px]',
    select: 'text-sm sm:text-base h-9 sm:h-10',
    checkbox: 'size-4 sm:size-4',
    radio: 'size-4 sm:size-4',
    switch: 'h-5 w-9 sm:h-6 sm:w-11',
  },
  
  button: {
    default: 'h-9 sm:h-10 text-sm px-3 sm:px-4',
    sm: 'h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3',
    lg: 'h-10 sm:h-11 text-base px-4 sm:px-6',
    icon: 'size-9 sm:size-10',
    iconSm: 'size-8 sm:size-9',
  },
  
  grid: {
    cols1: 'grid grid-cols-1 gap-3 sm:gap-4',
    cols2: 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4',
    cols3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4',
    cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4',
    cols6: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3',
  },
  
  spacing: {
    section: 'space-y-3 sm:space-y-4 md:space-y-6',
    sectionSm: 'space-y-2 sm:space-y-3',
    stack: 'flex flex-col gap-2 sm:gap-3',
    stackSm: 'flex flex-col gap-1.5 sm:gap-2',
    inline: 'flex flex-wrap gap-2 sm:gap-3',
  },
  
  card: {
    default: 'p-3 sm:p-4 md:p-6 rounded-lg border',
    compact: 'p-2 sm:p-3 rounded-lg border',
    stat: 'p-3 sm:p-4 rounded-lg border',
  },
  
  text: {
    h1: 'text-2xl sm:text-3xl md:text-4xl font-semibold',
    h2: 'text-xl sm:text-2xl md:text-3xl font-semibold',
    h3: 'text-lg sm:text-xl md:text-2xl font-semibold',
    h4: 'text-base sm:text-lg font-semibold',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm',
    tiny: 'text-[10px] sm:text-xs',
  },
  
  table: {
    container: 'overflow-x-auto -mx-3 sm:mx-0',
    wrapper: 'min-w-full',
    cell: 'px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm',
    header: 'px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium',
  },
  
  layout: {
    mobileStack: 'flex flex-col sm:flex-row gap-2 sm:gap-3',
    mobileFullWidth: 'w-full sm:w-auto',
    mobileHide: 'hidden sm:block',
    mobileShow: 'block sm:hidden',
    tabletHide: 'hidden lg:block',
    tabletShow: 'block lg:hidden',
  },
  
  badge: {
    default: 'text-xs px-2 py-0.5 sm:px-2.5 sm:py-1',
    sm: 'text-[10px] sm:text-xs px-1.5 py-0.5',
  },
  
  tabs: {
    list: 'flex flex-wrap gap-1 sm:gap-2',
    trigger: 'text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2',
    content: 'mt-3 sm:mt-4 space-y-3 sm:space-y-4',
  },
  
  stats: {
    container: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4',
    value: 'text-xl sm:text-2xl md:text-3xl font-bold',
    label: 'text-xs sm:text-sm text-muted-foreground',
  },
}

export function getResponsiveClass(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function responsiveSize<T>(mobile: T, tablet?: T, desktop?: T): { mobile: T; tablet?: T; desktop?: T } {
  return { mobile, tablet, desktop }
}

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

export function getBreakpointValue(breakpoint: Breakpoint): number {
  return breakpoints[breakpoint]
}
