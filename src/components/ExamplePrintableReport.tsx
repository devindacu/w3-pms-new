/**
 * Example of integrating print functionality into existing components
 * This demonstrates the pattern to follow for all modules
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { A4PrintWrapper } from '@/components/A4PrintWrapper';
import { PrintButton } from '@/components/PrintButton';
import { usePrint } from '@/hooks/use-print';

export function ExamplePrintableReport() {
  const { print, downloadPDF, downloadWord } = usePrint();

  // Example data
  const reportData = {
    title: 'Monthly Financial Report',
    date: new Date().toLocaleDateString(),
    items: [
      { category: 'Revenue', amount: 50000 },
      { category: 'Expenses', amount: 30000 },
      { category: 'Profit', amount: 20000 }
    ]
  };

  return (
    <div className="space-y-4">
      {/* Control Panel (hidden in print) */}
      <Card className="p-4 no-print">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Report Actions</h2>
          <div className="flex gap-2">
            {/* Method 1: Using PrintButton component */}
            <PrintButton
              elementId="printable-report"
              options={{
                title: reportData.title,
                filename: `report-${Date.now()}`,
                includeHeader: true,
                headerText: 'Company Name - Confidential',
                includeFooter: true,
                footerText: `Generated on ${reportData.date}`
              }}
            />

            {/* Method 2: Using individual buttons with hook */}
            <Button 
              variant="outline" 
              onClick={() => print('printable-report', { title: reportData.title })}
            >
              Quick Print
            </Button>
          </div>
        </div>
      </Card>

      {/* Printable Content wrapped in A4PrintWrapper */}
      <A4PrintWrapper
        id="printable-report"
        title={reportData.title}
        headerContent={
          <div className="text-sm text-muted-foreground">
            Report Date: {reportData.date}
          </div>
        }
        footerContent={
          <div className="text-xs text-muted-foreground text-center">
            © 2024 Your Company. All rights reserved.
          </div>
        }
      >
        {/* Your report content here */}
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-4">Financial Summary</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Category</th>
                  <th className="border p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.category}</td>
                    <td className="border p-2 text-right">
                      ${item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Analysis</h2>
            <p className="text-sm leading-relaxed">
              This report shows a positive trend in revenue generation with controlled
              expenses resulting in healthy profit margins. The data indicates sustainable
              growth patterns that align with our quarterly projections.
            </p>
          </section>
        </div>
      </A4PrintWrapper>
    </div>
  );
}
