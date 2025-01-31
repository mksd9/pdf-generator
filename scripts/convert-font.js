// scripts/convert-font.js
const fs = require('fs');
const path = require('path');

// フォントファイルを読み込んでBase64に変換
const fontPath = path.join(__dirname, '../public/fonts/NotoSansJP-Regular.ttf');
const font = fs.readFileSync(fontPath);
const base64Font = font.toString('base64');

// TypeScriptの型定義とともにエクスポート
const output = `// このファイルは自動生成されています
// scripts/convert-font.js により生成

export const NOTO_SANS_JP_BASE64: string = '${base64Font}';
`;

// 出力ファイルに保存
const outputPath = path.join(__dirname, '../src/fonts/noto-sans-jp-base64.ts');
fs.writeFileSync(outputPath, output);

console.log('Font converted and saved successfully!');