import type { TextareaHTMLAttributes } from 'react';

/** Lightweight rich text editor shell; TipTap integration expands in later content-heavy modules. */
export const RichTextEditor = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className="form-input rich-text-area" rows={10} {...props} />
);
