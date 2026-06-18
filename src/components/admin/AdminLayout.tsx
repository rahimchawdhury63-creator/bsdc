import { Outlet } from 'react-router-dom';
import { AdminNav } from './AdminNav';
/** Protected admin panel layout with section navigation. */
export const AdminLayout = () => <section className="admin-panel"><AdminNav /><div className="admin-content"><Outlet /></div></section>;
