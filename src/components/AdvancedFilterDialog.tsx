import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FunnelSimple,
  X,
  Plus,
  ArrowsClockwise,
  FloppyDisk
} from '@phosphor-icons/react'

export type FilterCondition = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'contains' | 'starts_with' | 'ends_with' | 'in_list' | 'not_in_list'

export type FilterField = {
  id: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'currency'
  options?: { value: string; label: string }[]
}

export type FilterRule = {
  id: string
  field: string
  condition: FilterCondition
  value: string | string[]
  value2?: string
}

export type FilterGroup = {
  id: string
  operator: 'AND' | 'OR'
  rules: FilterRule[]
}

export type AdvancedFilter = {
  id: string
  name: string
  groups: FilterGroup[]
  globalOperator: 'AND' | 'OR'
}

interface AdvancedFilterDialogProps {
  fields: FilterField[]
  onApplyFilter: (filter: AdvancedFilter) => void
  savedFilters?: AdvancedFilter[]
  onSaveFilter?: (filter: AdvancedFilter) => void
  onDeleteFilter?: (filterId: string) => void
  trigger?: React.ReactNode
}

export function AdvancedFilterDialog({
  fields,
  onApplyFilter,
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter,
  trigger
}: AdvancedFilterDialogProps) {
  const [open, setOpen] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [globalOperator, setGlobalOperator] = useState<'AND' | 'OR'>('AND')
  const [groups, setGroups] = useState<FilterGroup[]>([
    {
      id: `group-${Date.now()}`,
      operator: 'AND',
      rules: []
    }
  ])

  const conditionOptions: { value: FilterCondition; label: string; types: string[] }[] = [
    { value: 'equals', label: 'Equals', types: ['text', 'number', 'date', 'select', 'currency'] },
    { value: 'not_equals', label: 'Not Equals', types: ['text', 'number', 'date', 'select', 'currency'] },
    { value: 'greater_than', label: 'Greater Than', types: ['number', 'date', 'currency'] },
    { value: 'less_than', label: 'Less Than', types: ['number', 'date', 'currency'] },
    { value: 'between', label: 'Between', types: ['number', 'date', 'currency'] },
    { value: 'contains', label: 'Contains', types: ['text'] },
    { value: 'starts_with', label: 'Starts With', types: ['text'] },
    { value: 'ends_with', label: 'Ends With', types: ['text'] },
    { value: 'in_list', label: 'In List', types: ['text', 'number', 'select', 'multiselect'] },
    { value: 'not_in_list', label: 'Not In List', types: ['text', 'number', 'select', 'multiselect'] }
  ]

  const addGroup = () => {
    setGroups([
      ...groups,
      {
        id: `group-${Date.now()}`,
        operator: 'AND',
        rules: []
      }
    ])
  }

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId))
  }

  const updateGroupOperator = (groupId: string, operator: 'AND' | 'OR') => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, operator } : g))
  }

  const addRule = (groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          rules: [
            ...g.rules,
            {
              id: `rule-${Date.now()}-${Math.random()}`,
              field: fields[0]?.id || '',
              condition: 'equals',
              value: ''
            }
          ]
        }
      }
      return g
    }))
  }

  const removeRule = (groupId: string, ruleId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          rules: g.rules.filter(r => r.id !== ruleId)
        }
      }
      return g
    }))
  }

  const updateRule = (groupId: string, ruleId: string, updates: Partial<FilterRule>) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          rules: g.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
        }
      }
      return g
    }))
  }

  const getAvailableConditions = (fieldType: string) => {
    return conditionOptions.filter(opt => opt.types.includes(fieldType))
  }

  const renderValueInput = (groupId: string, rule: FilterRule) => {
    const field = fields.find(f => f.id === rule.field)
    if (!field) return null

    const commonProps = {
      value: Array.isArray(rule.value) ? rule.value[0] || '' : rule.value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        updateRule(groupId, rule.id, { value: e.target.value })
      }
    }

    if (rule.condition === 'between') {
      return (
        <div className="flex gap-2 flex-1">
          <Input
            type={field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
            placeholder="From"
            {...commonProps}
          />
          <Input
            type={field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
            placeholder="To"
            value={rule.value2 || ''}
            onChange={(e) => updateRule(groupId, rule.id, { value2: e.target.value })}
          />
        </div>
      )
    }

    if (rule.condition === 'in_list' || rule.condition === 'not_in_list') {
      return (
        <Input
          type="text"
          placeholder="Enter comma-separated values"
          value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value}
          onChange={(e) => {
            const values = e.target.value.split(',').map(v => v.trim()).filter(v => v)
            updateRule(groupId, rule.id, { value: values })
          }}
          className="flex-1"
        />
      )
    }

    if (field.type === 'select' && field.options) {
      return (
        <Select
          value={Array.isArray(rule.value) ? rule.value[0] || '' : rule.value}
          onValueChange={(value) => updateRule(groupId, rule.id, { value })}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === 'multiselect' && field.options) {
      const selectedValues = Array.isArray(rule.value) ? rule.value : []
      return (
        <div className="flex-1 border rounded-md p-2">
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {field.options.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${rule.id}-${opt.value}`}
                    checked={selectedValues.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, opt.value]
                        : selectedValues.filter(v => v !== opt.value)
                      updateRule(groupId, rule.id, { value: newValues })
                    }}
                  />
                  <Label htmlFor={`${rule.id}-${opt.value}`} className="cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )
    }

    return (
      <Input
        type={field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        {...commonProps}
        className="flex-1"
      />
    )
  }

  const handleApplyFilter = () => {
    const filter: AdvancedFilter = {
      id: `filter-${Date.now()}`,
      name: filterName || 'Unnamed Filter',
      groups,
      globalOperator
    }
    onApplyFilter(filter)
    setOpen(false)
  }

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      alert('Please enter a filter name')
      return
    }
    const filter: AdvancedFilter = {
      id: `filter-${Date.now()}`,
      name: filterName,
      groups,
      globalOperator
    }
    onSaveFilter?.(filter)
  }

  const loadSavedFilter = (filter: AdvancedFilter) => {
    setFilterName(filter.name)
    setGroups(filter.groups)
    setGlobalOperator(filter.globalOperator)
  }

  const handleReset = () => {
    setFilterName('')
    setGlobalOperator('AND')
    setGroups([
      {
        id: `group-${Date.now()}`,
        operator: 'AND',
        rules: []
      }
    ])
  }

  const getTotalRules = () => {
    return groups.reduce((sum, g) => sum + g.rules.length, 0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FunnelSimple size={20} className="mr-2" />
            Advanced Filters
            {getTotalRules() > 0 && (
              <Badge variant="default" className="ml-2">
                {getTotalRules()}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Advanced Filter Builder</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            {savedFilters.length > 0 && (
              <div className="space-y-2">
                <Label>Saved Filters</Label>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map(filter => (
                    <div key={filter.id} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadSavedFilter(filter)}
                        className="h-auto py-1 px-2"
                      >
                        {filter.name}
                      </Button>
                      {onDeleteFilter && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteFilter(filter.id)}
                          className="h-auto py-1 px-1"
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="filter-name"
                  placeholder="e.g., High Value Orders Last Month"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
                {onSaveFilter && (
                  <Button onClick={handleSaveFilter} variant="outline">
                    <FloppyDisk size={18} className="mr-2" />
                    Save
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Global Operator (between groups)</Label>
              <Select value={globalOperator} onValueChange={(v) => setGlobalOperator(v as 'AND' | 'OR')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">Match ALL groups (AND)</SelectItem>
                  <SelectItem value="OR">Match ANY group (OR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              {groups.map((group, groupIdx) => (
                <div key={group.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Label className="font-semibold">Group {groupIdx + 1}</Label>
                      <Select
                        value={group.operator}
                        onValueChange={(v) => updateGroupOperator(group.id, v as 'AND' | 'OR')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addRule(group.id)}
                      >
                        <Plus size={16} className="mr-1" />
                        Add Rule
                      </Button>
                      {groups.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeGroup(group.id)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {group.rules.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No rules in this group. Click "Add Rule" to start.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {group.rules.map((rule, ruleIdx) => {
                        const field = fields.find(f => f.id === rule.field)
                        const availableConditions = field ? getAvailableConditions(field.type) : []

                        return (
                          <div key={rule.id} className="flex items-center gap-2 bg-background p-3 rounded-md">
                            <div className="text-xs text-muted-foreground w-12">
                              {ruleIdx === 0 ? 'WHERE' : group.operator}
                            </div>

                            <Select
                              value={rule.field}
                              onValueChange={(value) => {
                                const newField = fields.find(f => f.id === value)
                                const newCondition = newField ? getAvailableConditions(newField.type)[0]?.value || 'equals' : 'equals'
                                updateRule(group.id, rule.id, { field: value, condition: newCondition, value: '' })
                              }}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {fields.map(field => (
                                  <SelectItem key={field.id} value={field.id}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              value={rule.condition}
                              onValueChange={(value) => updateRule(group.id, rule.id, { condition: value as FilterCondition, value: '' })}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableConditions.map(cond => (
                                  <SelectItem key={cond.value} value={cond.value}>
                                    {cond.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {renderValueInput(group.id, rule)}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeRule(group.id, rule.id)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={addGroup} variant="outline" className="w-full">
              <Plus size={18} className="mr-2" />
              Add Filter Group
            </Button>
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            <ArrowsClockwise size={18} className="mr-2" />
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyFilter}>
              Apply Filter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
