import { ReactNode, useEffect, useRef } from 'react';
import { applyA4PrintStyles } from '@/lib/printUtils';

interface A4PrintWrapperProps {
  children: ReactNode;
  id: string;
  title?: string;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  className?: string;
}

export function A4PrintWrapper({
  children,
  id,
  title,
  headerContent,
  footerContent,
  className = ''
}: A4PrintWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      applyA4PrintStyles(wrapperRef.current);
    }
  }, []);

  return (
    <div
      id={id}
      ref={wrapperRef}
      className={`print-wrapper bg-white ${className}`}
      style={{
        width: '794px',
        minHeight: '1123px',
        padding: '76px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      {(title || headerContent) && (
        <div className="print-header mb-6 no-print-hide">
          {title && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
          {headerContent}
        </div>
      )}

      {/* Main Content */}
      <div className="print-content">
        {children}
      </div>

      {/* Footer */}
      {footerContent && (
        <div className="print-footer mt-6 pt-4 border-t no-print-hide">
          {footerContent}
        </div>
      )}

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .print-wrapper {
            width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            min-height: auto !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          .no-page-break {
            page-break-inside: avoid;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 10pt;
          }
          
          th {
            background-color: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        @page {
          size: A4;
          margin: 20mm;
        }
      `}</style>
    </div>
  );
}
