import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Address Decoding', () => {
  describe('Base64 Normalization', () => {
    function b64Normalize(b64: string): string {
      return (b64 || '').replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
    }

    it('should normalize URL-safe base64 to standard base64', () => {
      expect(b64Normalize('abc-def_ghi')).toBe('abc+def/ghi');
    });

    it('should remove whitespace', () => {
      expect(b64Normalize('abc def\nghi')).toBe('abcdefghi');
    });

    it('should handle empty string', () => {
      expect(b64Normalize('')).toBe('');
    });

    it('should handle already normalized base64', () => {
      expect(b64Normalize('abc+def/ghi')).toBe('abc+def/ghi');
    });
  });

  describe('Base64 to Bytes', () => {
    function b64Normalize(b64: string): string {
      return (b64 || '').replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
    }

    function b64ToBytes(b64: string): Uint8Array {
      const norm = b64Normalize(b64);
      const binStr = atob(norm);
      const len = binStr.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
      }
      return arr;
    }

    it('should decode valid base64', () => {
      const encoded = btoa('Hello World');
      const decoded = b64ToBytes(encoded);
      const text = new TextDecoder().decode(decoded);
      expect(text).toBe('Hello World');
    });

    it('should decode URL-safe base64', () => {
      // "Hello" in base64: SGVsbG8=
      const urlSafe = 'SGVsbG8';
      const decoded = b64ToBytes(urlSafe);
      const text = new TextDecoder().decode(decoded);
      expect(text).toBe('Hello');
    });

    it('should handle empty string', () => {
      const decoded = b64ToBytes('');
      expect(decoded.length).toBe(0);
    });
  });

  describe('Telekom Address Decoding', () => {
    function b64Normalize(b64: string): string {
      return (b64 || '').replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
    }

    function b64ToBytes(b64: string): Uint8Array {
      const norm = b64Normalize(b64);
      const binStr = atob(norm);
      const len = binStr.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
      }
      return arr;
    }

    function decodeTelekomAddition(encBase64: string): object | null {
      if (!encBase64) return null;
      
      try {
        const bytes = b64ToBytes(encBase64);
        const txt = new TextDecoder().decode(bytes);
        return JSON.parse(txt);
      } catch {
        return null;
      }
    }

    it('should decode valid base64 JSON', () => {
      const data = { strasse: 'Teststrasse', hausnummer: '42' };
      const encoded = btoa(JSON.stringify(data));
      const decoded = decodeTelekomAddition(encoded);
      
      expect(decoded).toEqual(data);
    });

    it('should return null for invalid base64', () => {
      const decoded = decodeTelekomAddition('invalid!!!');
      expect(decoded).toBeNull();
    });

    it('should return null for empty string', () => {
      const decoded = decodeTelekomAddition('');
      expect(decoded).toBeNull();
    });

    it('should return null for base64 with invalid JSON', () => {
      const encoded = btoa('not a json');
      const decoded = decodeTelekomAddition(encoded);
      expect(decoded).toBeNull();
    });
  });

  describe('Address Extraction', () => {
    interface Address {
      strasse?: string;
      hausnummer?: string;
      plz?: string;
      ort?: string;
      ortsteil?: string;
    }

    function extractAddress(obj: any): Address | null {
      if (!obj || typeof obj !== 'object') return null;
      
      const addr: Address = {};
      if (obj.strasse) addr.strasse = String(obj.strasse);
      if (obj.hausnummer) addr.hausnummer = String(obj.hausnummer);
      if (obj.plz) addr.plz = String(obj.plz);
      if (obj.ort) addr.ort = String(obj.ort);
      if (obj.ortsteil) addr.ortsteil = String(obj.ortsteil);
      
      return Object.keys(addr).length > 0 ? addr : null;
    }

    it('should extract complete address', () => {
      const input = {
        strasse: 'Teststraße',
        hausnummer: '42',
        plz: '12345',
        ort: 'Berlin',
        ortsteil: 'Mitte'
      };
      
      expect(extractAddress(input)).toEqual(input);
    });

    it('should extract partial address', () => {
      const input = { strasse: 'Teststraße', hausnummer: '42' };
      expect(extractAddress(input)).toEqual(input);
    });

    it('should return null for empty object', () => {
      expect(extractAddress({})).toBeNull();
    });

    it('should return null for null input', () => {
      expect(extractAddress(null)).toBeNull();
    });

    it('should convert numbers to strings', () => {
      const input = { hausnummer: 42, plz: 12345 };
      const result = extractAddress(input);
      
      expect(result).toEqual({
        hausnummer: '42',
        plz: '12345'
      });
    });
  });
});
