import CryptoJS from 'crypto-js';

/** Creates a deterministic room key from participant IDs when no custom key is supplied. */
export const createConversationKey = (participantIds: readonly string[]): string => participantIds.slice().sort().join(':');

/** Encrypts plain message content with AES for optional E2E-style messaging. */
export const encryptMessageContent = (plainText: string, key: string): string => CryptoJS.AES.encrypt(plainText, key).toString();

/** Decrypts message content and falls back to an empty string when the key is invalid. */
export const decryptMessageContent = (cipherText: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
};
