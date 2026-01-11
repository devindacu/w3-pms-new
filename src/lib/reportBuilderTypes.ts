export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'table' | 'heatmap' | 'radar'

export type AggregationType = 'sum' | 'average' | 'count' | 'min' | 'max' | 'percentage'

export type DataType = 'string' | 'number' | 'date' | 'boolean'

export type FilterOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between'

export interface ReportMetric {
  id: string
  name: string
  description: string
  category: 'revenue' | 'occupancy' | 'guest' | 'inventory' | 'financial' | 'operational' | 'hr'
  aggregation: AggregationType
  dataField: string
  format?: 'currency' | 'percentage' | 'number' | 'decimal'
  unit?: string
}

export interface ReportDimension {
  id: string
  name: string
  description: string
  category: 'time' | 'location' | 'demographic' | 'product' | 'service' | 'employee'
  dataType: DataType
  dataField: string
  sortable?: boolean
  filterable?: boolean
}

export interface ReportFilter {
  id: string
  dimensionId: string
  field: string
  operator: FilterOperator
  value: string | number | boolean | string[] | number[]
  logicalOperator?: 'AND' | 'OR'
}

export interface VisualizationSettings {
  showLegend?: boolean
  showGrid?: boolean
  showLabels?: boolean
  colorScheme?: 'default' | 'primary' | 'secondary' | 'rainbow' | 'monochrome'
  stacked?: boolean
  orientation?: 'horizontal' | 'vertical'
  sortBy?: 'value' | 'label'
  sortOrder?: 'asc' | 'desc'
}

export interface ReportVisualization {
  id: string
  metricId: string
  chartType: ChartType
  title: string
  dimensionId?: string
  settings: VisualizationSettings
}

export interface CustomReport {
  id: string
  name: string
  description: string
  metrics: ReportMetric[]
  dimensions: ReportDimension[]
  filters: ReportFilter[]
  visualizations: ReportVisualization[]
  createdAt: number
  updatedAt: number
  createdBy: string
  isScheduled: boolean
  scheduleConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    dayOfWeek?: number
    dayOfMonth?: number
    time?: string
    recipients?: string[]
    format?: 'pdf' | 'excel' | 'csv'
  }
}

export interface ReportData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
}

export interface SavedReport {
  id: string
  reportId: string
  reportName: string
  generatedAt: number
  generatedBy: string
  format: 'pdf' | 'excel' | 'csv'
  fileUrl?: string
  dataSnapshot: any
}
