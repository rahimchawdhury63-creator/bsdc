import { Link } from 'react-router-dom';

/** Conversation list placeholder without fake conversations. */
export const ConversationList = () => <section className="messenger-panel"><h1>Messenger</h1><p className="text-muted">Your real conversations will appear here after they are created in Firestore.</p><Link className="button button--primary" to="/messenger/new">Start conversation</Link></section>;
