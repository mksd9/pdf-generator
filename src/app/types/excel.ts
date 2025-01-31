export interface ExcelRow {
  productCode: string;      // 商品コード
  productName: string;      // 商品名
  janCode13: string;       // JANコード（13桁）
  janCode12: string;       // JANコード（12桁）
  threeDigitCode: string;  // 3桁コード
}

export type SheetDataType = Array<[
  string,  // 商品コード
  string,  // 商品名
  string,  // JANコード（13桁）
  string,  // JANコード（12桁）
  string   // 3桁コード
]>;

export interface ProcessExcelResult {
  sheetData: SheetDataType;
  barcodeUrls: string[];
  hasValidData: boolean;
}
