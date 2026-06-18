import { GenericPostForm } from './GenericPostForm';

/** Poll form that stores Firestore poll options with zero starting votes. */
export const PollPostForm = () => <GenericPostForm type="poll" heading="Create poll" poll />;
