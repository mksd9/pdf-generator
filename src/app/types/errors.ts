export class ExcelProcessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExcelProcessError';
  }
}

export class BarcodeGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BarcodeGenerationError';
  }
}

export class PDFGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PDFGenerationError';
  }
}
