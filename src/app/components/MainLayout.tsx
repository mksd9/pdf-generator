import Image from 'next/image';
import { APP_CONSTANTS, FILE_CONSTANTS, ERROR_MESSAGES, CONFIRM_MESSAGES } from '../constants/app';
import { TABLE_CONSTANTS, BARCODE_CONSTANTS } from '../constants/data';
import { SheetDataType } from '../types/excel';
import { processExcelFile } from '../features/excel/processExcel';
import { generatePdf } from '../features/pdf/generatePdf';

interface MainLayoutProps {
  sheetData: SheetDataType;
  barcodeUrls: string[];
  hasValidData: boolean;
  isGenerating: boolean;
  showBorder: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGeneratePDF: () => void;
  onBorderChange: (show: boolean) => void;
}

export const MainLayout = ({
  sheetData,
  barcodeUrls,
  hasValidData,
  isGenerating,
  showBorder,
  onFileUpload,
  onGeneratePDF,
  onBorderChange
}: MainLayoutProps) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-2xl font-bold">{APP_CONSTANTS.TITLE}</h1>
      
      <div className="mb-8">
        <input
          type="file"
          accept={FILE_CONSTANTS.EXCEL_TYPE}
          onChange={onFileUpload}
          className="mb-4 p-2 border border-gray-300 rounded"
        />
      </div>

      {sheetData.length > 0 && (
        <div className="mb-8 w-full max-w-4xl">
          <h2 className="mb-2 text-xl">{APP_CONSTANTS.SHEET_CONTENT_TITLE}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {sheetData.map((row: (string | number)[], index: number) => (
                  <tr key={index}>
                    {Array.from({ length: TABLE_CONSTANTS.COLUMNS.MAIN_COUNT }).map((_, colIndex) => (
                      <td key={colIndex} className={`${TABLE_CONSTANTS.STYLES.CELL_CLASS} ${
                        colIndex === 0 ? TABLE_CONSTANTS.STYLES.COLUMN_WIDTHS.PRODUCT_CODE :
                        colIndex === 1 ? TABLE_CONSTANTS.STYLES.COLUMN_WIDTHS.PRODUCT_NAME :
                        TABLE_CONSTANTS.STYLES.COLUMN_WIDTHS.DEFAULT
                      }`}>
                        {String(row[colIndex] || '')}
                      </td>
                    ))}
                    <td className={`${TABLE_CONSTANTS.STYLES.CELL_CLASS} ${TABLE_CONSTANTS.STYLES.COLUMN_WIDTHS.DEFAULT}`}>
                      {String(row[TABLE_CONSTANTS.COLUMNS.MAIN_COUNT] || '')}
                    </td>
                    <td className={`${TABLE_CONSTANTS.STYLES.CELL_CLASS} ${TABLE_CONSTANTS.STYLES.COLUMN_WIDTHS.DEFAULT}`}>
                      <Image 
                        src={barcodeUrls[index]} 
                        width={BARCODE_CONSTANTS.DISPLAY.maxWidth}
                        height={BARCODE_CONSTANTS.DISPLAY.maxHeight}
                        alt={`バーコード ${row[TABLE_CONSTANTS.COLUMNS.BARCODE]}`}
                        style={{
                          width: BARCODE_CONSTANTS.DISPLAY.previewScale,
                          height: 'auto'
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onGeneratePDF}
          disabled={isGenerating || !hasValidData}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                    disabled:bg-gray-400 disabled:cursor-not-allowed
                    transition-colors duration-200"
        >
          {isGenerating ? APP_CONSTANTS.BUTTON_TEXT.GENERATING : APP_CONSTANTS.BUTTON_TEXT.GENERATE}
        </button>

        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="borderOption"
              checked={!showBorder}
              onChange={() => onBorderChange(false)}
              className="mr-2"
            />
            {APP_CONSTANTS.BORDER_OPTIONS.HIDE}
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="borderOption"
              checked={showBorder}
              onChange={() => onBorderChange(true)}
              className="mr-2"
            />
            {APP_CONSTANTS.BORDER_OPTIONS.SHOW}
          </label>
        </div>
      </div>
    </main>
  );
};
