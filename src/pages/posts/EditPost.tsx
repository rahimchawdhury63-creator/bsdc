import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Spinner } from '@components/ui/Spinner';
import { usePost } from '@/hooks/usePost';
import { SEOHead } from '@components/seo/SEOHead';

/** Simple protected post edit page for title, content, and excerpt. */
export const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { post, isLoading, error, update } = usePost(id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (isLoading) return <div className="feed-status"><Spinner /></div>;
  if (error) return <div className="feed-status feed-status--error">{error}</div>;
  if (!post || !id) return <div className="feed-empty">Post not found</div>;

  const submit = async () => {
    const ok = await update(id, { title: title || post.title, content: content || post.content, excerpt: (content || post.content).slice(0, 180) });
    if (ok) navigate(`/post/${id}`);
  };

  return (
    <section className="post-form-card" aria-labelledby="edit-post-title">
      <SEOHead title="Edit post" canonicalPath={`/post/${id}/edit`} noIndex />
      <h1 id="edit-post-title">Edit post</h1>
      <div className="auth-form">
        <Input id="edit-title" label="Title" defaultValue={post.title} onChange={(event) => setTitle(event.target.value)} />
        <textarea className="form-input" rows={8} defaultValue={post.content} onChange={(event) => setContent(event.target.value)} />
        <Button type="button" onClick={() => void submit()}>Save changes</Button>
      </div>
    </section>
  );
};
