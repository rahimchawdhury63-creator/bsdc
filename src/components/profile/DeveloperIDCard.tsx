import { QRCodeSVG } from 'qrcode.react';
import { SITE_URL } from '@config/constants';
import type { BSDCUser } from '@/types';

/** Download-ready developer identity card with QR verification URL. */
export const DeveloperIDCard = ({ profile }: { readonly profile: BSDCUser }) => (
  <section className="developer-id-card" aria-labelledby="developer-id-title">
    <h2 id="developer-id-title">Developer ID Card</h2>
    <p>{profile.displayName}</p>
    <p>BSDC ID: {profile.uid}</p>
    <QRCodeSVG value={`${SITE_URL}/p/${profile.username}`} size={112} />
  </section>
);
