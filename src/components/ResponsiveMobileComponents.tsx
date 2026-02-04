import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  List,
  GridFour,
  SlidersHorizontal,
  MagnifyingGlass,
  X,
  FunnelSimple,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface MobileOptimizedViewProps {
  data: any[];
  renderCard: (item: any) => React.ReactNode;
  renderListItem: (item: any) => React.ReactNode;
  filters?: React.ReactNode;
  searchPlaceholder?: string;
  title?: string;
  onItemClick?: (item: any) => void;
}

export function MobileOptimizedView({
  data,
  renderCard,
  renderListItem,
  filters,
  searchPlaceholder = 'Search...',
  title,
  onItemClick,
}: MobileOptimizedViewProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex items-center justify-between gap-2">
        {title && <h2 className="text-lg font-bold truncate">{title}</h2>}
        
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-1">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
              className="h-8 w-8 p-0"
            >
              <GridFour size={18} weight={view === 'grid' ? 'fill' : 'regular'} />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="h-8 w-8 p-0"
            >
              <List size={18} weight={view === 'list' ? 'fill' : 'regular'} />
            </Button>
          </div>

          {/* Filter Button */}
          {filters && (
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <FunnelSimple size={18} weight="fill" />
                  <span className="ml-2 hidden sm:inline">Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
                  {filters}
                </ScrollArea>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
                  <Button className="w-full" onClick={() => setFilterOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlass
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-10 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        view === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-2'
      )}>
        {data.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={cn(
              'cursor-pointer transition-all',
              view === 'list' && 'hover:bg-accent/50'
            )}
          >
            {view === 'grid' ? renderCard(item) : renderListItem(item)}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MagnifyingGlass size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try adjusting your search or filters to find what you're looking for
          </p>
        </div>
      )}
    </div>
  );
}

// Responsive Table Component for Mobile
interface ResponsiveTableProps {
  headers: { key: string; label: string; className?: string }[];
  data: any[];
  renderMobileCard: (item: any) => React.ReactNode;
  onRowClick?: (item: any) => void;
}

export function ResponsiveTable({
  headers,
  data,
  renderMobileCard,
  onRowClick,
}: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={cn('px-4 py-3 text-left text-sm font-medium', header.className)}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((item, index) => (
              <tr
                key={item.id || index}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'hover:bg-muted/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {headers.map((header) => (
                  <td key={header.key} className={cn('px-4 py-3 text-sm', header.className)}>
                    {item[header.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={item.id}
            onClick={() => onRowClick?.(item)}
            className={cn(
              'rounded-lg border bg-card transition-all',
              onRowClick && 'cursor-pointer active:scale-[0.98]'
            )}
          >
            {renderMobileCard(item)}
          </div>
        ))}
      </div>
    </>
  );
}

// Mobile Action Sheet Component
interface MobileActionSheetProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  actions: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }[];
}

export function MobileActionSheet({
  trigger,
  title,
  description,
  actions,
}: MobileActionSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <Separator />
          <div className="space-y-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                className="w-full justify-start h-12"
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
              >
                {action.icon && <span className="mr-3">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
          <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Responsive Stat Cards
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export function ResponsiveStatCard({
  title,
  value,
  change,
  icon,
  trend,
  description,
}: StatCardProps) {
  return (
    <Card className="transition-all hover:shadow-lg active:scale-[0.98] md:active:scale-100">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-bold">{value}</p>
              {change !== undefined && (
                <span
                  className={cn(
                    'text-xs sm:text-sm font-medium',
                    trend === 'up' && 'text-success',
                    trend === 'down' && 'text-destructive',
                    trend === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile Navigation Tabs
interface MobileTabsProps {
  tabs: { value: string; label: string; icon?: React.ReactNode }[];
  defaultValue: string;
  children: React.ReactNode;
}

export function MobileTabs({ tabs, defaultValue, children }: MobileTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      {/* Mobile - Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto -mx-4 px-4">
        <TabsList className="inline-flex w-max min-w-full">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-shrink-0 gap-2 whitespace-nowrap"
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Desktop - Standard */}
      <div className="hidden md:block">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {children}
    </Tabs>
  );
}
