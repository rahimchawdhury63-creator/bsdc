import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

/** Props for the controlled tag input used by all post forms. */
export interface TagInputProps {
  readonly id: string;
  readonly label: string;
  readonly tags: readonly string[];
  readonly onChange: (tags: readonly string[]) => void;
}

/** Accessible tag input that stores plain text tags without unsafe HTML. */
export const TagInput = ({ id, label, tags, onChange }: TagInputProps) => {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const normalized = draft.toLowerCase().trim();
    if (normalized && !tags.includes(normalized)) {
      onChange([...tags, normalized]);
    }
    setDraft('');
  };

  const removeTag = (tag: string) => onChange(tags.filter((item) => item !== tag));

  return (
    <div className="form-field">
      <Input id={id} label={label} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          addTag();
        }
      }} />
      <Button type="button" variant="secondary" onClick={addTag}>Add tag</Button>
      <div className="tag-row" aria-label="Selected tags">
        {tags.map((tag) => <button className="tag tag--button" type="button" key={tag} onClick={() => removeTag(tag)}>{tag}</button>)}
      </div>
    </div>
  );
};
