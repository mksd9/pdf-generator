// アプリケーション全般で使用する定数
export const APP_CONSTANTS = {
    TITLE: 'ラベル44面　シート出力',
    SHEET_CONTENT_TITLE: 'シートの内容:',
    BUTTON_TEXT: {
      GENERATING: 'PDF生成中...',
      GENERATE: 'PDFを出力'
    },
    BORDER_OPTIONS: {
      HIDE: '枠線を出力しない',
      SHOW: '枠線を出力する'
    }
  } as const;
  
  // ファイル関連の定数
  export const FILE_CONSTANTS = {
    EXCEL_TYPE: '.xlsx',
    PDF_FILENAME: 'data_confirmation.pdf',
    PDF_MIME_TYPE: 'application/pdf',
    IMAGE_MIME_TYPE: 'image/png'
  } as const;
  
  // エラーメッセージ
  export const ERROR_MESSAGES = {
    EXCEL_PROCESS: 'エクセルファイルの処理中にエラーが発生しました',
    PDF_GENERATE: 'PDFの生成に失敗しました: ',
    UNKNOWN: '不明なエラーが発生しました'
  } as const;
  
  // 確認メッセージ
  export const CONFIRM_MESSAGES = {
    DOWNLOAD_PDF: 'PDFをダウンロードしますか？'
  } as const;
