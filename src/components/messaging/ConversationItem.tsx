import { Link } from 'react-router-dom';
import type { BSDCConversation } from '@/types';

/** Conversation preview item for Firestore conversation list rendering. */
export const ConversationItem = ({ conversation }: { readonly conversation: BSDCConversation }) => <Link className="conversation-item" to={`/messenger/${conversation.id}`}>{conversation.groupName || conversation.participants.join(', ')}</Link>;
