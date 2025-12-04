import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  EnvelopeSimple,
  EnvelopeOpen,
  CursorClick,
  TrendUp,
  TrendDown,
  Minus,
  ChartBar,
  Clock,
  DeviceMobile,
  Desktop,
  DeviceTablet,
  ArrowUp,
  ArrowDown
} from '@phosphor-icons/react'
import type { EmailTemplateAnalytics, EmailSentRecord, EmailCampaignAnalytics } from '@/lib/types'
import { formatPercent } from '@/lib/helpers'

interface EmailTemplateAnalyticsProps {
  templateAnalytics: EmailTemplateAnalytics[]
  campaignAnalytics: EmailCampaignAnalytics[]
  emailRecords: EmailSentRecord[]
}

export function EmailTemplateAnalyticsComponent({
  templateAnalytics,
  campaignAnalytics,
  emailRecords,
}: EmailTemplateAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('monthly')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('all')

  const filteredAnalytics = useMemo(() => {
    let data = templateAnalytics.filter(a => a.period === selectedPeriod)
    
    if (selectedTemplateId !== 'all') {
      data = data.filter(a => a.templateId === selectedTemplateId)
    }
    
    return data.sort((a, b) => b.openRate - a.openRate)
  }, [templateAnalytics, selectedPeriod, selectedTemplateId])

  const overallStats = useMemo(() => {
    if (filteredAnalytics.length === 0) {
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        avgDeliveryRate: 0,
        avgClickToOpenRate: 0,
      }
    }

    const totalSent = filteredAnalytics.reduce((sum, a) => sum + a.totalSent, 0)
    const totalDelivered = filteredAnalytics.reduce((sum, a) => sum + a.totalDelivered, 0)
    const totalOpened = filteredAnalytics.reduce((sum, a) => sum + a.totalOpened, 0)
    const totalClicked = filteredAnalytics.reduce((sum, a) => sum + a.totalClicked, 0)

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      avgOpenRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      avgClickRate: totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0,
      avgDeliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      avgClickToOpenRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
    }
  }, [filteredAnalytics])

  const topPerformers = useMemo(() => {
    return filteredAnalytics
      .filter(a => a.totalSent >= 10)
      .sort((a, b) => b.openRate - a.openRate)
      .slice(0, 5)
  }, [filteredAnalytics])

  const bottomPerformers = useMemo(() => {
    return filteredAnalytics
      .filter(a => a.totalSent >= 10)
      .sort((a, b) => a.openRate - b.openRate)
      .slice(0, 5)
  }, [filteredAnalytics])

  const getTrendIcon = (rate: number, avgRate: number) => {
    if (rate > avgRate + 5) return <TrendUp size={16} className="text-success" />
    if (rate < avgRate - 5) return <TrendDown size={16} className="text-destructive" />
    return <Minus size={16} className="text-muted-foreground" />
  }

  const getRateColor = (rate: number, type: 'open' | 'click' | 'delivery') => {
    const thresholds = {
      open: { good: 25, medium: 15 },
      click: { good: 5, medium: 2 },
      delivery: { good: 95, medium: 90 },
    }

    if (rate >= thresholds[type].good) return 'text-success'
    if (rate >= thresholds[type].medium) return 'text-accent'
    return 'text-destructive'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Email Template Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track open rates, click-through rates, and engagement metrics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedPeriod} onValueChange={(v: any) => setSelectedPeriod(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Templates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {templateAnalytics.map(t => (
                <SelectItem key={t.templateId} value={t.templateId}>
                  {t.templateName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Emails Sent</h3>
            <EnvelopeSimple size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{overallStats.totalSent.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {overallStats.totalDelivered.toLocaleString()} delivered
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Open Rate</h3>
            <EnvelopeOpen size={20} className="text-success" />
          </div>
          <p className={`text-3xl font-semibold ${getRateColor(overallStats.avgOpenRate, 'open')}`}>
            {formatPercent(overallStats.avgOpenRate / 100)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {overallStats.totalOpened.toLocaleString()} unique opens
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Click Rate</h3>
            <CursorClick size={20} className="text-accent" />
          </div>
          <p className={`text-3xl font-semibold ${getRateColor(overallStats.avgClickRate, 'click')}`}>
            {formatPercent(overallStats.avgClickRate / 100)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {overallStats.totalClicked.toLocaleString()} total clicks
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Click-to-Open</h3>
            <ChartBar size={20} className="text-secondary" />
          </div>
          <p className="text-3xl font-semibold">
            {formatPercent(overallStats.avgClickToOpenRate / 100)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Engagement quality metric
          </p>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="templates">Template Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold">All Templates Performance</h3>
              <p className="text-sm text-muted-foreground">
                Detailed metrics for each email template
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Delivered</TableHead>
                    <TableHead className="text-right">Open Rate</TableHead>
                    <TableHead className="text-right">Click Rate</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Bounce Rate</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalytics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No analytics data available for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAnalytics.map((analytics) => (
                      <TableRow key={analytics.templateId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{analytics.templateName}</p>
                            <Badge variant="outline" className="mt-1">
                              {analytics.templateCategory}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {analytics.totalSent.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {analytics.totalDelivered.toLocaleString()}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${getRateColor(analytics.openRate, 'open')}`}>
                          {formatPercent(analytics.openRate / 100)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${getRateColor(analytics.clickRate, 'click')}`}>
                          {formatPercent(analytics.clickRate / 100)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPercent(analytics.clickToOpenRate / 100)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercent(analytics.bounceRate / 100)}
                        </TableCell>
                        <TableCell className="text-right">
                          {getTrendIcon(analytics.openRate, overallStats.avgOpenRate)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold">Recent Campaigns</h3>
              <p className="text-sm text-muted-foreground">
                Performance metrics for batch email campaigns
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Recipients</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Open Rate</TableHead>
                    <TableHead className="text-right">Click Rate</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignAnalytics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No campaign data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaignAnalytics.slice(0, 10).map((campaign) => (
                      <TableRow key={campaign.batchId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{campaign.batchName || 'Unnamed Campaign'}</p>
                            <p className="text-sm text-muted-foreground">{campaign.templateName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.totalRecipients.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.totalSent.toLocaleString()}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${getRateColor(campaign.openRate, 'open')}`}>
                          {formatPercent(campaign.openRate / 100)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${getRateColor(campaign.clickRate, 'click')}`}>
                          {formatPercent(campaign.clickRate / 100)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPercent(campaign.clickToOpenRate / 100)}
                        </TableCell>
                        <TableCell>
                          {new Date(campaign.sentAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ArrowUp size={20} className="text-success" />
                Top Performing Templates
              </h3>
              <div className="space-y-3">
                {topPerformers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Not enough data available
                  </p>
                ) : (
                  topPerformers.map((template, index) => (
                    <div key={template.templateId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                          <p className="font-medium text-sm">{template.templateName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.totalSent} sent
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-success">
                          {formatPercent(template.openRate / 100)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPercent(template.clickRate / 100)} CTR
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ArrowDown size={20} className="text-destructive" />
                Needs Improvement
              </h3>
              <div className="space-y-3">
                {bottomPerformers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Not enough data available
                  </p>
                ) : (
                  bottomPerformers.map((template, index) => (
                    <div key={template.templateId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                          <p className="font-medium text-sm">{template.templateName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.totalSent} sent
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-destructive">
                          {formatPercent(template.openRate / 100)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPercent(template.clickRate / 100)} CTR
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {selectedTemplateId !== 'all' && filteredAnalytics.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Detailed Insights</h3>
              {filteredAnalytics.map((analytics) => (
                <div key={analytics.templateId} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Device Breakdown</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <Desktop size={16} />
                            Desktop
                          </span>
                          <span className="font-medium">
                            {formatPercent(
                              analytics.deviceBreakdown.desktop /
                                (analytics.deviceBreakdown.desktop +
                                  analytics.deviceBreakdown.mobile +
                                  analytics.deviceBreakdown.tablet +
                                  analytics.deviceBreakdown.unknown)
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <DeviceMobile size={16} />
                            Mobile
                          </span>
                          <span className="font-medium">
                            {formatPercent(
                              analytics.deviceBreakdown.mobile /
                                (analytics.deviceBreakdown.desktop +
                                  analytics.deviceBreakdown.mobile +
                                  analytics.deviceBreakdown.tablet +
                                  analytics.deviceBreakdown.unknown)
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <DeviceTablet size={16} />
                            Tablet
                          </span>
                          <span className="font-medium">
                            {formatPercent(
                              analytics.deviceBreakdown.tablet /
                                (analytics.deviceBreakdown.desktop +
                                  analytics.deviceBreakdown.mobile +
                                  analytics.deviceBreakdown.tablet +
                                  analytics.deviceBreakdown.unknown)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Timing Insights</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <Clock size={16} />
                            Avg Time to Open
                          </span>
                          <span className="font-medium">
                            {analytics.averageTimeToOpen
                              ? `${Math.round(analytics.averageTimeToOpen / 3600)}h`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <Clock size={16} />
                            Avg Time to Click
                          </span>
                          <span className="font-medium">
                            {analytics.averageTimeToClick
                              ? `${Math.round(analytics.averageTimeToClick / 3600)}h`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Top Links</p>
                      <div className="space-y-2">
                        {analytics.topLinks.slice(0, 3).map((link, idx) => (
                          <div key={idx} className="text-sm">
                            <p className="font-medium truncate">{link.linkText || 'Link'}</p>
                            <p className="text-xs text-muted-foreground">
                              {link.clicks} clicks ({link.uniqueClicks} unique)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
