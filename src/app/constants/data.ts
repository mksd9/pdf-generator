// テーブルデータ関連の定数
export const TABLE_CONSTANTS = {
    COLUMNS: {
      START: 0,
      END: 4,
      BARCODE: 2  // JANコードが格納される列
    },
    STYLES: {
      CELL_CLASS: 'border p-2'
    }
  } as const;
  
  // バーコード関連の定数
  export const BARCODE_CONSTANTS = {
    FORMAT: 'EAN13',
    SETTINGS: {
      width: 2.4,    // 線の幅
      height: 100,   // バーコードの高さ
      fontSize: 30,  // バーコード下の文字サイズ
      margin: 2,     // バーコードの余白
      textMargin: 4  // バーコード文字の余白
    },
    DISPLAY: {
      maxWidth: 180,  // プレビュー時の最大幅（px）
      maxHeight: 60,  // プレビュー時の最大高さ（px）
      previewScale: '50%' // プレビュー時のスケール
    }
  } as const;
  
  // JANコード検証用の定数
  export const JAN_CODE = {
  PATTERN: /^\d{13}$/
  } as const;

// PDFレイアウト関連の定数
export const PDF_LAYOUT = {
  CONTAINER: {
    WIDTH: 48.3,  // mm
    HEIGHT: 25.4  // mm
  },
  MARGINS: {
    LEFT: 8.4,    // 左端からの距離 (mm)
    TOP: 8.8      // 上端からの距離 (mm)
  },
  CONVERSION: {
    MM_TO_POINTS: 2.83465  // 1mm ≈ 2.83465ポイント
  },
  TEXT: {
    MARGIN: 2,    // mm
    LINE_HEIGHT: 2.5,  // mm
    FONT_SIZE: 6
  },
  BORDER: {
    WIDTH: 0.5
  },
  BARCODE: {
    HEIGHT_SCALE: 0.5  // コンテナの高さの80%
  }
} as const;
