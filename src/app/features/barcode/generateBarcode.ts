import JsBarcode from 'jsbarcode';
import { BARCODE_CONSTANTS } from '../../constants/data';
import { FILE_CONSTANTS } from '../../constants/app';
import { BarcodeGenerationError } from '../../types/errors';
import { JAN_CODE } from '../../constants/data';

/**
 * チェックディジットを計算する
 * @param code - 12桁のJANコード
 * @returns チェックディジット（1桁の数字）
 */
const calculateCheckDigit = (code: string): number => {
  const digits = code.split('').map(Number);
  const sum = digits.reduce((acc, digit, index) => {
    const multiplier = index % 2 === 0 ? 1 : 3;
    return acc + (digit * multiplier);
  }, 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit;
};

/**
 * JANコードからバーコード画像を生成する
 * @param barcodeNumber - バーコード番号（12桁のJANコード）
 * @returns バーコード画像のデータURL
 * @throws {BarcodeGenerationError} バーコード生成に失敗した場合
 */
export const generateBarcodeImage = (barcodeNumber: string): string => {
  if (!JAN_CODE.PATTERN.test(barcodeNumber)) {
    throw new BarcodeGenerationError(
      `無効なJANコードです: ${barcodeNumber}`
    );
  }

  // チェックディジットを計算して13桁のJANコードを生成
  const checkDigit = calculateCheckDigit(barcodeNumber);
  const fullJanCode = `${barcodeNumber}${checkDigit}`;

  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, fullJanCode, {
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
