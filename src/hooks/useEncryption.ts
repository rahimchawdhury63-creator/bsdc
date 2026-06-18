import { createConversationKey, decryptMessageContent, encryptMessageContent } from '@/utils/encryption.utils';

/** Convenience hook exposing encryption helpers to message components. */
export const useEncryption = (participants: readonly string[]) => {
  const key = createConversationKey(participants);
  return {
    encrypt: (plainText: string) => encryptMessageContent(plainText, key),
    decrypt: (cipherText: string) => decryptMessageContent(cipherText, key)
  };
};
