// テーブルデータ関連の定数
export const TABLE_CONSTANTS = {
    COLUMNS: {
      TOTAL_COUNT: 6,  // 列A～列Fまでの総列数
      MAIN_COUNT: 5,   // 列A～列Eまでの基本列数
      BARCODE: 5       // JANコードが格納される列（F列）
    },
    STYLES: {
      CELL_CLASS: 'border p-2',
      COLUMN_WIDTHS: {
        PRODUCT_CODE: 'min-w-[100px]',    // C-1列（商品コード）
        PRODUCT_NAME: 'min-w-[200px]',    // 商品名列
        DEFAULT: 'min-w-[150px]'          // その他の列
      }
    }
  } as const;
  
  // バーコード関連の定数
  export const BARCODE_CONSTANTS = {
    FORMAT: 'EAN13',
    SETTINGS: {
      width: 4.8,    // 線の幅
      height: 180,   // バーコードの高さ
      fontSize: 60,  // バーコード下の文字サイズ
      margin: 2,     // バーコードの余白
      textMargin: 4  // バーコード文字の余白
    },
    DISPLAY: {
      maxWidth: 360,  // プレビュー時の最大幅（px）
      maxHeight: 120,  // プレビュー時の最大高さ（px）
      previewScale: '80%' // プレビュー時のスケール
    }
  } as const;
  
  // JANコード検証用の定数
  export const JAN_CODE = {
  PATTERN: /^\d{12}$/
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
    MARGIN: 2.5,    // mm
    LINE_HEIGHT: 2.5,  // mm
    FONT_SIZE: 6,
    COLUMN_B_OFFSET: 1.0  // 列B、C、D,EのY軸方向オフセット（mm）
  },
  BORDER: {
    WIDTH: 0.5
  },
  BARCODE: {
    HEIGHT_SCALE: 0.45  // コンテナの高さの80%
  }
} as const;
