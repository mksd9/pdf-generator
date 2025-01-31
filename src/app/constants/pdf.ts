// src/app/constants/pdf.ts
// PDFマージンの定数（ミリメートルをポイントに変換）
export const PDF_MARGINS = {
  left: 8.4 * 2.83465,  // 8.4mm
  right: 50,
  top: 8.8 * 2.83465,   // 8.8mm
  bottom: 50,
  indent: 120  // 追加：テーブルの項目名と内容の間隔
} as const;
