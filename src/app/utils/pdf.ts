import { PDFPage, PDFFont } from 'pdf-lib';
import { PDF_LAYOUT } from '../constants/data';

interface DrawTextOptions {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  font: PDFFont;
  size: number;
}

/**
 * PDFページにテキストを描画する
 */
export const drawText = ({ page, text, x, y, font, size }: DrawTextOptions): void => {
  page.drawText(text, {
    x,
    y,
    font,
    size,
  });
};

/**
 * コンテナ内のテキストを中央揃えで描画する
 */
export const drawCenteredText = ({
  page,
  text,
  containerX,
  containerWidth,
  y,
  font,
  size,
}: Omit<DrawTextOptions, 'x'> & {
  containerX: number;
  containerWidth: number;
}): void => {
  const textWidth = font.widthOfTextAtSize(text, size);
  drawText({
    page,
    text,
    x: containerX + (containerWidth - textWidth) / 2,
    y,
    font,
    size,
  });
};

/**
 * mmをポイントに変換する
 */
export const mmToPoints = (mm: number): number => {
  return mm * PDF_LAYOUT.CONVERSION.MM_TO_POINTS;
};

/**
 * コンテナのY座標を計算する
 */
export const calculateContainerY = (
  pageHeight: number,
  rowIndex: number
): number => {
  return pageHeight - 
    mmToPoints(PDF_LAYOUT.MARGINS.TOP) - 
    mmToPoints(PDF_LAYOUT.CONTAINER.HEIGHT * (rowIndex + 1));
};

/**
 * コンテナのX座標を計算する
 */
export const calculateContainerX = (containerIndex: number): number => {
  return mmToPoints(PDF_LAYOUT.MARGINS.LEFT) + 
    mmToPoints(PDF_LAYOUT.CONTAINER.WIDTH * containerIndex);
};
