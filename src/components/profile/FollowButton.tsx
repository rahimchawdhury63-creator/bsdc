import { Button } from '@components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';

/** Follow/unfollow button that writes to the real follows collection. */
export const FollowButton = ({ targetUserId }: { readonly targetUserId: string }) => {
  const { firebaseUser } = useAuth();
  const { toggle, isSaving, error } = useFollow();

  if (!firebaseUser || firebaseUser.uid === targetUserId) return null;

  return (
    <div className="follow-action">
      <Button type="button" icon="plus" isLoading={isSaving} onClick={() => void toggle(firebaseUser.uid, targetUserId)}>Follow or unfollow</Button>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
};
