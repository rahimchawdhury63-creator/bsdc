import { Outlet } from 'react-router-dom';

/** Admin layout placeholder used by future admin routes in Response 9. */
export const AdminLayout = () => (
  <section className="admin-shell" aria-label="BSDC admin panel">
    <Outlet />
  </section>
);
