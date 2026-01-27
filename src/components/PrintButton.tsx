import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Printer, Download, FileText, ChevronDown } from 'lucide-react';
import { usePrint } from '@/hooks/use-print';
import type { PrintOptions } from '@/lib/printUtils';

interface PrintButtonProps {
  elementId: string;
  options?: PrintOptions;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function PrintButton({
  elementId,
  options,
  variant = 'outline',
  size = 'default',
  showLabel = true,
  className
}: PrintButtonProps) {
  const { isProcessing, print, downloadPDF, downloadWord } = usePrint();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isProcessing}>
          <Printer className="h-4 w-4" />
          {showLabel && <span className="ml-2">Print</span>}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => print(elementId, options)}>
          <Printer className="h-4 w-4 mr-2" />
          Print Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadPDF(elementId, options)} disabled={isProcessing}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadWord(elementId, options)} disabled={isProcessing}>
          <FileText className="h-4 w-4 mr-2" />
          Download Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
