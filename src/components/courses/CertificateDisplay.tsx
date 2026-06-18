import { QRCodeSVG } from 'qrcode.react';
import type { BSDCCertificate } from '@/services/course.service';
/** Professional certificate display with QR verification. */
export const CertificateDisplay = ({ certificate }: { readonly certificate: BSDCCertificate }) => <section className="certificate-card"><h1>BSDC Certificate</h1><p>Certificate Number: {certificate.certificateNumber}</p><p>Score: {certificate.score}</p><p>Status: {certificate.passed?'Passed':'Not passed'}</p><QRCodeSVG value={certificate.verificationUrl} size={150}/></section>;
