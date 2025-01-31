'use client';

import { useState } from 'react';
import { ERROR_MESSAGES, CONFIRM_MESSAGES, FILE_CONSTANTS } from './constants/app';
import { MainLayout } from './components/MainLayout';
import { SheetDataType } from './types/excel';
import { processExcelFile } from './features/excel/processExcel';
import { generatePdf } from './features/pdf/generatePdf';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sheetData, setSheetData] = useState<SheetDataType>([]);
  const [hasValidData, setHasValidData] = useState(false);
  const [barcodeUrls, setBarcodeUrls] = useState<string[]>([]);
  const [showBorder, setShowBorder] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await processExcelFile(file);
      setSheetData(result.sheetData);
      setBarcodeUrls(result.barcodeUrls);
      setHasValidData(result.hasValidData);
    } catch (error) {
      console.error('Error processing XLSX:', error);
      alert(ERROR_MESSAGES.EXCEL_PROCESS);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdfBytes = await generatePdf({
        sheetData,
        barcodeUrls,
        showBorder
      });

      if (window.confirm(CONFIRM_MESSAGES.DOWNLOAD_PDF)) {
        const blob = new Blob([pdfBytes], { type: FILE_CONSTANTS.PDF_MIME_TYPE });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = FILE_CONSTANTS.PDF_FILENAME;
        link.click();
        
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      const errorMessage = error instanceof Error ? 
        error.message : 
        ERROR_MESSAGES.UNKNOWN;
      alert(`${ERROR_MESSAGES.PDF_GENERATE}${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MainLayout
      sheetData={sheetData}
      barcodeUrls={barcodeUrls}
      hasValidData={hasValidData}
      isGenerating={isGenerating}
      showBorder={showBorder}
      onFileUpload={handleFileUpload}
      onGeneratePDF={handleGeneratePDF}
      onBorderChange={setShowBorder}
    />
  );
}
