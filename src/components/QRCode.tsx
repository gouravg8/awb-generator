import React, { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';

interface Props {
  value: string;
  size?: number;
  fg?: string;
  bg?: string;
}

const QRCode: React.FC<Props> = ({ value, size = 148, fg = '#f0ede8', bg = '#1a1917' }) => {
  const [svgString, setSvgString] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!value) return;
    setError(false);
    QRCodeLib.toString(value, {
      type: 'svg',
      color: { dark: fg, light: bg },
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
    })
      .then(svg => setSvgString(svg))
      .catch(() => setError(true));
  }, [value, size, fg, bg]);

  if (error) return <div style={{ color: '#e05c5c', fontSize: 11 }}>QR failed</div>;
  if (!svgString) return <div style={{ width: size, height: size, background: bg, borderRadius: 6 }} />;

  return (
    <div
      style={{ width: size, height: size, borderRadius: 8, overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};

export default QRCode;
