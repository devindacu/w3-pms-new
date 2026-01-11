export type ReportTemplateLayout = '1-column' | '2-column' | '3-column'

export type ReportMetricCategory = 
  | 'revenue'
  | 'occupancy'
  | 'guest'
  | 'fnb'
  | 'housekeeping'
  | 'inventory'
  | 'finance'
  | 'hr'
  | 'operational'

export interface ReportTemplateMetric {
  id: string
  name: string
  description: string
  category: ReportMetricCategory
  format: 'currency' | 'number' | 'percentage' | 'decimal' | 'text'
  aggregation: 'sum' | 'average' | 'count' | 'min' | 'max' | 'current'
  dataSource: string
  icon?: string
}

export interface ReportTemplateSection {
  id: string
  title: string
  metrics: string[]
  position: number
  columnSpan: 1 | 2 | 3
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'table' | 'none'
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'financial' | 'operational' | 'guest' | 'inventory' | 'hr'
  layout: ReportTemplateLayout
  sections: ReportTemplateSection[]
  availableMetrics: string[]
  isCustomizable: boolean
  defaultDateRange: 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-quarter' | 'last-quarter' | 'this-year' | 'last-year' | 'custom'
  createdAt?: number
  updatedAt?: number
  createdBy?: string
}

export interface ReportPreviewData {
  templateId: string
  generatedAt: number
  dateRange: {
    from: number
    to: number
  }
  metricValues: Record<string, number | string>
  chartData: Record<string, any[]>
}
