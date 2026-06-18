import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { TagInput } from '@components/ui/TagInput';
import { useAuth } from '@/hooks/useAuth';
import { useCommunity } from '@/hooks/useCommunity';

/** Community creation form writing real community documents to Firestore. */
export const CreateCommunity = () => {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const { create, error } = useCommunity();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<readonly string[]>([]);
  const [rulesText, setRulesText] = useState('');

  const submit = async () => {
    if (!firebaseUser) return;
    const id = await create({ name, description, creatorId: firebaseUser.uid, tags, rules: rulesText.split('\n').map((rule) => rule.trim()).filter(Boolean), isPrivate: false });
    if (id) navigate('/communities');
  };

  return <section className="surface-card"><h1>Create community</h1><div className="auth-form"><Input id="community-name" label="Name" value={name} onChange={(event) => setName(event.target.value)} /><Input id="community-description" label="Description" value={description} onChange={(event) => setDescription(event.target.value)} /><TagInput id="community-tags" label="Tags" tags={tags} onChange={setTags} /><textarea className="form-input" rows={4} placeholder="One rule per line" value={rulesText} onChange={(event) => setRulesText(event.target.value)} /><Button type="button" onClick={() => void submit()}>Create community</Button>{error ? <p className="form-error">{error}</p> : null}</div></section>;
};
