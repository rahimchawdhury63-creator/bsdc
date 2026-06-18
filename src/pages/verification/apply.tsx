import { SEOHead } from '@components/seo/SEOHead';
import { VerificationForm } from '@components/verification/VerificationForm';
import { VerificationStatus } from '@components/verification/VerificationStatus';

/** Verification application page. */
export const VerificationApplyPage = () => <><SEOHead title="Verification" canonicalPath="/verification/apply" noIndex /><div className="wallet-grid"><VerificationForm /><VerificationStatus /></div></>;
