'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { PDFDocument, PageSizes, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { NOTO_SANS_JP_BASE64 } from '../fonts/noto-sans-jp-base64';
import JsBarcode from 'jsbarcode';
import Image from 'next/image';
import {
  APP_CONSTANTS,
  FILE_CONSTANTS,
  ERROR_MESSAGES,
  CONFIRM_MESSAGES
} from './constants/app';
import {
  TABLE_CONSTANTS,
  BARCODE_CONSTANTS,
  JAN_CODE,
  PDF_LAYOUT
} from './constants/data';

type SheetDataType = Array<(string | number)[]>;

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sheetData, setSheetData] = useState<SheetDataType>([]);
  const [hasValidData, setHasValidData] = useState(false);
  const [barcodeUrls, setBarcodeUrls] = useState<string[]>([]);
  const [showBorder, setShowBorder] = useState(false);

  // JANコードからバーコード画像を生成
  // canvas要素を使用してバーコードを描画し、データURLとして返却
  const generateBarcodeImage = (barcodeNumber: string): string => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcodeNumber, {
      format: BARCODE_CONSTANTS.FORMAT,
      displayValue: true,
      ...BARCODE_CONSTANTS.SETTINGS
    });
    return canvas.toDataURL(FILE_CONSTANTS.IMAGE_MIME_TYPE);
  };

  // Excelファイルをアップロードし、バーコードデータを抽出・検証する
  // 有効なJANコードを持つ行のみを抽出し、対応するバーコード画像を生成
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(firstSheet, { header: 1 });
      
      const validRows = jsonData.filter((row: (string | number)[]) => {
        if (!row[TABLE_CONSTANTS.COLUMNS.BARCODE]) return false;
        const cValue = String(row[TABLE_CONSTANTS.COLUMNS.BARCODE]);
        return JAN_CODE.PATTERN.test(cValue);
      });

      const urls = validRows.map(row => 
        generateBarcodeImage(String(row[TABLE_CONSTANTS.COLUMNS.BARCODE]))
      );
      
      setSheetData(validRows);
      setBarcodeUrls(urls);
      setHasValidData(validRows.length > 0);
    } catch (error) {
      console.error('Error processing XLSX:', error);
      alert(ERROR_MESSAGES.EXCEL_PROCESS);
    }
  };

  // PDFを生成し、A4用紙に4列×11行のコンテナを配置
  // 各コンテナには商品情報とバーコードを配置
  // 生成後、ダウンロードを促す
  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const fontBytes = Buffer.from(NOTO_SANS_JP_BASE64, 'base64');
      const font = await pdfDoc.embedFont(fontBytes);

      for (let i = 0; i < sheetData.length; i++) {
        const row = sheetData[i];
        const page = pdfDoc.addPage(PageSizes.A4);
        const { height } = page.getSize();

        // 11行のコンテナを配置
        const numberOfRows = 11;
        const numberOfContainersPerRow = 4;

        for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
          // 各行のY座標を計算（上端からの距離 + コンテナの高さ * 行数）
          const baseY = height - 
            (PDF_LAYOUT.MARGINS.TOP * PDF_LAYOUT.CONVERSION.MM_TO_POINTS) - 
            ((PDF_LAYOUT.CONTAINER.HEIGHT * (rowIndex + 1)) * PDF_LAYOUT.CONVERSION.MM_TO_POINTS);

          // 4つのコンテナを横一列に配置
          for (let containerIndex = 0; containerIndex < numberOfContainersPerRow; containerIndex++) {
            // コンテナのX座標を計算（左端からの距離 + コンテナの幅 * インデックス）
            const containerX = (PDF_LAYOUT.MARGINS.LEFT * PDF_LAYOUT.CONVERSION.MM_TO_POINTS) + 
                             (PDF_LAYOUT.CONTAINER.WIDTH * PDF_LAYOUT.CONVERSION.MM_TO_POINTS * containerIndex);
            
            // コンテナの罫線を描画（showBorderがtrueの場合のみ）
            if (showBorder) {
              page.drawRectangle({
                x: containerX,
                y: baseY,
                width: PDF_LAYOUT.CONTAINER.WIDTH * PDF_LAYOUT.CONVERSION.MM_TO_POINTS,
                height: PDF_LAYOUT.CONTAINER.HEIGHT * PDF_LAYOUT.CONVERSION.MM_TO_POINTS,
                borderColor: rgb(0, 0, 0),
                borderWidth: PDF_LAYOUT.BORDER.WIDTH,
              });
            }

            // テキストデータの表示（コンテナ内に配置）
            const textMargin = PDF_LAYOUT.TEXT.MARGIN * PDF_LAYOUT.CONVERSION.MM_TO_POINTS;
            const lineHeight = PDF_LAYOUT.TEXT.LINE_HEIGHT * PDF_LAYOUT.CONVERSION.MM_TO_POINTS;
            const containerTopY = baseY + PDF_LAYOUT.CONTAINER.HEIGHT * PDF_LAYOUT.CONVERSION.MM_TO_POINTS;

            // コンテナの全幅を計算
            const containerWidth = PDF_LAYOUT.CONTAINER.WIDTH * PDF_LAYOUT.CONVERSION.MM_TO_POINTS;

            // 列Bの値（商品名）
            const textB = String(row[1] || '');
            const textBWidth = font.widthOfTextAtSize(textB, PDF_LAYOUT.TEXT.FONT_SIZE);
            page.drawText(textB, {
              x: containerX + (containerWidth - textBWidth) / 2,
              y: containerTopY - lineHeight - (PDF_LAYOUT.TEXT.COLUMN_B_OFFSET * PDF_LAYOUT.CONVERSION.MM_TO_POINTS),
              font,
              size: PDF_LAYOUT.TEXT.FONT_SIZE,
            });

            // 列Cの値（EAN 13桁）
            const textC = String(row[2] || '');
            const textCWidth = font.widthOfTextAtSize(textC, PDF_LAYOUT.TEXT.FONT_SIZE);
            page.drawText(textC, {
              x: containerX + (containerWidth - textCWidth) / 2,
              y: containerTopY - lineHeight * 2 - (PDF_LAYOUT.TEXT.COLUMN_B_OFFSET * PDF_LAYOUT.CONVERSION.MM_TO_POINTS),
              font,
              size: PDF_LAYOUT.TEXT.FONT_SIZE,
            });

            // 列Dの値（EAN 12桁）
            const textD = String(row[3] || '');
            const textDWidth = font.widthOfTextAtSize(textD, PDF_LAYOUT.TEXT.FONT_SIZE);
            page.drawText(textD, {
              x: containerX + (containerWidth - textDWidth) / 2,
              y: containerTopY - lineHeight * 3 - (PDF_LAYOUT.TEXT.COLUMN_B_OFFSET * PDF_LAYOUT.CONVERSION.MM_TO_POINTS),
              font,
              size: PDF_LAYOUT.TEXT.FONT_SIZE,
            });

            // 列Eの値（3桁）
            const textE = String(row[4] || '');
            const textEWidth = font.widthOfTextAtSize(textE, PDF_LAYOUT.TEXT.FONT_SIZE);
            page.drawText(textE, {
              x: containerX + (containerWidth - textEWidth) / 2,
              y: containerTopY - lineHeight * 4 - (PDF_LAYOUT.TEXT.COLUMN_B_OFFSET * PDF_LAYOUT.CONVERSION.MM_TO_POINTS),
              font,
              size: PDF_LAYOUT.TEXT.FONT_SIZE,
            });

            // バーコードの配置（コンテナ内の右側に配置）
            const janCode = String(row[TABLE_CONSTANTS.COLUMNS.BARCODE]);
            if (JAN_CODE.PATTERN.test(janCode)) {
              const barcodeImage = await pdfDoc.embedPng(
                Buffer.from(barcodeUrls[i].split(',')[1], 'base64')
              );
              
              // バーコードのサイズを調整
              const maxBarcodeHeight = PDF_LAYOUT.CONTAINER.HEIGHT * PDF_LAYOUT.CONVERSION.MM_TO_POINTS * PDF_LAYOUT.BARCODE.HEIGHT_SCALE;
              const scale = maxBarcodeHeight / barcodeImage.height;
              const barcodeWidth = barcodeImage.width * scale;
              const barcodeHeight = barcodeImage.height * scale;
              
              // バーコードを右下に配置
              const barcodeX = containerX + (PDF_LAYOUT.CONTAINER.WIDTH * PDF_LAYOUT.CONVERSION.MM_TO_POINTS) - barcodeWidth - textMargin;
              const barcodeY = baseY + textMargin; // 下端からマージン分だけ上に配置
              
              page.drawImage(barcodeImage, {
                x: barcodeX,
                y: barcodeY,
                width: barcodeWidth,
                height: barcodeHeight,
              });

              // 列Aの値（商品コード）を列Eの次の行、左詰めで配置
              page.drawText(String(row[0] || ''), {
                x: containerX + textMargin, // コンテナの左端からマージン分だけ右に
                y: containerTopY - lineHeight * 6, // 列Eの次の次の行（lineHeight * 6）
                font,
                size: PDF_LAYOUT.TEXT.FONT_SIZE,
              });
            }
          }
        }
      }

      const pdfBytes = await pdfDoc.save();

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

  // メインのレイアウト
  // ファイルアップロード、データプレビュー、PDF生成ボタン、罫線表示切替を配置
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-2xl font-bold">{APP_CONSTANTS.TITLE}</h1>
      
      <div className="mb-8">
        <input
          type="file"
          accept={FILE_CONSTANTS.EXCEL_TYPE}
          onChange={handleFileUpload}
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
                    {Array.from({ length: TABLE_CONSTANTS.COLUMNS.END + 1 }).map((_, colIndex) => (
                      <td key={colIndex} className={`${TABLE_CONSTANTS.STYLES.CELL_CLASS} ${
                        colIndex === 0 ? TABLE_CONSTANTS.STYLES.COLUMN_WIDTHS.PRODUCT_CODE :
                        colIndex === 1 ? TABLE_CONSTANTS.STYLES.COLUMN_WIDTHS.PRODUCT_NAME :
                        TABLE_CONSTANTS.STYLES.COLUMN_WIDTHS.DEFAULT
                      }`}>
                        {String(row[colIndex] || '')}
                      </td>
                    ))}
                    <td className={TABLE_CONSTANTS.STYLES.CELL_CLASS}>
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
          onClick={generatePDF}
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
              onChange={() => setShowBorder(false)}
              className="mr-2"
            />
            {APP_CONSTANTS.BORDER_OPTIONS.HIDE}
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="borderOption"
              checked={showBorder}
              onChange={() => setShowBorder(true)}
              className="mr-2"
            />
            {APP_CONSTANTS.BORDER_OPTIONS.SHOW}
          </label>
        </div>
      </div>
    </main>
  );
}
