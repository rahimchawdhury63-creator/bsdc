import type { ReactNode } from 'react';

/** Generic responsive admin table shell for real Firestore rows. */
export const AdminDataTable = ({ title, children }: { readonly title: string; readonly children: ReactNode }) => <section className="admin-card"><h1>{title}</h1><div className="admin-table-wrap">{children}</div></section>;
