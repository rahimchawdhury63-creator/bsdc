import { SVGIcon } from '@components/ui/SVGIcon';

/** In-chat notice for optional AES encrypted message content. */
export const EncryptionNotice = () => <p className="encryption-notice"><SVGIcon name="shield" width={16} height={16} decorative /> Optional encrypted messaging is enabled for this conversation.</p>;
