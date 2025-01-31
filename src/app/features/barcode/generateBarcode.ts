import JsBarcode from 'jsbarcode';
import { BARCODE_CONSTANTS } from '../../constants/data';
import { FILE_CONSTANTS } from '../../constants/app';
import { BarcodeGenerationError } from '../../types/errors';
import { JAN_CODE } from '../../constants/data';

/**
 * JANコードからバーコード画像を生成する
 * @param barcodeNumber - バーコード番号（JANコード）
 * @returns バーコード画像のデータURL
 * @throws {BarcodeGenerationError} バーコード生成に失敗した場合
 */
export const generateBarcodeImage = (barcodeNumber: string): string => {
  if (!JAN_CODE.PATTERN.test(barcodeNumber)) {
    throw new BarcodeGenerationError(
      `無効なJANコードです: ${barcodeNumber}`
    );
  }

  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcodeNumber, {
      format: BARCODE_CONSTANTS.FORMAT,
      displayValue: true,
      ...BARCODE_CONSTANTS.SETTINGS
    });
    return canvas.toDataURL(FILE_CONSTANTS.IMAGE_MIME_TYPE);
  } catch (error) {
    throw new BarcodeGenerationError(
      `バーコード生成中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    );
  }
};
