import type { InputHTMLAttributes } from 'react';

/** Props for the labeled input component used by auth and settings forms. */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string | undefined;
  readonly helperText?: string | undefined;
}

/**
 * Accessible labeled input with error text and helper text support.
 * IDs are mandatory for correct label and aria-describedby relationships.
 */
export const Input = ({ id, label, error, helperText, className = '', ...props }: InputProps) => {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>{label}</label>
      <input className={`form-input ${error ? 'form-input--error' : ''} ${className}`.trim()} id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      {helperText ? <p className="form-helper" id={helperId}>{helperText}</p> : null}
      {error ? <p className="form-error" id={errorId}>{error}</p> : null}
    </div>
  );
};
