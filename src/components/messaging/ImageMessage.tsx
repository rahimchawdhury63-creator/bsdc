/** Image message renderer for ImgBB-hosted message attachments. */
export const ImageMessage = ({ url }: { readonly url: string }) => <img className="image-message" src={url} alt="Message attachment" loading="lazy" />;
