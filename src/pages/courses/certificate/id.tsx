import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from '@components/seo/SEOHead';
import { CertificateDisplay } from '@components/courses/CertificateDisplay';
import { getCertificateByNumber, type BSDCCertificate } from '@/services/course.service';
export const CertificatePage = () => { const { id }=useParams(); const [cert,setCert]=useState<BSDCCertificate|null>(null); useEffect(()=>{ if(id) void getCertificateByNumber(id).then((r)=>{ if(r.ok) setCert(r.data); }); },[id]); return <><SEOHead title="Certificate" canonicalPath={`/courses/certificate/${id||''}`} />{cert?<CertificateDisplay certificate={cert}/>:<section className="surface-card"><h1>Certificate not found</h1></section>}</>; };
