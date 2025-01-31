import { PDFDocument, PageSizes, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { NOTO_SANS_JP_BASE64 } from '../../../fonts/noto-sans-jp-base64';
import { PDF_LAYOUT } from '../../constants/data';
import { FILE_CONSTANTS } from '../../constants/app';
import { SheetDataType } from '../../types/excel';
import { PDFGenerationError } from '../../types/errors';
import {
  drawText,
  drawCenteredText,
  mmToPoints,
  calculateContainerY,
  calculateContainerX,
} from '../../utils/pdf';

interface GeneratePdfOptions {
  sheetData: SheetDataType;
  barcodeUrls: string[];
  showBorder: boolean;
}

/**
 * PDFを生成する
 * @param options - PDF生成オプション
 * @returns 生成されたPDFのバイナリデータ
 * @throws {PDFGenerationError} PDF生成中にエラーが発生した場合
 */
export const generatePdf = async ({
  sheetData,
  barcodeUrls,
  showBorder
}: GeneratePdfOptions): Promise<Uint8Array> => {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = Buffer.from(NOTO_SANS_JP_BASE64, 'base64');
    const font = await pdfDoc.embedFont(fontBytes);

    // バーコード画像を事前に一括でembedする
    const embeddedBarcodes = await Promise.all(
      barcodeUrls.map(async url => 
        pdfDoc.embedPng(Buffer.from(url.split(',')[1], 'base64'))
      )
    );

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      const page = pdfDoc.addPage(PageSizes.A4);
      const { height } = page.getSize();

      const numberOfRows = 11;
      const numberOfContainersPerRow = 4;

      for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
        const baseY = calculateContainerY(height, rowIndex);

        for (let containerIndex = 0; containerIndex < numberOfContainersPerRow; containerIndex++) {
          const containerX = calculateContainerX(containerIndex);
          const containerWidth = mmToPoints(PDF_LAYOUT.CONTAINER.WIDTH);
          const containerHeight = mmToPoints(PDF_LAYOUT.CONTAINER.HEIGHT);
          
          if (showBorder) {
            page.drawRectangle({
              x: containerX,
              y: baseY,
              width: containerWidth,
              height: containerHeight,
              borderColor: rgb(0, 0, 0),
              borderWidth: PDF_LAYOUT.BORDER.WIDTH,
            });
          }

          const textMargin = mmToPoints(PDF_LAYOUT.TEXT.MARGIN);
          const lineHeight = mmToPoints(PDF_LAYOUT.TEXT.LINE_HEIGHT);
          const containerTopY = baseY + containerHeight;
          const columnBOffset = mmToPoints(PDF_LAYOUT.TEXT.COLUMN_B_OFFSET);

          // 中央揃えのテキストを描画
          const texts = [
            { text: String(row[1] || ''), offset: 1 }, // 商品名
            { text: String(row[2] || ''), offset: 2 }, // EAN 13桁
            { text: String(row[3] || ''), offset: 3 }, // EAN 12桁
            { text: String(row[4] || ''), offset: 4 }, // 3桁コード
          ];

          texts.forEach(({ text, offset }) => {
            drawCenteredText({
              page,
              text,
              containerX,
              containerWidth,
              y: containerTopY - lineHeight * offset - columnBOffset,
              font,
              size: PDF_LAYOUT.TEXT.FONT_SIZE,
            });
          });

          // バーコードの配置
          const barcodeImage = embeddedBarcodes[i];
          const maxBarcodeHeight = containerHeight * PDF_LAYOUT.BARCODE.HEIGHT_SCALE;
          const scale = maxBarcodeHeight / barcodeImage.height;
          const barcodeWidth = barcodeImage.width * scale;
          const barcodeHeight = barcodeImage.height * scale;
          
          const barcodeX = containerX + containerWidth - barcodeWidth - textMargin;
          const barcodeY = baseY + textMargin;
          
          page.drawImage(barcodeImage, {
            x: barcodeX,
            y: barcodeY,
            width: barcodeWidth,
            height: barcodeHeight,
          });

          // 商品コードを左詰めで配置
          drawText({
            page,
            text: String(row[0] || ''),
            x: containerX + textMargin,
            y: containerTopY - lineHeight * 6,
            font,
            size: PDF_LAYOUT.TEXT.FONT_SIZE,
          });
        }
      }
    }

    return pdfDoc.save();
  } catch (error) {
    throw new PDFGenerationError(
      `PDF生成中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    );
  }
};
