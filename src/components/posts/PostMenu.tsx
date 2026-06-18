import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { deletePost } from '@/services/post.service';
import { useAuth } from '@/hooks/useAuth';
import type { BSDCPost } from '@/types';

/** Owner/admin post menu for edit and delete actions. */
export const PostMenu = ({ post }: { readonly post: BSDCPost }) => {
  const navigate = useNavigate();
  const { firebaseUser, profile } = useAuth();
  const canManage = firebaseUser?.uid === post.authorId || profile?.role === 'admin' || profile?.role === 'super_admin';

  if (!canManage) {
    return null;
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this post permanently?');
    if (!confirmed) return;
    const result = await deletePost(post.id);
    if (result.ok) {
      navigate('/feed', { replace: true });
    }
  };

  return (
    <section className="post-menu" aria-label="Manage post">
      <Button type="button" variant="secondary" onClick={() => navigate(`/post/${post.id}/edit`)}>Edit</Button>
      <Button type="button" variant="danger" onClick={() => void handleDelete()}>Delete</Button>
    </section>
  );
};
