import { useCallback, useState } from 'react';
import { printPreview, downloadAsPDF, downloadAsWord, showPrintDialog, type PrintOptions } from '@/lib/printUtils';
import { toast } from 'sonner';

export function usePrint() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePrint = useCallback((elementId: string, options?: PrintOptions) => {
    try {
      printPreview(elementId, options);
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to open print preview');
    }
  }, []);

  const handleDownloadPDF = useCallback(async (elementId: string, options?: PrintOptions) => {
    setIsProcessing(true);
    try {
      await downloadAsPDF(elementId, options);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownloadWord = useCallback(async (elementId: string, options?: PrintOptions) => {
    setIsProcessing(true);
    try {
      await downloadAsWord(elementId, options);
      toast.success('Word document downloaded successfully');
    } catch (error) {
      console.error('Word download error:', error);
      toast.error('Failed to download Word document');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleShowDialog = useCallback((elementId: string, options?: PrintOptions) => {
    showPrintDialog(elementId, options);
  }, []);

  return {
    isProcessing,
    print: handlePrint,
    downloadPDF: handleDownloadPDF,
    downloadWord: handleDownloadWord,
    showDialog: handleShowDialog
  };
}
