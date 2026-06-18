import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@components/ui/Button';
import { CodeEditor } from '@components/ui/CodeEditor';
import { ImageUploader } from '@components/ui/ImageUploader';
import { Input } from '@components/ui/Input';
import { RichTextEditor } from '@components/ui/RichTextEditor';
import { TagInput } from '@components/ui/TagInput';
import { useAuth } from '@/hooks/useAuth';
import { usePost } from '@/hooks/usePost';
import type { PostLocation, PostType, PostVisibility } from '@/types';
import { LocationPicker } from './LocationPicker';

/** Validation schema shared by all post forms. */
const postFormSchema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters.').max(160, 'Title is too long.'),
  content: z.string().min(8, 'Content must be at least 8 characters.'),
  excerpt: z.string().max(220, 'Excerpt is too long.').optional(),
  visibility: z.enum(['public', 'followers', 'private']),
  codeContent: z.string().optional(),
  language: z.string().optional(),
  pollOptionsText: z.string().optional()
});

type PostFormValues = z.infer<typeof postFormSchema>;

/** Props configuring the generic form for a specific post type. */
export interface GenericPostFormProps {
  readonly type: PostType;
  readonly heading: string;
  readonly requireImages?: boolean;
  readonly richText?: boolean;
  readonly code?: boolean;
  readonly poll?: boolean;
}

/**
 * Generic Firestore-backed post form used by all fifteen post type wrappers.
 * The form writes directly to the real posts collection through post.service and
 * never creates placeholder documents or local-only demo content.
 */
export const GenericPostForm = ({ type, heading, requireImages = false, richText = false, code = false, poll = false }: GenericPostFormProps) => {
  const navigate = useNavigate();
  const { firebaseUser, isAuthenticated } = useAuth();
  const { create } = usePost();
  const [tags, setTags] = useState<readonly string[]>([]);
  const [imageUrls, setImageUrls] = useState<readonly string[]>([]);
  const [location, setLocation] = useState<PostLocation | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: { title: '', content: '', excerpt: '', visibility: 'public', codeContent: '', language: '', pollOptionsText: '' }
  });

  const content = watch('content');
  const codeContent = watch('codeContent') || '';

  const onSubmit = handleSubmit(async (values) => {
    if (!isAuthenticated || !firebaseUser) {
      setFormError('You must login before creating a post.');
      return;
    }

    if (requireImages && imageUrls.length === 0) {
      setFormError('Upload at least one image for this post type.');
      return;
    }

    const pollOptions = poll
      ? (values.pollOptionsText || '')
          .split('\n')
          .map((label, index) => ({ id: `option-${index + 1}`, label: label.trim(), votesCount: 0 }))
          .filter((option) => option.label.length > 0)
      : undefined;

    if (poll && (!pollOptions || pollOptions.length < 2)) {
      setFormError('Polls require at least two options, one per line.');
      return;
    }

    const postId = await create({
      type,
      authorId: firebaseUser.uid,
      title: values.title,
      content: values.content,
      excerpt: values.excerpt || '',
      imageUrls,
      codeContent: values.codeContent,
      language: values.language,
      tags,
      location: location || undefined,
      visibility: values.visibility as PostVisibility,
      pollOptions
    });

    if (postId) {
      navigate(`/post/${postId}`, { replace: true });
    } else {
      setFormError('Unable to publish post. Check your connection and Firebase rules.');
    }
  });

  return (
    <section className="post-form-card" aria-labelledby="post-form-title">
      <header className="auth-card__header">
        <h1 id="post-form-title">{heading}</h1>
        <p className="text-muted">Publish real BSDC content to Firebase Firestore.</p>
      </header>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <Input id="post-title" label="Title" error={errors.title?.message} {...register('title')} />
        {richText ? (
          <div className="form-field">
            <label className="form-label" htmlFor="post-content">Content</label>
            <RichTextEditor id="post-content" value={content} onChange={(event) => setValue('content', event.target.value, { shouldValidate: true })} />
            {errors.content?.message ? <p className="form-error">{errors.content.message}</p> : null}
          </div>
        ) : (
          <Input id="post-content" label="Content" error={errors.content?.message} {...register('content')} />
        )}
        <Input id="post-excerpt" label="SEO excerpt" helperText="Optional. BSDC can generate one from content." error={errors.excerpt?.message} {...register('excerpt')} />
        <ImageUploader imageUrls={imageUrls} onChange={setImageUrls} />
        {code ? (
          <>
            <Input id="post-language" label="Programming language" {...register('language')} />
            <div className="form-field">
              <label className="form-label" htmlFor="post-code">Code content</label>
              <CodeEditor id="post-code" value={codeContent} onChange={(event) => setValue('codeContent', event.target.value)} />
            </div>
          </>
        ) : null}
        {poll ? (
          <div className="form-field">
            <label className="form-label" htmlFor="post-poll-options">Poll options</label>
            <textarea className="form-input" id="post-poll-options" rows={5} placeholder="One option per line" {...register('pollOptionsText')} />
          </div>
        ) : null}
        <TagInput id="post-tags" label="Tags" tags={tags} onChange={setTags} />
        <LocationPicker value={location} onChange={setLocation} />
        <div className="form-field">
          <label className="form-label" htmlFor="post-visibility">Visibility</label>
          <select className="form-input" id="post-visibility" {...register('visibility')}>
            <option value="public">Public</option>
            <option value="followers">Followers only</option>
            <option value="private">Private</option>
          </select>
        </div>
        {formError ? <p className="form-error" role="alert">{formError}</p> : null}
        <Button type="submit" icon="plus" isLoading={isSubmitting}>Publish post</Button>
      </form>
    </section>
  );
};
