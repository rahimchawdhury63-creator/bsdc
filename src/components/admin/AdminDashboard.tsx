import { useAdminMetrics } from '@/hooks/useAdmin';

/** Admin analytics dashboard using real Firestore collection counts. */
export const AdminDashboard = () => { const { metrics, error } = useAdminMetrics(); return <section className="admin-card"><h1>Admin dashboard</h1>{error?<p className="form-error">{error}</p>:null}<div className="admin-metric-grid">{metrics.map((metric)=><article className="admin-kpi" key={metric.id}><span>{metric.label}</span><strong className="admin-kpi__value">{metric.value}</strong></article>)}</div></section>; };
