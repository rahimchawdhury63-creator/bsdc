import { GenericPostForm } from './GenericPostForm';

/** Image post form that uploads images to ImgBB before saving Firestore URLs. */
export const ImagePostForm = () => <GenericPostForm type="image" heading="Create image post" requireImages />;
