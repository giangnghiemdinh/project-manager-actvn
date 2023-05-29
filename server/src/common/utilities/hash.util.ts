import bcrypt from 'bcrypt';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export async function generateHash(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hashSync(password, salt);
}

export function hashToken(token: string) {
  return bcrypt.hashSync(token, 10);
}

/**
 * validate text with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function validateHash(
  password: string | undefined,
  hash: string | undefined,
): Promise<boolean> {
  if (!password || !hash) {
    return Promise.resolve(false);
  }

  return bcrypt.compare(password, hash);
}

const IV_LENGTH = 16; // Với AES, IV gồm 16 ký tự

export function encrypt(text: string, encryptionKey: string): string {
  encryptionKey = createHash('sha256')
    .update(String(encryptionKey))
    .digest('base64')
    .slice(0, 32);
  const iv = Buffer.from(randomBytes(IV_LENGTH))
    .toString('hex')
    .slice(0, IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv + ':' + encrypted.toString('hex');
}

export function decrypt(text: string, encryptionKey: string): string {
  encryptionKey = createHash('sha256')
    .update(String(encryptionKey))
    .digest('base64')
    .slice(0, 32);
  const textParts: string[] = text.includes(':') ? text.split(':') : [];
  const iv = Buffer.from(textParts.shift() || '', 'binary');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = createDecipheriv(
    'aes-256-cbc',
    Buffer.from(encryptionKey),
    iv,
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
