import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { SVGIcon, type SVGIconName } from './SVGIcon';

/** Button visual variants mapped to external CSS classes. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Props for the accessible BSDC button component. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly icon?: SVGIconName;
  readonly isLoading?: boolean;
  readonly children: ReactNode;
}

/**
 * Reusable button with SVG-only icon support and loading state.
 * The component never uses inline styles, so all layout remains controlled by
 * external CSS files as required for production maintainability.
 */
export const Button = ({ variant = 'primary', icon, isLoading = false, children, disabled, className = '', ...props }: ButtonProps) => (
  <button className={`button button--${variant} ${className}`.trim()} disabled={disabled || isLoading} {...props}>
    {isLoading ? <span className="spinner spinner--small" aria-hidden="true" /> : icon ? <SVGIcon name={icon} width={20} height={20} decorative /> : null}
    <span>{children}</span>
  </button>
);
