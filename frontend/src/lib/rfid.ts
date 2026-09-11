/**
 * Util RFID untuk scanner keyboard-wedge (tap -> ketik UID + Enter).
 * Scanner milik user bertipe ini: tidak perlu driver, cukup baca input cepat.
 */

/** UID valid: hex uppercase 8-10 char (Mifare umum 8 hex / 10 digit). */
export function normalizeUid(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function isValidUid(uid: string): boolean {
  const v = normalizeUid(uid);
  return /^[0-9A-F]{8}$/.test(v) || /^[0-9A-F]{10}$/.test(v) || /^[0-9]{8,10}$/.test(v);
}

/** Samarkan UID untuk tampilan: "A1B2C3D4" -> "••••C3D4". */
export function maskUid(uid: string): string {
  const v = normalizeUid(uid);
  if (v.length <= 4) return '••••';
  return '••••' + v.slice(-4);
}

/**
 * Heuristik bedakan scan vs ketikan manual:
 * scanner mengetik ~5-30ms/karakter, manusia >80ms.
 * Dipakai di useRfidScan.
 */
export function looksLikeScan(charIntervalsMs: number[], length: number): boolean {
  if (length < 8) return false;
  if (charIntervalsMs.length === 0) return true;
  const avg = charIntervalsMs.reduce((a, b) => a + b, 0) / charIntervalsMs.length;
  return avg < 80;
}
