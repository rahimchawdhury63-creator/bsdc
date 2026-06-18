import type { HTMLAttributes, ReactNode } from 'react';

/** Props for a simple semantic card container. */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
}

/** Card component used by auth pages and future dashboards. */
export const Card = ({ children, className = '', ...props }: CardProps) => (
  <div className={`card ${className}`.trim()} {...props}>{children}</div>
);
