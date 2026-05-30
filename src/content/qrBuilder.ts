// Minimal QR SVG builder wrapping the qrcode package
// Used in the content script where we can't use React

import QRCodeLib from 'qrcode';

export function buildQRSVG(value: string, size: number, fg: string, bg: string): string {
  // qrcode.toString is async — we use a sync canvas-free approach
  // by generating the matrix synchronously
  try {
    const matrix = getQRMatrix(value);
    if (!matrix) return errorSVG(size, bg);
    return matrixToSVG(matrix, size, fg, bg);
  } catch {
    return errorSVG(size, bg);
  }
}

function errorSVG(size: number, bg: string): string {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${bg}" rx="4"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="#e05c5c" font-size="10" font-family="monospace">QR err</text>
  </svg>`;
}

// Use qrcode lib to get the data matrix synchronously via its internal API
function getQRMatrix(value: string): boolean[][] | null {
  try {
    // qrcode exposes a create function we can use
    const qr = (QRCodeLib as any).create(value, { errorCorrectionLevel: 'M' });
    const modules = qr.modules;
    const size = modules.size;
    const matrix: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      matrix[r] = [];
      for (let c = 0; c < size; c++) {
        matrix[r][c] = modules.get(r, c);
      }
    }
    return matrix;
  } catch {
    return null;
  }
}

function matrixToSVG(matrix: boolean[][], size: number, fg: string, bg: string): string {
  const cells = matrix.length;
  const margin = 2;
  const cellSize = (size - margin * 2) / cells;
  let rects = '';

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (matrix[r][c]) {
        const x = (margin + c * cellSize).toFixed(2);
        const y = (margin + r * cellSize).toFixed(2);
        const w = (cellSize + 0.1).toFixed(2); // slight overlap to avoid gaps
        rects += `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${fg}"/>`;
      }
    }
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="${bg}" rx="6"/>
    ${rects}
  </svg>`;
}
