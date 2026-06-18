import { AdminDataTable } from '@components/admin/AdminDataTable';
export const AdminNavigationPage = () => <AdminDataTable title="Admin navigation"><p className="text-muted">This admin section is route-ready and protected. It will operate only on real Firestore data when records exist.</p></AdminDataTable>;
