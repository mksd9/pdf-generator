import * as XLSX from 'xlsx';
import { TABLE_CONSTANTS, JAN_CODE } from '../../constants/data';
import { generateBarcodeImage } from '../barcode/generateBarcode';
import { ExcelProcessError } from '../../types/errors';
import { SheetDataType, ProcessExcelResult } from '../../types/excel';

/**
 * Excelファイルを処理し、バーコードデータを抽出・検証する
 * @param file - アップロードされたExcelファイル
 * @returns 処理結果（シートデータ、バーコードURL、データ有効性）
 * @throws {ExcelProcessError} Excel処理中にエラーが発生した場合
 */
export const processExcelFile = async (file: File): Promise<ProcessExcelResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    
    if (workbook.SheetNames.length === 0) {
      throw new ExcelProcessError('シートが見つかりません');
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) {
      throw new ExcelProcessError('シートの内容を読み取れません');
    }

    const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(firstSheet, { 
      header: 1,
      raw: true,      // 生の値を取得
      defval: '',     // 空のセルに対してデフォルト値を設定
      blankrows: false // 空行を除外
    });
    
    // データが存在する行のみを処理
    const dataRows = jsonData.filter(row => 
      Array.isArray(row) && row.length > 0 && row.some(cell => cell !== '')
    );
    
    const validRows = dataRows.filter((row: (string | number)[]) => {
      // 最低限必要な列数（5列）があることを確認
      if (!Array.isArray(row) || row.length < TABLE_CONSTANTS.COLUMNS.MAIN_COUNT) {
        return false;
      }

      // JANコードが存在し、有効な形式であることを確認
      const janCode = String(row[TABLE_CONSTANTS.COLUMNS.BARCODE]);
      if (!janCode || !JAN_CODE.PATTERN.test(janCode)) {
        return false;
      }

      // すべての必須フィールドが存在することを確認（不要かもしれない）
      // for (let i = 0; i < TABLE_CONSTANTS.COLUMNS.MAIN_COUNT; i++) {
      //   if (row[i] === undefined || row[i] === '') {
      //     return false;
      //   }
      // }

      return true;
    });

    const urls = await Promise.all(
      validRows.map(async row => {
        try {
          return generateBarcodeImage(String(row[TABLE_CONSTANTS.COLUMNS.BARCODE]));
        } catch (error) {
          console.error(`バーコード生成エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
          throw new ExcelProcessError(`バーコード生成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
        }
      })
    );
    
    return {
      sheetData: validRows as SheetDataType,
      barcodeUrls: urls,
      hasValidData: validRows.length > 0
    };
  } catch (error) {
    if (error instanceof ExcelProcessError) {
      throw error;
    }
    throw new ExcelProcessError(
      `Excel処理中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    );
  }
};
