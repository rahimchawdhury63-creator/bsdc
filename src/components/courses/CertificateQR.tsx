import { QRCodeSVG } from 'qrcode.react';
/** QR code for certificate verification URL. */
export const CertificateQR = ({ value }: { readonly value: string }) => <QRCodeSVG value={value} size={128} />;
