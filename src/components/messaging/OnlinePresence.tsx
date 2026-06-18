import { usePresence } from '@/hooks/usePresence';

/** Live online/offline indicator backed by RTDB presence. */
export const OnlinePresence = ({ uid }: { readonly uid: string }) => {
  const presence = usePresence(undefined, uid);
  return <span className={`presence-dot ${presence?.online ? 'presence-dot--online' : ''}`.trim()}>{presence?.online ? 'Online' : 'Offline'}</span>;
};
