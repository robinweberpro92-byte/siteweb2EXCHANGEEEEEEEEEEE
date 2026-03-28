function fallbackHash(input) {
  let hash = 2166136261;
  const value = String(input ?? '');
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (`00000000${(hash >>> 0).toString(16)}`).slice(-8);
}

export async function hashValue(value) {
  const input = String(value ?? '');
  const encoder = new TextEncoder();

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', encoder.encode(input));
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  return fallbackHash(input);
}

export const sha256 = hashValue;
