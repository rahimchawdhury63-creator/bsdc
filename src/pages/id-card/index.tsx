import { SEOHead } from '@components/seo/SEOHead';
import { DeveloperIDCard } from '@components/profile/DeveloperIDCard';
import { useAuth } from '@/hooks/useAuth';
/** Developer ID card page for the authenticated profile. */
export const IDCardPage = () => { const { profile }=useAuth(); return <><SEOHead title="Developer ID Card" canonicalPath="/id-card" noIndex />{profile?<DeveloperIDCard profile={profile}/>:<section className="surface-card"><h1>Login required</h1></section>}</>; };
