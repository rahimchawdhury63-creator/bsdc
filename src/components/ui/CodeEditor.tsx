import type { TextareaHTMLAttributes } from 'react';

/** Code editor shell styled for snippets; Monaco can be lazy-loaded in advanced forms. */
export const CodeEditor = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className="form-input code-editor-area" rows={12} spellCheck={false} {...props} />
);
